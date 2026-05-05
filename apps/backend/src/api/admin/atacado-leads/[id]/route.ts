import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ATACADO_LEADS_MODULE } from "../../../../modules/atacado_leads"
import AtacadoLeadsModuleService from "../../../../modules/atacado_leads/service"

const ALLOWED_STATUS = ["new", "contacted", "quoted", "won", "lost", "spam"]

type PatchBody = {
  status?: string
  internal_notes?: string
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const service =
    req.scope.resolve<AtacadoLeadsModuleService>(ATACADO_LEADS_MODULE)
  const lead = await service
    .retrieveAtacadoLead(req.params.id)
    .catch(() => null)
  if (!lead) {
    return res.status(404).json({ error: "not_found" })
  }
  return res.json({ lead })
}

export async function PATCH(
  req: MedusaRequest<PatchBody>,
  res: MedusaResponse
) {
  const service =
    req.scope.resolve<AtacadoLeadsModuleService>(ATACADO_LEADS_MODULE)

  const update: Record<string, unknown> = {}
  if (req.body.status) {
    if (!ALLOWED_STATUS.includes(req.body.status)) {
      return res
        .status(400)
        .json({ error: "validation_error", message: "Status inválido" })
    }
    update.status = req.body.status
  }
  if (typeof req.body.internal_notes === "string") {
    update.internal_notes = req.body.internal_notes.trim() || null
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: "validation_error", message: "Nada para atualizar" })
  }

  const lead = await service.updateAtacadoLeads({
    id: req.params.id,
    ...update,
  })
  return res.json({ lead })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const service =
    req.scope.resolve<AtacadoLeadsModuleService>(ATACADO_LEADS_MODULE)
  await service.deleteAtacadoLeads(req.params.id)
  return res.status(204).send()
}
