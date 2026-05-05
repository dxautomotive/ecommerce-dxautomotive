import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { VEHICLE_COMPATIBILITY_MODULE } from "../../../modules/vehicle_compatibility"
import VehicleCompatibilityModuleService from "../../../modules/vehicle_compatibility/service"

type CreateVehicleBody = {
  make?: string
  model?: string
  year?: number
  trim?: string
  body_type?: string
  notes?: string
}

const sanitize = (s: unknown): string | null => {
  if (typeof s !== "string") return null
  return s.trim().slice(0, 200) || null
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<VehicleCompatibilityModuleService>(
    VEHICLE_COMPATIBILITY_MODULE
  )
  const q = (req.query.q as string | undefined)?.trim().toLowerCase()
  const limit = Math.min(parseInt((req.query.limit as string) ?? "100", 10), 500)

  const filters: Record<string, unknown> = {}
  let [vehicles, count] = await service.listAndCountVehicles(filters, {
    take: limit,
    order: { make: "ASC", model: "ASC", year: "DESC" } as never,
  })

  if (q) {
    vehicles = vehicles.filter((v) =>
      `${v.make} ${v.model} ${v.year} ${v.trim ?? ""}`
        .toLowerCase()
        .includes(q)
    )
    count = vehicles.length
  }

  return res.json({ vehicles, count })
}

export async function POST(
  req: MedusaRequest<CreateVehicleBody>,
  res: MedusaResponse
) {
  const make = sanitize(req.body.make)
  const modelName = sanitize(req.body.model)
  const year = Number(req.body.year)
  if (!make || !modelName || !Number.isInteger(year) || year < 1950 || year > 2099) {
    return res.status(400).json({
      error: "validation_error",
      message: "make, model e year (entre 1950 e 2099) são obrigatórios",
    })
  }

  const service = req.scope.resolve<VehicleCompatibilityModuleService>(
    VEHICLE_COMPATIBILITY_MODULE
  )

  const slug = VehicleCompatibilityModuleService.slugify(make, modelName, year)

  const existing = await service.listVehicles({ slug }, { take: 1 })
  if (existing.length > 0) {
    return res.status(409).json({
      error: "duplicate",
      message: "Veículo já cadastrado",
      vehicle: existing[0],
    })
  }

  const vehicle = await service.createVehicles({
    make,
    model: modelName,
    year,
    slug,
    trim: sanitize(req.body.trim),
    body_type: sanitize(req.body.body_type),
    notes: sanitize(req.body.notes),
  })

  return res.status(201).json({ vehicle })
}
