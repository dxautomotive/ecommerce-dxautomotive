import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEWS_MODULE } from "../../../../modules/product_reviews"
import ProductReviewsModuleService from "../../../../modules/product_reviews/service"

/**
 * GET /admin/reviews/summary
 *
 * Lista TODOS os produtos com summary de reviews por produto:
 *  - total (todas as reviews, qualquer status)
 *  - approved
 *  - pending
 *  - average (média das aprovadas, 1 casa decimal)
 *
 * Usado pela lista mestre da página `/app/avaliacoes` — usuário clica num
 * produto pra ver e moderar só as reviews daquele produto.
 *
 * Inclui produtos com 0 reviews (count = 0) pra que o admin possa criar
 * a primeira avaliação manualmente via widget.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Pega todos os produtos publicados ou rascunho — não filtra por status
  // pra que o admin veja tudo
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "thumbnail", "status", "handle"],
  })

  // Pega todas as reviews num único hit pra evitar N+1
  const allReviews = await service.listReviews({}, { take: 5000 })

  // Indexa por product_id
  const byProduct = new Map<
    string,
    { total: number; approved: number; pending: number; sum: number }
  >()
  for (const r of allReviews) {
    const k = r.product_id
    if (!k) continue
    const cur =
      byProduct.get(k) ?? { total: 0, approved: 0, pending: 0, sum: 0 }
    cur.total++
    if (r.status === "approved") {
      cur.approved++
      cur.sum += r.rating ?? 0
    }
    if (r.status === "pending") cur.pending++
    byProduct.set(k, cur)
  }

  const items = products
    .map((p) => {
      const s = byProduct.get(p.id as string) ?? {
        total: 0,
        approved: 0,
        pending: 0,
        sum: 0,
      }
      return {
        id: p.id,
        title: p.title,
        thumbnail: p.thumbnail,
        status: p.status,
        handle: p.handle,
        review_total: s.total,
        review_approved: s.approved,
        review_pending: s.pending,
        review_average:
          s.approved > 0 ? Math.round((s.sum / s.approved) * 10) / 10 : 0,
      }
    })
    // Ordena: maior número de pendentes primeiro (precisam de moderação),
    // depois mais reviews aprovadas, depois alfabético.
    .sort((a, b) => {
      if (b.review_pending !== a.review_pending)
        return b.review_pending - a.review_pending
      if (b.review_total !== a.review_total)
        return b.review_total - a.review_total
      return (a.title ?? "").localeCompare(b.title ?? "")
    })

  return res.json({ items, count: items.length })
}
