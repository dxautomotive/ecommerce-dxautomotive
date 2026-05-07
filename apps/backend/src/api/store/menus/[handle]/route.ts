import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { NAVIGATION_MENUS_MODULE } from "../../../../modules/navigation_menus"
import NavigationMenusModuleService from "../../../../modules/navigation_menus/service"

type ItemType =
  | "link"
  | "external"
  | "home"
  | "search"
  | "catalog"
  | "category"
  | "collection"
  | "product"
  | "policy"

type ResolvedItem = {
  id: string
  label: string
  type: ItemType
  href: string
  target_id: string | null
  target_url: string | null
  open_in_new_tab: boolean
  position: number
  children: ResolvedItem[]
}

/**
 * GET /store/menus/:handle
 *
 * Endpoint público consumido pelo storefront. Retorna o menu identificado por
 * `handle` (ex.: header, footer-categorias) com items em árvore e URLs já
 * resolvidas pra cada tipo:
 *  - link/external/policy: usa `target_url` literal
 *  - home: `/`
 *  - search: `/search`
 *  - catalog: `/store`
 *  - category: resolve handle da categoria → /categories/<handle>
 *  - collection: resolve handle da coleção → /colecoes/<handle>
 *  - product: resolve handle do produto → /products/<handle>
 *
 * Items cujo target_id sumiu (categoria/coleção/produto deletado) são
 * silenciosamente omitidos pra não quebrar o nav.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const [menu] = await service.listMenus({ handle: req.params.handle }, { take: 1 })
  if (!menu) {
    return res.status(404).json({ error: "not_found" })
  }

  const items = await service.listMenuItems(
    { menu_id: menu.id },
    {
      take: 1000,
      order: { position: "ASC", created_at: "ASC" } as never,
    }
  )

  // Coleta target_ids pra resolver em batch
  const categoryIds = items
    .filter((i) => i.type === "category" && i.target_id)
    .map((i) => i.target_id as string)
  const collectionIds = items
    .filter((i) => i.type === "collection" && i.target_id)
    .map((i) => i.target_id as string)
  const productIds = items
    .filter((i) => i.type === "product" && i.target_id)
    .map((i) => i.target_id as string)

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const categoryHandles = new Map<string, string>()
  if (categoryIds.length > 0) {
    const { data: cats } = await query.graph({
      entity: "product_category",
      fields: ["id", "handle"],
      filters: { id: categoryIds },
    })
    for (const c of cats) categoryHandles.set(c.id, c.handle)
  }

  const collectionHandles = new Map<string, string>()
  if (collectionIds.length > 0) {
    const { data: cols } = await query.graph({
      entity: "product_collection",
      fields: ["id", "handle"],
      filters: { id: collectionIds },
    })
    for (const c of cols) collectionHandles.set(c.id, c.handle)
  }

  const productHandles = new Map<string, string>()
  if (productIds.length > 0) {
    const { data: prods } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { id: productIds },
    })
    for (const p of prods) productHandles.set(p.id, p.handle)
  }

  const resolveHref = (
    item: (typeof items)[number]
  ): string | null => {
    const t = item.type as ItemType
    if (t === "link" || t === "external" || t === "policy") {
      return item.target_url || null
    }
    if (t === "home") return "/"
    if (t === "search") return "/search"
    if (t === "catalog") return "/store"
    if (t === "category" && item.target_id) {
      const handle = categoryHandles.get(item.target_id)
      return handle ? `/categories/${handle}` : null
    }
    if (t === "collection" && item.target_id) {
      const handle = collectionHandles.get(item.target_id)
      return handle ? `/colecoes/${handle}` : null
    }
    if (t === "product" && item.target_id) {
      const handle = productHandles.get(item.target_id)
      return handle ? `/products/${handle}` : null
    }
    return null
  }

  const toResolved = (
    item: (typeof items)[number],
    children: ResolvedItem[]
  ): ResolvedItem | null => {
    const href = resolveHref(item)
    if (!href) return null
    return {
      id: item.id,
      label: item.label,
      type: item.type as ItemType,
      href,
      target_id: item.target_id,
      target_url: item.target_url,
      open_in_new_tab: item.open_in_new_tab,
      position: item.position,
      children,
    }
  }

  // Monta árvore aninhada de até 3 níveis (root → child → grandchild) e
  // resolve URLs descartando órfãos.
  const childrenByParent = new Map<string, typeof items>()
  const roots: typeof items = []
  for (const it of items) {
    if (it.parent_item_id) {
      const arr = childrenByParent.get(it.parent_item_id) ?? []
      arr.push(it)
      childrenByParent.set(it.parent_item_id, arr)
    } else {
      roots.push(it)
    }
  }

  const resolveSubtree = (
    item: (typeof items)[number],
    depth: number
  ): ResolvedItem | null => {
    // Limite defensivo de 3 níveis (depth 0=root, 1=child, 2=grandchild)
    const childItems = depth >= 2 ? [] : childrenByParent.get(item.id) ?? []
    const children = childItems
      .map((c) => resolveSubtree(c, depth + 1))
      .filter((c): c is ResolvedItem => c !== null)
    return toResolved(item, children)
  }

  const tree: ResolvedItem[] = []
  for (const root of roots) {
    const resolved = resolveSubtree(root, 0)
    if (resolved) tree.push(resolved)
  }

  return res.json({
    menu: {
      id: menu.id,
      handle: menu.handle,
      label: menu.label,
      items: tree,
    },
  })
}
