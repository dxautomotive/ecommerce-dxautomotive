import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PRODUCT_RELATIONSHIPS_MODULE } from "../../../../modules/product_relationships"
import ProductRelationshipsModuleService from "../../../../modules/product_relationships/service"

type PatchBody = {
  position?: number
}

export async function PATCH(
  req: MedusaRequest<PatchBody>,
  res: MedusaResponse
) {
  const service = req.scope.resolve<ProductRelationshipsModuleService>(
    PRODUCT_RELATIONSHIPS_MODULE
  )
  const update: Record<string, unknown> = {}
  if (typeof req.body.position === "number") update.position = req.body.position
  if (Object.keys(update).length === 0) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "Nada para atualizar" })
  }
  const rel = await service.updateProductRelationships({
    id: req.params.id,
    ...update,
  })
  return res.json({ relationship: rel })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductRelationshipsModuleService>(
    PRODUCT_RELATIONSHIPS_MODULE
  )
  await service.deleteProductRelationships(req.params.id)
  return res.status(204).send()
}
