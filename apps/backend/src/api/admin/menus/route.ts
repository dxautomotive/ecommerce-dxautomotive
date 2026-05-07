import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { NAVIGATION_MENUS_MODULE } from "../../../modules/navigation_menus"
import NavigationMenusModuleService from "../../../modules/navigation_menus/service"

const HANDLE_RX = /^[a-z0-9][a-z0-9-]*$/

/**
 * GET /admin/menus
 *
 * Lista todos os menus cadastrados (sem items — pra carregar items use
 * `GET /admin/menus/:id`). Inclui contagem de items pra UX.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const menus = await service.listMenus(
    {},
    { take: 100, order: { position: "ASC", created_at: "ASC" } as never }
  )

  // Counts em batch
  const allItems = await service.listMenuItems({}, { take: 5000 })
  const counts = new Map<string, number>()
  for (const i of allItems) {
    counts.set(i.menu_id, (counts.get(i.menu_id) ?? 0) + 1)
  }

  return res.json({
    menus: menus.map((m) => ({
      ...m,
      item_count: counts.get(m.id) ?? 0,
    })),
    count: menus.length,
  })
}

type PostBody = {
  handle?: string
  label?: string
  position?: number
}

/**
 * POST /admin/menus
 *
 * Cria um novo menu. `handle` precisa ser único e em formato slug.
 */
export async function POST(req: MedusaRequest<PostBody>, res: MedusaResponse) {
  const service = req.scope.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const handle = req.body.handle?.trim().toLowerCase()
  const label = req.body.label?.trim()
  const position = typeof req.body.position === "number" ? req.body.position : 0

  if (!handle || !HANDLE_RX.test(handle)) {
    return res.status(400).json({
      error: "validation_error",
      message:
        "handle obrigatório no formato slug (letras minúsculas, números e hífens)",
    })
  }
  if (!label) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "label é obrigatório" })
  }

  // Idempotência: se já existe, retorna o existente
  const existing = await service.listMenus({ handle }, { take: 1 })
  if (existing.length > 0) {
    return res.status(200).json({ menu: existing[0], created: false })
  }

  const [menu] = await service.createMenus([{ handle, label, position }])
  return res.status(201).json({ menu, created: true })
}
