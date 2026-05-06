import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ProductReviewsModule from "../modules/product_reviews"

/**
 * Link 1:N entre Product e Review.
 * Cada review pertence a 1 produto; cada produto tem N reviews.
 *
 * Nos handlers admin/store usamos `query.graph({ entity: "product", fields: ["reviews.*"] })`
 * pra trazer reviews vinculadas, e na criação de uma Review já passamos `product_id`
 * + criamos o link via `link.create({ ... })`.
 */
export default defineLink(
  ProductModule.linkable.product,
  {
    linkable: ProductReviewsModule.linkable.review,
    isList: true,
  }
)
