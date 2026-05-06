import { model } from "@medusajs/framework/utils"

/**
 * Relação curada entre 2 produtos.
 *
 * `relationship_type`:
 *  - `related`  → "Produtos relacionados" (sugestões na PDP, lista horizontal)
 *  - `bundle`   → "Compre junto" (checkboxes na PDP, soma total + add-all)
 *
 * `source_product_id` é o produto onde a relação é exibida; `target_product_id`
 * é o produto sugerido. A relação é unidirecional — se quiser que B também
 * sugira A, cria-se outra linha com source/target invertidos. Isso permite
 * curadoria assimétrica (ex.: capa só recomenda o celular X, mas X recomenda
 * 5 capas diferentes).
 *
 * Não usamos Medusa link porque os ids ficam como texto (mais flexível pra
 * mover/duplicar produtos sem quebrar referências). O lookup é feito via
 * `query.graph({ entity: "product", filters: { id: [...] } })`.
 */
export const ProductRelationship = model.define("product_relationship", {
  id: model.id({ prefix: "prel" }).primaryKey(),
  source_product_id: model.text().searchable(),
  target_product_id: model.text().searchable(),
  relationship_type: model.enum(["related", "bundle"]).default("related"),
  position: model.number().default(0),
})
