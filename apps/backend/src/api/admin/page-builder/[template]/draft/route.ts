import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"
import type { PageTemplate } from "../../../../../page-builder/types"

const ALLOWED_TEMPLATES = ["home"] as const

/**
 * PUT /admin/page-builder/:template/draft
 *
 * Salva um rascunho do template sem publicar. Usado pelo editor visual
 * para preview em tempo real — o storefront lê via ?draft=1.
 * Não valida settings (rascunho pode estar incompleto).
 */
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const tpl = req.params.template
  if (!ALLOWED_TEMPLATES.includes(tpl as (typeof ALLOWED_TEMPLATES)[number])) {
    return res.status(404).json({ error: "template_not_supported" })
  }

  const incoming = (req.body as Record<string, unknown>)?.template
  if (!incoming || typeof incoming !== "object") {
    return res.status(400).json({ error: "template ausente no body" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "metadata"],
  })
  const store = stores[0]
  if (!store) return res.status(500).json({ error: "no_store" })

  const newMeta: Record<string, unknown> = {
    ...((store.metadata ?? {}) as Record<string, unknown>),
    [`page_template_${tpl}_draft`]: {
      ...(incoming as PageTemplate),
      updated_at: new Date().toISOString(),
    },
  }

  await updateStoresWorkflow(req.scope).run({
    input: {
      selector: { id: store.id },
      update: { metadata: newMeta },
    },
  })

  return res.json({ ok: true })
}
