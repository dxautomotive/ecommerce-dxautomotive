import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ATACADO_LEADS_MODULE } from "../../../modules/atacado_leads"
import AtacadoLeadsModuleService from "../../../modules/atacado_leads/service"
import { VEHICLE_COMPATIBILITY_MODULE } from "../../../modules/vehicle_compatibility"
import VehicleCompatibilityModuleService from "../../../modules/vehicle_compatibility/service"

/**
 * GET /admin/dashboard
 *
 * KPIs agregados para o dashboard customizado do admin DX:
 *  - orders_today, orders_week, orders_month
 *  - leads_pending (novos + em contato)
 *  - leads_total
 *  - products_total
 *  - vehicles_total
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Orders por janela temporal
  const orderCounts = await Promise.all(
    [startOfDay, sevenDaysAgo, thirtyDaysAgo].map(async (since) => {
      const { metadata } = await query.graph({
        entity: "order",
        fields: ["id"],
        filters: { created_at: { $gte: since.toISOString() } as never },
        pagination: { take: 0 },
      })
      return metadata?.count ?? 0
    })
  )

  // Total de produtos
  const { metadata: productsMeta } = await query.graph({
    entity: "product",
    fields: ["id"],
    pagination: { take: 0 },
  })

  // Atacado leads
  const atacadoSvc = req.scope.resolve<AtacadoLeadsModuleService>(
    ATACADO_LEADS_MODULE
  )
  const [, leadsTotal] = await atacadoSvc.listAndCountAtacadoLeads({}, { take: 0 })
  const [, leadsPending] = await atacadoSvc.listAndCountAtacadoLeads(
    { status: ["new", "contacted"] as never },
    { take: 0 }
  )

  // Vehicles
  const vehicleSvc = req.scope.resolve<VehicleCompatibilityModuleService>(
    VEHICLE_COMPATIBILITY_MODULE
  )
  const [, vehiclesTotal] = await vehicleSvc.listAndCountVehicles({}, { take: 0 })

  return res.json({
    orders_today: orderCounts[0],
    orders_week: orderCounts[1],
    orders_month: orderCounts[2],
    leads_pending: leadsPending,
    leads_total: leadsTotal,
    products_total: productsMeta?.count ?? 0,
    vehicles_total: vehiclesTotal,
    generated_at: now.toISOString(),
  })
}
