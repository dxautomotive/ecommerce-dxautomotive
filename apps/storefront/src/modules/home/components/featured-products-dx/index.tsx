import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCardDX from "@modules/products/components/product-card-dx"

type Props = {
  region: HttpTypes.StoreRegion
  title?: string
  eyebrow?: string
  description?: string
  /** filtros para a query — útil para "Mais vendidos", "Promoção", etc. */
  query?: Record<string, unknown>
  /** quantidade de produtos a exibir */
  limit?: number
  /** link "Ver todos" */
  seeAllHref?: string
  /** filtra por handle de categoria (page-builder integration) */
  categoryHandle?: string
}

export default async function FeaturedProductsDX({
  region,
  title = "Em destaque",
  eyebrow = "Selecionados pra você",
  description,
  query,
  limit = 8,
  seeAllHref = "/store",
  categoryHandle,
}: Props) {
  let extraQuery: Record<string, unknown> = { ...(query ?? {}) }
  if (categoryHandle) {
    const { listCategories } = await import("@lib/data/categories")
    const cats = await listCategories({ limit: 100 })
    const cat = cats.find((c) => c.handle === categoryHandle)
    if (cat) extraQuery = { ...extraQuery, category_id: [cat.id] }
  }
  const { response } = await listProducts({
    countryCode: region.countries?.[0]?.iso_2 || "br",
    queryParams: { limit, ...(extraQuery as any) },
  })

  if (!response.products?.length) return null

  return (
    <section className="content-container py-16 small:py-20">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8 small:mb-10">
        <div>
          {eyebrow && (
            <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-semibold">
              {eyebrow}
            </span>
          )}
          <h2 className="text-3xl small:text-4xl font-extrabold text-brand-text mt-2">
            {title}
          </h2>
          {description && (
            <p className="text-brand-muted mt-2 max-w-xl">{description}</p>
          )}
        </div>
        <LocalizedClientLink
          href={seeAllHref}
          className="text-brand-primary hover:text-brand-text font-semibold text-sm flex items-center gap-1 transition-colors"
        >
          Ver todos <span aria-hidden="true">→</span>
        </LocalizedClientLink>
      </div>

      <div className="grid grid-cols-2 medium:grid-cols-4 gap-3 small:gap-5">
        {response.products.slice(0, limit).map((p) => (
          <ProductCardDX key={p.id} product={p} region={region} />
        ))}
      </div>
    </section>
  )
}
