import { model } from "@medusajs/framework/utils"

/**
 * Avaliação (review) de produto da loja DX Automotive.
 *
 * Workflow de status:
 *  - `pending`   → recém-criada, aguardando moderação
 *  - `approved`  → publicada (aparece no storefront)
 *  - `rejected`  → reprovada na moderação (não aparece, mantida pra histórico)
 *  - `spam`      → marcada como spam/teste
 *
 * `product_id` é o id do produto Medusa (ex.: `prod_01...`). A relação
 * é mantida via Medusa link system (`apps/backend/src/links/product-review.ts`),
 * não como FK explícita — assim o módulo continua isolável.
 */
export const Review = model.define("review", {
  id: model.id({ prefix: "rev" }).primaryKey(),
  product_id: model.text().searchable(),
  rating: model.number(),
  title: model.text(),
  body: model.text(),
  author_name: model.text(),
  author_email: model.text().nullable(),
  status: model
    .enum(["pending", "approved", "rejected", "spam"])
    .default("pending"),
  verified_purchase: model.boolean().default(false),
  helpful_count: model.number().default(0),
  /**
   * URLs públicas das fotos enviadas pelo cliente. Hoje vazio por default —
   * upload via Cloudflare R2 + signed URL será implementado quando a infra
   * R2 estiver configurada. Já reservado pra evitar nova migration depois.
   */
  images: model.json().nullable(),
  internal_notes: model.text().nullable(),
})
