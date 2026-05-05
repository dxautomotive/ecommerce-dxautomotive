import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { VEHICLE_COMPATIBILITY_MODULE } from "../../../modules/vehicle_compatibility"
import VehicleCompatibilityModuleService from "../../../modules/vehicle_compatibility/service"

/**
 * GET /store/vehicles
 *
 * Modos:
 * - Sem query param   → retorna lista distinta de marcas
 * - ?make=X           → retorna lista de modelos da marca
 * - ?make=X&model=Y   → retorna lista de anos do modelo
 *
 * Usado pelo filtro em cascata marca → modelo → ano do storefront.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<VehicleCompatibilityModuleService>(
    VEHICLE_COMPATIBILITY_MODULE
  )

  const make = req.query.make as string | undefined
  const modelName = req.query.model as string | undefined

  const all = await service.listVehicles({}, { take: 5000 })

  if (!make) {
    const makes = Array.from(new Set(all.map((v) => v.make))).sort()
    return res.json({ makes })
  }

  const filtered = all.filter(
    (v) => v.make.toLowerCase() === make.toLowerCase()
  )

  if (!modelName) {
    const models = Array.from(new Set(filtered.map((v) => v.model))).sort()
    return res.json({ make, models })
  }

  const filteredM = filtered.filter(
    (v) => v.model.toLowerCase() === modelName.toLowerCase()
  )
  const years = Array.from(new Set(filteredM.map((v) => v.year))).sort(
    (a, b) => b - a
  )
  return res.json({ make, model: modelName, years })
}
