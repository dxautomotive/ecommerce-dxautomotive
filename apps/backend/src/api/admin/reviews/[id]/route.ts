import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PRODUCT_REVIEWS_MODULE } from "../../../../modules/product_reviews"
import ProductReviewsModuleService from "../../../../modules/product_reviews/service"

const ALLOWED_STATUS = ["pending", "approved", "rejected", "spam"]

type PatchBody = {
  status?: string
  internal_notes?: string
  rating?: number
  title?: string
  body?: string
  verified_purchase?: boolean
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )
  const review = await service.retrieveReview(req.params.id).catch(() => null)
  if (!review) return res.status(404).json({ error: "not_found" })
  return res.json({ review })
}

export async function PATCH(
  req: MedusaRequest<PatchBody>,
  res: MedusaResponse
) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )

  const update: Record<string, unknown> = {}

  if (req.body.status) {
    if (!ALLOWED_STATUS.includes(req.body.status)) {
      return res
        .status(400)
        .json({ error: "validation_error", message: "Status inválido" })
    }
    update.status = req.body.status
  }
  if (typeof req.body.internal_notes === "string") {
    update.internal_notes = req.body.internal_notes.trim() || null
  }
  if (typeof req.body.rating === "number") {
    if (req.body.rating < 1 || req.body.rating > 5) {
      return res
        .status(400)
        .json({ error: "validation_error", message: "Rating deve ser 1-5" })
    }
    update.rating = Math.round(req.body.rating)
  }
  if (typeof req.body.title === "string") update.title = req.body.title.trim()
  if (typeof req.body.body === "string") update.body = req.body.body.trim()
  if (typeof req.body.verified_purchase === "boolean") {
    update.verified_purchase = req.body.verified_purchase
  }

  if (Object.keys(update).length === 0) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "Nada para atualizar" })
  }

  const review = await service.updateReviews({ id: req.params.id, ...update })
  return res.json({ review })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )
  await service.deleteReviews(req.params.id)
  return res.status(204).send()
}
