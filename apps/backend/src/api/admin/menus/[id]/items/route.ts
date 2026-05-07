import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { NAVIGATION_MENUS_MODULE } from "../../../../../modules/navigation_menus"
import NavigationMenusModuleService from "../../../../../modules/navigation_menus/service"
import { canMoveWithinDepth } from "../../../../../modules/navigation_menus/utils/tree"

const ITEM_TYPES = [
  "link",
  "external",
  "home",
  "search",
  "catalog",
  "category",
  "collection",
  "product",
  "policy",
] as const
type ItemType = (typeof ITEM_TYPES)[number]

/** Tipos com URL fixa: não exigem target_id nem target_url */
const FIXED_URL_TYPES = new Set<ItemType>(["home", "search", "catalog"])
/** Tipos cujo alvo é um recurso Medusa (target_id obrigatório) */
const RESOURCE_TYPES = new Set<ItemType>(["category", "collection", "product"])
/** Tipos cujo alvo é uma URL livre/policy (target_url obrigatório) */
const URL_TYPES = new Set<ItemType>(["link", "external", "policy"])

type PostBody = {
  label?: string
  type?: ItemType
  parent_item_id?: string | null
  target_id?: string | null
  target_url?: string | null
  position?: number
  open_in_new_tab?: boolean
}

/**
 * GET /admin/menus/:id/items
 *
 * Lista flat dos items do menu (sem árvore — quem precisa de árvore usa
 * `GET /admin/menus/:id`).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const items = await service.listMenuItems(
    { menu_id: req.params.id },
    {
      take: 1000,
      order: { position: "ASC", created_at: "ASC" } as never,
    }
  )

  return res.json({ items, count: items.length })
}

/**
 * POST /admin/menus/:id/items
 *
 * Cria um item dentro do menu. Validações por tipo:
 *  - label obrigatório
 *  - link/external/policy: target_url obrigatório
 *  - category/collection/product: target_id obrigatório
 *  - home/search/catalog: sem target (URL fixa resolvida no storefront)
 *  - parent_item_id, se informado, precisa pertencer ao mesmo menu (1 nível só na Onda 1)
 */
export async function POST(req: MedusaRequest<PostBody>, res: MedusaResponse) {
  const service = req.scope.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const menu = await service.retrieveMenu(req.params.id).catch(() => null)
  if (!menu) {
    return res
      .status(404)
      .json({ error: "not_found", message: "Menu não encontrado" })
  }

  const label = req.body.label?.trim()
  const type = (req.body.type ?? "link") as ItemType
  const position =
    typeof req.body.position === "number" ? req.body.position : 0
  const open_in_new_tab = req.body.open_in_new_tab === true

  if (!label) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "label é obrigatório" })
  }
  if (!ITEM_TYPES.includes(type)) {
    return res.status(400).json({
      error: "validation_error",
      message: `type deve ser um de: ${ITEM_TYPES.join(", ")}`,
    })
  }

  let target_id: string | null = null
  let target_url: string | null = null

  if (URL_TYPES.has(type)) {
    target_url = req.body.target_url?.trim() || null
    if (!target_url) {
      return res.status(400).json({
        error: "validation_error",
        message: "target_url é obrigatório para link/external/policy",
      })
    }
  } else if (RESOURCE_TYPES.has(type)) {
    target_id = req.body.target_id?.trim() || null
    if (!target_id) {
      return res.status(400).json({
        error: "validation_error",
        message: "target_id é obrigatório para category/collection/product",
      })
    }
  }
  // FIXED_URL_TYPES (home/search/catalog) ficam com ambos null

  let parent_item_id: string | null = null
  if (req.body.parent_item_id) {
    const parent = await service
      .retrieveMenuItem(req.body.parent_item_id)
      .catch(() => null)
    if (!parent) {
      return res.status(400).json({
        error: "validation_error",
        message: "parent_item_id não encontrado",
      })
    }
    if (parent.menu_id !== req.params.id) {
      return res.status(400).json({
        error: "validation_error",
        message: "parent_item_id pertence a outro menu",
      })
    }
    // Profundidade: novo item será nível (depth do parent) + 1.
    // Limite = 3 níveis (root, child, grandchild).
    const siblings = await service.listMenuItems(
      { menu_id: req.params.id },
      { take: 5000 }
    )
    // Trick: simulamos um item folha com id placeholder pra reaproveitar canMoveWithinDepth
    const probe = canMoveWithinDepth(
      [...siblings, { id: "__probe__", parent_item_id: null }],
      "__probe__",
      parent.id
    )
    if (!probe.ok) {
      return res.status(400).json({
        error: "validation_error",
        message: probe.reason,
      })
    }
    parent_item_id = parent.id
  }

  const [item] = await service.createMenuItems([
    {
      menu_id: req.params.id,
      parent_item_id,
      label,
      type,
      target_id,
      target_url,
      position,
      open_in_new_tab,
    },
  ])

  return res.status(201).json({ item })
}
