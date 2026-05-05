import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/products/:id/vehicles
 *
 * Lista pública dos veículos compatíveis com um produto. Usada pelo
 * bloco "Veículos compatíveis" na página do produto do storefront.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "vehicles.*"],
    filters: { id: req.params.id },
  })

  const product = data[0]
  if (!product) return res.status(404).json({ error: "not_found" })

  const vehicles = ((product as { vehicles?: unknown[] }).vehicles ?? []) as Array<{
    id: string
    make: string
    model: string
    year: number
    trim: string | null
    body_type: string | null
    slug: string
  }>

  // Ordena: marca → modelo → ano descendente
  vehicles.sort((a, b) => {
    if (a.make !== b.make) return a.make.localeCompare(b.make)
    if (a.model !== b.model) return a.model.localeCompare(b.model)
    return b.year - a.year
  })

  return res.json({ product_id: req.params.id, vehicles, count: vehicles.length })
}
