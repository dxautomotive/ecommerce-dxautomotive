import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_RELATIONSHIPS_MODULE } from "../../../../../modules/product_relationships"
import ProductRelationshipsModuleService from "../../../../../modules/product_relationships/service"

const ALLOWED_TYPES = ["related", "bundle"] as const

/**
 * GET /store/products/:id/relationships?type=related|bundle
 *
 * Endpoint público. Retorna a lista enriquecida com produto completo
 * (id/title/thumbnail/handle/status/calculated_price). Só retorna produtos
 * com `status = published`.
 *
 * Em escala maior, indexar isso com Redis ou edge cache.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductRelationshipsModuleService>(
    PRODUCT_RELATIONSHIPS_MODULE
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const filters: Record<string, unknown> = {
    source_product_id: req.params.id,
  }
  const type = req.query.type as string | undefined
  if (type && (ALLOWED_TYPES as readonly string[]).includes(type)) {
    filters.relationship_type = type
  }

  const rels = await service.listProductRelationships(filters, {
    take: 50,
    order: { position: "ASC", created_at: "ASC" } as never,
  })

  if (rels.length === 0) {
    return res.json({ products: [], count: 0 })
  }

  const targetIds = Array.from(new Set(rels.map((r) => r.target_product_id)))
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "subtitle",
      "thumbnail",
      "handle",
      "status",
      "metadata",
      "variants.id",
      "variants.prices.*",
    ],
    filters: { id: targetIds },
  })

  // Pega currency_code da region default BR (fallback "brl"). Em escala maior,
  // ler region do header/cookie via middleware.
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })
  const currency =
    (regions[0] as { currency_code?: string } | undefined)?.currency_code ??
    "brl"

  // Filtra só publicados + extrai preço da currency
  type Variant = {
    id: string
    prices?: Array<{ amount: number; currency_code: string }>
  }
  type Product = {
    id: string
    title: string | null
    subtitle: string | null
    thumbnail: string | null
    handle: string | null
    status: string | null
    metadata: Record<string, unknown> | null
    variants?: Variant[]
  }

  const byId = new Map<string, Record<string, unknown>>()
  for (const p of products as unknown as Product[]) {
    if (p.status !== "published") continue
    const firstVariant = p.variants?.[0]
    const price = firstVariant?.prices?.find(
      (pr) => pr.currency_code?.toLowerCase() === currency.toLowerCase()
    )
    byId.set(p.id, {
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      thumbnail: p.thumbnail,
      handle: p.handle,
      metadata: p.metadata,
      variants: firstVariant
        ? [
            {
              id: firstVariant.id,
              calculated_price: price
                ? {
                    calculated_amount: price.amount,
                    currency_code: price.currency_code,
                  }
                : null,
            },
          ]
        : [],
    })
  }
  const ordered = rels
    .map((r) => byId.get(r.target_product_id))
    .filter(Boolean)

  return res.json({
    products: ordered,
    count: ordered.length,
    type: type ?? "all",
    currency_code: currency,
  })
}
