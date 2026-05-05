import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ATACADO_LEADS_MODULE } from "../../../modules/atacado_leads"
import AtacadoLeadsModuleService from "../../../modules/atacado_leads/service"

const ALLOWED_STATUS = ["new", "contacted", "quoted", "won", "lost", "spam"]

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const service =
    req.scope.resolve<AtacadoLeadsModuleService>(ATACADO_LEADS_MODULE)

  const status = req.query.status as string | undefined
  const limit = Math.min(parseInt((req.query.limit as string) ?? "50", 10), 200)
  const offset = parseInt((req.query.offset as string) ?? "0", 10)

  const filters: Record<string, unknown> = {}
  if (status && ALLOWED_STATUS.includes(status)) {
    filters.status = status
  }

  const [leads, count] = await service.listAndCountAtacadoLeads(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" } as never,
  })

  return res.json({ leads, count, limit, offset })
}
