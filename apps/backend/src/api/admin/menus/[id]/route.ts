import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { NAVIGATION_MENUS_MODULE } from "../../../../modules/navigation_menus"
import NavigationMenusModuleService from "../../../../modules/navigation_menus/service"

/**
 * GET /admin/menus/:id
 *
 * Retorna o menu + items em árvore (raízes com `children`), ordenados por
 * `position ASC, created_at ASC`.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const menu = await service.retrieveMenu(req.params.id).catch(() => null)
  if (!menu) {
    return res.status(404).json({ error: "not_found", message: "Menu não encontrado" })
  }

  const items = await service.listMenuItems(
    { menu_id: req.params.id },
    {
      take: 1000,
      order: { position: "ASC", created_at: "ASC" } as never,
    }
  )

  // Monta árvore aninhada de até 3 níveis (root → child → grandchild)
  const byParent = new Map<string, typeof items>()
  for (const it of items) {
    const key = it.parent_item_id ?? "__root__"
    const arr = byParent.get(key) ?? []
    arr.push(it)
    byParent.set(key, arr)
  }
  const buildChildren = (parentId: string): Array<typeof items[number] & { children: typeof items }> =>
    (byParent.get(parentId) ?? []).map((it) => ({
      ...it,
      children: byParent.get(it.id) ?? [],
    }))
  const tree = (byParent.get("__root__") ?? []).map((root) => ({
    ...root,
    children: buildChildren(root.id),
  }))

  return res.json({
    menu: { ...menu, items: tree, item_count: items.length },
  })
}

type PatchBody = {
  label?: string
  position?: number
}

/**
 * PATCH /admin/menus/:id
 *
 * Atualiza label e/ou position. `handle` é imutável (mudaria contrato com
 * storefront).
 */
export async function PATCH(
  req: MedusaRequest<PatchBody>,
  res: MedusaResponse
) {
  const service = req.scope.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

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

  if (Object.keys(update).length === 0) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "Nada para atualizar" })
  }

  const menu = await service.updateMenus({
    id: req.params.id,
    ...update,
  })
  return res.json({ menu })
}

/**
 * DELETE /admin/menus/:id
 *
 * Remove o menu e cascateia os items (soft-delete via `deleted_at`).
 * Bloqueia se `is_default = true` (menus core do bootstrap).
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const menu = await service.retrieveMenu(req.params.id).catch(() => null)
  if (!menu) {
    return res
      .status(404)
      .json({ error: "not_found", message: "Menu não encontrado" })
  }
  if ((menu as { is_default?: boolean }).is_default) {
    return res.status(403).json({
      error: "forbidden",
      message:
        "Esse menu é padrão do sistema e não pode ser excluído. Edite os items pra customizar.",
    })
  }

  // Soft delete dos items primeiro pra não deixar órfãos visíveis
  const items = await service.listMenuItems(
    { menu_id: req.params.id },
    { take: 5000 }
  )
  if (items.length > 0) {
    await service.deleteMenuItems(items.map((i) => i.id))
  }

  await service.deleteMenus(req.params.id)
  return res.status(204).send()
}
