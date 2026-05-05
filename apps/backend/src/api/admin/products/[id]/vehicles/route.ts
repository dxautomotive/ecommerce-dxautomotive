import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { VEHICLE_COMPATIBILITY_MODULE } from "../../../../../modules/vehicle_compatibility"

/**
 * GET    /admin/products/:id/vehicles  → veículos compatíveis com o produto
 * POST   /admin/products/:id/vehicles  → adicionar links { vehicle_ids: string[] }
 * DELETE /admin/products/:id/vehicles  → remover links { vehicle_ids: string[] }
 */

type LinksBody = { vehicle_ids?: string[] }

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "vehicles.*"],
    filters: { id: req.params.id },
  })

  const product = data[0]
  if (!product) return res.status(404).json({ error: "not_found" })

  return res.json({
    product_id: product.id,
    vehicles: (product as { vehicles?: unknown[] }).vehicles ?? [],
  })
}

export async function POST(
  req: MedusaRequest<LinksBody>,
  res: MedusaResponse
) {
  const ids = Array.isArray(req.body.vehicle_ids) ? req.body.vehicle_ids : []
  if (ids.length === 0) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "vehicle_ids vazio" })
  }

  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

  await link.create(
    ids.map((vid) => ({
      [Modules.PRODUCT]: { product_id: req.params.id },
      [VEHICLE_COMPATIBILITY_MODULE]: { vehicle_id: vid },
    }))
  )

  return res.status(201).json({ linked: ids.length })
}

export async function DELETE(
  req: MedusaRequest<LinksBody>,
  res: MedusaResponse
) {
  const ids = Array.isArray(req.body.vehicle_ids) ? req.body.vehicle_ids : []
  if (ids.length === 0) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "vehicle_ids vazio" })
  }

  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

  await link.dismiss(
    ids.map((vid) => ({
      [Modules.PRODUCT]: { product_id: req.params.id },
      [VEHICLE_COMPATIBILITY_MODULE]: { vehicle_id: vid },
    }))
  )

  return res.status(200).json({ unlinked: ids.length })
}
