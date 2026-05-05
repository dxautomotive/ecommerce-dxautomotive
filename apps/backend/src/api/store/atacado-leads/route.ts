import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ATACADO_LEADS_MODULE } from "../../../modules/atacado_leads"
import AtacadoLeadsModuleService from "../../../modules/atacado_leads/service"

type CreateLeadBody = {
  name?: string
  company?: string
  cnpj?: string
  email?: string
  phone?: string
  city?: string
  province?: string
  segment?: string
  monthly_volume?: string
  message?: string
  source?: string
}

const REQUIRED_FIELDS = ["name", "email", "phone"] as const

const sanitize = (s: unknown): string | null => {
  if (typeof s !== "string") return null
  const trimmed = s.trim().slice(0, 1000)
  return trimmed.length > 0 ? trimmed : null
}

export async function POST(
  req: MedusaRequest<CreateLeadBody>,
  res: MedusaResponse
) {
  const body = req.body ?? {}

  const missing = REQUIRED_FIELDS.filter((k) => !sanitize(body[k]))
  if (missing.length > 0) {
    return res.status(400).json({
      error: "validation_error",
      message: `Campos obrigatórios faltando: ${missing.join(", ")}`,
      missing,
    })
  }

  const service =
    req.scope.resolve<AtacadoLeadsModuleService>(ATACADO_LEADS_MODULE)

  const lead = await service.createAtacadoLeads({
    name: sanitize(body.name)!,
    company: sanitize(body.company),
    cnpj: sanitize(body.cnpj),
    email: sanitize(body.email)!,
    phone: sanitize(body.phone)!,
    city: sanitize(body.city),
    province: sanitize(body.province),
    segment: sanitize(body.segment),
    monthly_volume: sanitize(body.monthly_volume),
    message: sanitize(body.message),
    source: sanitize(body.source) ?? "website",
  })

  return res.status(201).json({ id: lead.id, status: lead.status })
}
