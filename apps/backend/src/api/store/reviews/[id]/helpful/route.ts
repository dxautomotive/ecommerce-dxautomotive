import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PRODUCT_REVIEWS_MODULE } from "../../../../../modules/product_reviews"
import ProductReviewsModuleService from "../../../../../modules/product_reviews/service"

/**
 * POST /store/reviews/:id/helpful
 *
 * Incrementa `helpful_count` da review em +1. Sem auth (anônimo).
 *
 * Deduplicação por browser fica no client (localStorage["dx:reviews-helpful"][])
 * — assim quem é a mesma pessoa não vota 2x no mesmo browser. Não há proteção
 * server-side contra spam/bot ainda; quando precisar, adicionar rate limit por
 * IP + (opcional) reCAPTCHA invisível na primeira chamada.
 *
 * Só permite votar em review com status `approved`.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )

  const review = await service.retrieveReview(req.params.id).catch(() => null)
  if (!review) return res.status(404).json({ error: "not_found" })
  if (review.status !== "approved") {
    return res.status(403).json({ error: "review_not_published" })
  }

  const updated = await service.updateReviews({
    id: req.params.id,
    helpful_count: (review.helpful_count ?? 0) + 1,
  })

  return res.json({ id: updated.id, helpful_count: updated.helpful_count })
}
