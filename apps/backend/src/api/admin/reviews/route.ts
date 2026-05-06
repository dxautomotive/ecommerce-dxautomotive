import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { PRODUCT_REVIEWS_MODULE } from "../../../modules/product_reviews"
import ProductReviewsModuleService from "../../../modules/product_reviews/service"

const ALLOWED_STATUS = ["pending", "approved", "rejected", "spam"]

/**
 * GET /admin/reviews
 *
 * Lista todas as reviews com filtros opcionais:
 *  - ?status=pending|approved|rejected|spam
 *  - ?product_id=prod_...
 *  - ?limit / ?offset
 *
 * Retorna `reviews[]` enriquecido com `product` (id/title/thumbnail) pra
 * a página admin não precisar fazer N+1.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const status = req.query.status as string | undefined
  const productId = req.query.product_id as string | undefined
  const limit = Math.min(parseInt((req.query.limit as string) ?? "50", 10), 200)
  const offset = parseInt((req.query.offset as string) ?? "0", 10)

  const filters: Record<string, unknown> = {}
  if (status && ALLOWED_STATUS.includes(status)) filters.status = status
  if (productId) filters.product_id = productId

  const [reviews, count] = await service.listAndCountReviews(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" } as never,
  })

  // Enriquece com dados do produto (title + thumbnail) — uma query única
  const productIds = Array.from(
    new Set(reviews.map((r) => r.product_id).filter(Boolean))
  )
  const productById = new Map<
    string,
    { id: string; title: string | null; thumbnail: string | null }
  >()
  if (productIds.length > 0) {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "thumbnail"],
      filters: { id: productIds as string[] },
    })
    for (const p of products) {
      productById.set(p.id as string, p as never)
    }
  }

  const enriched = reviews.map((r) => ({
    ...r,
    product: productById.get(r.product_id) ?? null,
  }))

  return res.json({ reviews: enriched, count, limit, offset })
}

type PostBody = {
  product_id: string
  rating: number
  title: string
  body: string
  author_name: string
  author_email?: string
  status?: "pending" | "approved" | "rejected" | "spam"
  verified_purchase?: boolean
}

/**
 * POST /admin/reviews
 *
 * Cria uma review manualmente pelo admin (útil pra moderação ou pra
 * importar avaliações de outras fontes — ex.: planilha).
 *
 * Já cria o link Product↔Review pra que `query.graph({ entity:"product", fields:["reviews.*"] })`
 * retorne a review.
 */
export async function POST(req: MedusaRequest<PostBody>, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

  const b = req.body
  if (
    !b.product_id ||
    !b.rating ||
    b.rating < 1 ||
    b.rating > 5 ||
    !b.title?.trim() ||
    !b.body?.trim() ||
    !b.author_name?.trim()
  ) {
    return res.status(400).json({
      error: "validation_error",
      message:
        "product_id, rating (1-5), title, body, author_name são obrigatórios",
    })
  }
  if (b.status && !ALLOWED_STATUS.includes(b.status)) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "Status inválido" })
  }

  const [review] = await service.createReviews([
    {
      product_id: b.product_id,
      rating: Math.round(b.rating),
      title: b.title.trim(),
      body: b.body.trim(),
      author_name: b.author_name.trim(),
      author_email: b.author_email?.trim() || null,
      status: b.status ?? "approved",
      verified_purchase: b.verified_purchase ?? false,
    },
  ])

  await link.create({
    [Modules.PRODUCT]: { product_id: b.product_id },
    [PRODUCT_REVIEWS_MODULE]: { review_id: review.id },
  })

  return res.status(201).json({ review })
}
