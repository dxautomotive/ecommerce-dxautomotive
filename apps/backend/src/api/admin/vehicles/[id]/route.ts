import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { VEHICLE_COMPATIBILITY_MODULE } from "../../../../modules/vehicle_compatibility"
import VehicleCompatibilityModuleService from "../../../../modules/vehicle_compatibility/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<VehicleCompatibilityModuleService>(
    VEHICLE_COMPATIBILITY_MODULE
  )
  const v = await service.retrieveVehicle(req.params.id).catch(() => null)
  if (!v) return res.status(404).json({ error: "not_found" })
  return res.json({ vehicle: v })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<VehicleCompatibilityModuleService>(
    VEHICLE_COMPATIBILITY_MODULE
  )
  await service.deleteVehicles(req.params.id)
  return res.status(204).send()
}
