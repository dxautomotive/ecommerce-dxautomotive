import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VEHICLE_COMPATIBILITY_MODULE } from "../../../../modules/vehicle_compatibility"
import VehicleCompatibilityModuleService from "../../../../modules/vehicle_compatibility/service"

/**
 * GET /store/products/by-vehicle?make=X&model=Y&year=Z
 *
 * Retorna a lista de IDs de produtos compatíveis com o veículo.
 * O storefront pega esses IDs e renderiza usando o endpoint padrão
 * `/store/products` filtrado por id.
 *
 * Se nenhum veículo bater com a combinação, retorna products: [].
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const make = (req.query.make as string | undefined)?.trim()
  const modelName = (req.query.model as string | undefined)?.trim()
  const yearRaw = req.query.year as string | undefined

  if (!make || !modelName || !yearRaw) {
    return res.status(400).json({
      error: "validation_error",
      message: "make, model e year são obrigatórios",
    })
  }

  const year = parseInt(yearRaw, 10)
  if (!Number.isInteger(year)) {
    return res.status(400).json({
      error: "validation_error",
      message: "year inválido",
    })
  }

  const service = req.scope.resolve<VehicleCompatibilityModuleService>(
    VEHICLE_COMPATIBILITY_MODULE
  )

  const slug = VehicleCompatibilityModuleService.slugify(make, modelName, year)
  const vehicles = await service.listVehicles({ slug }, { take: 1 })
  if (vehicles.length === 0) {
    return res.json({ vehicle: null, product_ids: [] })
  }

  const vehicle = vehicles[0]
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "vehicle",
    fields: ["id", "products.id"],
    filters: { id: vehicle.id },
  })

  const productIds = ((data[0] as { products?: { id: string }[] })?.products ?? [])
    .map((p) => p.id)

  return res.json({ vehicle, product_ids: productIds })
}
