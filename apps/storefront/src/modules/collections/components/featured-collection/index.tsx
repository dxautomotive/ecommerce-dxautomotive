import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getDXMeta } from "@lib/util/collection-meta"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCardDX from "@modules/products/components/product-card-dx"

type Props = {
  collection: HttpTypes.StoreCollection
  countryCode: string
  /** Quantos produtos exibir (default 8) */
  limit?: number
}

/**
 * Bloco "Coleção em destaque" no padrão DX, inspirado no
 * `featured-collection.liquid` do tema Vision: header com gradient
 * customizável, título + subtítulo + CTA, e scroller horizontal de
 * produtos.
 *
 * Server component — busca os produtos da coleção via API e renderiza
 * direto. Os campos de visual (gradient, CTA, layout) vêm do
 * `metadata` da coleção, editável pelo widget admin.
 */
export default async function FeaturedCollection({
  collection,
  countryCode,
  limit = 8,
}: Props) {
  const meta = getDXMeta(collection)
  const region = await getRegion(countryCode)

  if (!region) return null

  const { response } = await listProducts({
    countryCode,
    queryParams: {
      collection_id: [collection.id],
      limit,
      fields: "*variants.calculated_price",
    },
  })
  const products = response.products

  if (products.length === 0) return null

  const gradient = `linear-gradient(${meta.gradient_deg ?? 135}deg, ${
    meta.gradient_from ?? "#1e40af"
  }, ${meta.gradient_to ?? "#0ea5e9"})`

  const ctaUrl = meta.cta_url || `/colecoes/${collection.handle}`
  const ctaLabel = meta.cta_label || "Ver tudo →"
  const layout = meta.layout ?? "vertical"

  return (
    <section
      className="content-container my-12 small:my-16"
      data-testid="featured-collection"
      data-collection-handle={collection.handle}
    >
      <div
        className="rounded-2xl overflow-hidden border border-brand-border"
        style={{ background: gradient }}
      >
        {/* Header */}
        <header className="px-6 small:px-10 pt-8 small:pt-12 pb-6 flex flex-col small:flex-row small:items-end small:justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-white/80 text-[10px] uppercase tracking-[0.25em] font-bold block">
              Coleção em destaque
            </span>
            <h2 className="text-white text-2xl small:text-4xl font-extrabold mt-2 leading-tight">
              {collection.title}
            </h2>
            {meta.subtitle && (
              <p className="text-white/85 text-sm small:text-base mt-2">
                {meta.subtitle}
              </p>
            )}
          </div>
          <LocalizedClientLink
            href={ctaUrl}
            className="self-start small:self-end inline-flex items-center bg-white/15 hover:bg-white/25 text-white text-sm font-semibold px-5 py-2.5 rounded-md backdrop-blur transition-colors whitespace-nowrap"
          >
            {ctaLabel}
          </LocalizedClientLink>
        </header>

        {/* Produtos */}
        <div className="bg-brand-bg p-4 small:p-6">
          {layout === "horizontal" ? (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex-shrink-0 w-[260px] small:w-[280px] snap-start"
                >
                  <ProductCardDX product={p} region={region} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCardDX key={p.id} product={p} region={region} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
