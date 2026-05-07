import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { NAVIGATION_MENUS_MODULE } from "../../../../modules/navigation_menus"
import NavigationMenusModuleService from "../../../../modules/navigation_menus/service"
import { canMoveWithinDepth } from "../../../../modules/navigation_menus/utils/tree"

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

const FIXED_URL_TYPES = new Set<ItemType>(["home", "search", "catalog"])
const RESOURCE_TYPES = new Set<ItemType>(["category", "collection", "product"])
const URL_TYPES = new Set<ItemType>(["link", "external", "policy"])

type PatchBody = {
  label?: string
  type?: ItemType
  parent_item_id?: string | null
  target_id?: string | null
  target_url?: string | null
  position?: number
  open_in_new_tab?: boolean
}

/**
 * PATCH /admin/menu-items/:id
 *
 * Atualiza qualquer campo do item. Validações ecoam o POST do criador:
 *  - label não pode virar vazio
 *  - troca de type re-valida target_id/target_url e zera o campo irrelevante
 *  - parent_item_id, se informado, precisa pertencer ao mesmo menu e ser raiz
 */
export async function PATCH(
  req: MedusaRequest<PatchBody>,
  res: MedusaResponse
) {
  const service = req.scope.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const current = await service.retrieveMenuItem(req.params.id).catch(() => null)
  if (!current) {
    return res
      .status(404)
      .json({ error: "not_found", message: "Item não encontrado" })
  }

  const update: Record<string, unknown> = {}

  if (typeof req.body.label === "string") {
    const label = req.body.label.trim()
    if (!label) {
      return res
        .status(400)
        .json({ error: "validation_error", message: "label não pode ser vazio" })
    }
    update.label = label
  }

  if (typeof req.body.position === "number") {
    update.position = req.body.position
  }

  if (typeof req.body.open_in_new_tab === "boolean") {
    update.open_in_new_tab = req.body.open_in_new_tab
  }

  const nextType = (req.body.type ?? current.type) as ItemType
  if (req.body.type !== undefined && !ITEM_TYPES.includes(nextType)) {
    return res.status(400).json({
      error: "validation_error",
      message: `type deve ser um de: ${ITEM_TYPES.join(", ")}`,
    })
  }

  const targetTouched =
    req.body.type !== undefined ||
    req.body.target_id !== undefined ||
    req.body.target_url !== undefined

  if (targetTouched) {
    const nextTargetId =
      req.body.target_id !== undefined
        ? req.body.target_id?.trim() || null
        : current.target_id
    const nextTargetUrl =
      req.body.target_url !== undefined
        ? req.body.target_url?.trim() || null
        : current.target_url

    update.type = nextType

    if (URL_TYPES.has(nextType)) {
      if (!nextTargetUrl) {
        return res.status(400).json({
          error: "validation_error",
          message: "target_url é obrigatório para link/external/policy",
        })
      }
      update.target_url = nextTargetUrl
      update.target_id = null
    } else if (RESOURCE_TYPES.has(nextType)) {
      if (!nextTargetId) {
        return res.status(400).json({
          error: "validation_error",
          message: "target_id é obrigatório para category/collection/product",
        })
      }
      update.target_id = nextTargetId
      update.target_url = null
    } else if (FIXED_URL_TYPES.has(nextType)) {
      update.target_id = null
      update.target_url = null
    }
  }

  if (req.body.parent_item_id !== undefined) {
    if (req.body.parent_item_id === null) {
      update.parent_item_id = null
    } else {
      if (req.body.parent_item_id === req.params.id) {
        return res.status(400).json({
          error: "validation_error",
          message: "Item não pode ser pai de si mesmo",
        })
      }
      const parent = await service
        .retrieveMenuItem(req.body.parent_item_id)
        .catch(() => null)
      if (!parent) {
        return res.status(400).json({
          error: "validation_error",
          message: "parent_item_id não encontrado",
        })
      }
      if (parent.menu_id !== current.menu_id) {
        return res.status(400).json({
          error: "validation_error",
          message: "parent_item_id pertence a outro menu",
        })
      }
      // Valida profundidade considerando subárvore do item movido (3 níveis máx)
      const allItems = await service.listMenuItems(
        { menu_id: current.menu_id },
        { take: 5000 }
      )
      const probe = canMoveWithinDepth(
        allItems.map((i) => ({ id: i.id, parent_item_id: i.parent_item_id })),
        req.params.id,
        parent.id
      )
      if (!probe.ok) {
        return res.status(400).json({
          error: "validation_error",
          message: probe.reason,
        })
      }
      update.parent_item_id = parent.id
    }
  }

  if (Object.keys(update).length === 0) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "Nada para atualizar" })
  }

  const item = await service.updateMenuItems({
    id: req.params.id,
    ...update,
  })
  return res.json({ item })
}

/**
 * DELETE /admin/menu-items/:id
 *
 * Remove o item. Se for raiz com filhos, soft-deleta os filhos junto pra não
 * deixar órfãos visíveis.
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const children = await service.listMenuItems(
    { parent_item_id: req.params.id },
    { take: 1000 }
  )
  if (children.length > 0) {
    await service.deleteMenuItems(children.map((c) => c.id))
  }

  await service.deleteMenuItems(req.params.id)
  return res.status(204).send()
}
