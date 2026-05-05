import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ATACADO_LEADS_MODULE } from "../modules/atacado_leads"
import AtacadoLeadsModuleService from "../modules/atacado_leads/service"

/**
 * Reage ao evento `atacado_lead.created` emitido pelo endpoint
 * `POST /store/atacado-leads`. Hoje (sem Resend configurado) faz log
 * estruturado pra ficar fácil de monitorar via console do dev.
 *
 * Quando o Notification Module com Resend estiver plugado, este
 * subscriber também vai disparar:
 *  1. E-mail interno para o time de vendas
 *  2. E-mail de confirmação para o cliente B2B
 *
 * As chaves do template já estão estruturadas no objeto `payload`
 * abaixo — pra ligar Resend basta resolver o module de notification
 * e chamar `.createNotifications({...})`.
 */
export default async function atacadoLeadCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<AtacadoLeadsModuleService>(
    ATACADO_LEADS_MODULE
  )

  const lead = await service
    .retrieveAtacadoLead(event.data.id)
    .catch(() => null)
  if (!lead) {
    logger.warn(
      `[atacado_lead.created] lead ${event.data.id} não encontrado, ignorando`
    )
    return
  }

  const payload = {
    to_internal: process.env.ATACADO_NOTIFY_EMAIL ?? "vendas@dxautomotive.com.br",
    template_internal: "atacado-lead-internal",
    template_customer: "atacado-lead-confirmation",
    data: {
      id: lead.id,
      name: lead.name,
      company: lead.company ?? "—",
      email: lead.email,
      phone: lead.phone,
      city: lead.city ?? "—",
      province: lead.province ?? "—",
      segment: lead.segment ?? "—",
      monthly_volume: lead.monthly_volume ?? "—",
      message: lead.message ?? "(sem mensagem)",
      source: lead.source,
      created_at: new Date().toISOString(),
    },
  }

  // Hoje: só log. Amanhã: disparar e-mails via Notification module.
  logger.info(
    `[atacado_lead.created] ${lead.id} · ${lead.name} (${lead.email}) · ${lead.segment ?? "sem segmento"} · ${lead.monthly_volume ?? "sem volume"}`
  )
  logger.debug(`[atacado_lead.created] payload pronto para Resend: ${JSON.stringify(payload)}`)

  // TODO: quando Notification + Resend estiverem configurados, descomentar:
  //
  // const notification = container.resolve(Modules.NOTIFICATION)
  // await notification.createNotifications([
  //   {
  //     to: payload.to_internal,
  //     channel: "email",
  //     template: payload.template_internal,
  //     data: payload.data,
  //   },
  //   {
  //     to: lead.email,
  //     channel: "email",
  //     template: payload.template_customer,
  //     data: payload.data,
  //   },
  // ])
}

export const config: SubscriberConfig = {
  event: "atacado_lead.created",
}
