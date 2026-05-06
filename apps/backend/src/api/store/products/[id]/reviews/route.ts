import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { PRODUCT_REVIEWS_MODULE } from "../../../../../modules/product_reviews"
import ProductReviewsModuleService from "../../../../../modules/product_reviews/service"

type CreateReviewBody = {
  rating?: number
  title?: string
  body?: string
  author_name?: string
  author_email?: string
}

const sanitize = (s: unknown, max = 2000): string | null => {
  if (typeof s !== "string") return null
  const trimmed = s.trim().slice(0, max)
  return trimmed.length > 0 ? trimmed : null
}

/**
 * GET /store/products/:id/reviews
 *
 * Lista reviews **aprovadas** do produto (status=approved). Ordenadas por
 * `created_at DESC`. Inclui um pequeno agregado `summary` (count + média).
 *
 * Aceita ?limit/?offset (max 50).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )

  const limit = Math.min(parseInt((req.query.limit as string) ?? "20", 10), 50)
  const offset = parseInt((req.query.offset as string) ?? "0", 10)

  const [reviews, count] = await service.listAndCountReviews(
    { product_id: req.params.id, status: "approved" },
    { take: limit, skip: offset, order: { created_at: "DESC" } as never }
  )

  // Agregado leve da nota média + distribuição por estrela
  const allApproved = await service.listReviews(
    { product_id: req.params.id, status: "approved" },
    { take: 5000 }
  )
  const total = allApproved.length
  const avg =
    total === 0
      ? 0
      : Math.round(
          (allApproved.reduce((s, r) => s + (r.rating ?? 0), 0) / total) * 10
        ) / 10
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }
  for (const r of allApproved) {
    const k = Math.max(1, Math.min(5, Math.round(r.rating ?? 0))) as 1 | 2 | 3 | 4 | 5
    distribution[k]++
  }

  return res.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      author_name: r.author_name,
      verified_purchase: r.verified_purchase,
      helpful_count: r.helpful_count,
      created_at: (r as unknown as { created_at?: Date }).created_at,
    })),
    count,
    summary: { total, average: avg, distribution },
    limit,
    offset,
  })
}

/**
 * POST /store/products/:id/reviews
 *
 * Endpoint público pra cliente postar review. Sempre cai com status `pending`
 * (admin modera depois). Faz sanitização básica de tamanho. Sem auth — o
 * front-end pode passar `author_email` mas é opcional.
 *
 * Cria também o link Product↔Review pra que `query.graph` consiga retornar.
 */
export async function POST(
  req: MedusaRequest<CreateReviewBody>,
  res: MedusaResponse
) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Verifica que o produto existe
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { id: req.params.id },
  })
  if (products.length === 0) {
    return res.status(404).json({ error: "product_not_found" })
  }

  const b = req.body ?? {}
  const rating = typeof b.rating === "number" ? Math.round(b.rating) : NaN
  const title = sanitize(b.title, 120)
  const body = sanitize(b.body, 4000)
  const authorName = sanitize(b.author_name, 80)

  if (!rating || rating < 1 || rating > 5 || !title || !body || !authorName) {
    return res.status(400).json({
      error: "validation_error",
      message:
        "rating (1-5), title, body e author_name são obrigatórios",
    })
  }

  const [review] = await service.createReviews([
    {
      product_id: req.params.id,
      rating,
      title,
      body,
      author_name: authorName,
      author_email: sanitize(b.author_email, 200),
      status: "pending",
      verified_purchase: false,
    },
  ])

  await link.create({
    [Modules.PRODUCT]: { product_id: req.params.id },
    [PRODUCT_REVIEWS_MODULE]: { review_id: review.id },
  })

  return res
    .status(201)
    .json({ id: review.id, status: review.status, message: "Avaliação enviada para moderação" })
}
