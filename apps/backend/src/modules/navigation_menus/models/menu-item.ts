import { model } from "@medusajs/framework/utils"

/**
 * Item de um menu (ou sub-menu, via parent_item_id).
 *
 * `type` define como o `target` vai ser interpretado no storefront:
 *  - `link`        → href custom (ex.: "/colecoes/lancamentos")
 *  - `external`    → target_url externo (https://...), abre em nova aba
 *  - `home`        → resolve `/` (sem target)
 *  - `search`      → resolve `/search` (sem target)
 *  - `catalog`     → resolve `/store` (sem target)
 *  - `category`    → target_id é o id de product_category, storefront monta `/categories/<handle>`
 *  - `collection`  → target_id é o id de product_collection, storefront monta `/colecoes/<handle>`
 *  - `product`     → target_id é o id de product, storefront monta `/products/<handle>`
 *  - `policy`      → target_url é `/politicas/<slug>` (privacidade, trocas-e-devolucoes, entrega, garantia)
 *
 * `parent_item_id` permite sub-menus (até 3 níveis após Onda 2).
 *
 * Sem Medusa link pra Product/Category/Collection — guardamos só id como text
 * pra que mover/duplicar produtos não quebre a referência (mesma decisão do
 * `product_relationships`). Storefront resolve o handle via `query.graph` no GET store.
 */
export const MenuItem = model.define("menu_item", {
  id: model.id({ prefix: "mitem" }).primaryKey(),
  menu_id: model.text().searchable(),
  parent_item_id: model.text().nullable(),
  label: model.text(),
  type: model
    .enum([
      "link",
      "external",
      "home",
      "search",
      "catalog",
      "category",
      "collection",
      "product",
      "policy",
    ])
    .default("link"),
  /** Id do recurso (product_category ou product_collection) — null pra link/external */
  target_id: model.text().nullable(),
  /** Url manual (link ou external) — null pra category/collection */
  target_url: model.text().nullable(),
  /** Ordem dentro do mesmo menu_id + parent_item_id */
  position: model.number().default(0),
  /** Abre em nova aba (típico de external) */
  open_in_new_tab: model.boolean().default(false),
})
