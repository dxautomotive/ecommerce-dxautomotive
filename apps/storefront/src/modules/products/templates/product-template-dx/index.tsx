import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductGalleryDX from "@modules/products/components/product-gallery-dx"
import GuaranteeHighlight from "@modules/products/components/guarantee-highlight"
import ProductTabsDX from "@modules/products/components/product-tabs-dx"
import VehicleCompatibility from "@modules/products/components/vehicle-compatibility"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import TrustSignals from "@modules/products/components/trust-signals"
import CompatibilityBadge from "@modules/products/components/compatibility-badge"
import AiSummary from "@modules/products/components/ai-summary"
import CompatibilityChecker from "@modules/products/components/compatibility-checker"
import BuyBox from "@modules/products/components/buy-box"
import ProductActionsWrapper from "../product-actions-wrapper"

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

/**
 * Template DX da página de produto v2.1 (KaBuM 3 colunas).
 *
 * Proporção espelha a KaBuM real: grid 12-col com gap 32px.
 *   ┌─────────────────┬──────────┬──────────┐
 *   │ Galeria (6/12)  │ Info 3/12│ Buy 3/12 │
 *   │ 50%             │ 25%      │ 25%      │
 *   │                 │ (titulo, │ (sticky) │
 *   │                 │  ai,     │          │
 *   │                 │  tabs)   │          │
 *   └─────────────────┴──────────┴──────────┘
 *
 * Abaixo do grid: TrustSignals 4-col (full width) + Garantia + RelatedProducts.
 *
 * Mobile/medium: stack — ordem galeria → info → buy box.
 */
export default function ProductTemplateDX({
  product,
  region,
  countryCode,
  images,
}: Props) {
  if (!product || !product.id) {
    return notFound()
  }

  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const sku = product.variants?.[0]?.sku
  const aiSummaryItems = extractAiSummary(meta, product)

  return (
    <>
      <Breadcrumb product={product} />

      <section
        className="content-container grid grid-cols-1 large:grid-cols-12 gap-6 large:gap-8 py-6 small:py-10"
        data-testid="product-container"
      >
        <div className="large:col-span-6 min-w-0">
          <ProductGalleryDX images={images} alt={product.title || ""} />
        </div>

        <div className="large:col-span-3 flex flex-col gap-5 min-w-0">
          {product.collection?.title && (
            <span className="text-brand-cyan text-[10px] uppercase tracking-[0.2em] font-bold">
              {product.collection.title}
            </span>
          )}

          <div>
            <h1 className="text-2xl small:text-3xl font-extrabold text-brand-text leading-tight">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-brand-text-2 text-base mt-2">
                {product.subtitle}
              </p>
            )}
            {sku && (
              <p className="text-brand-text-3 text-xs mt-2 uppercase tracking-wider">
                SKU:{" "}
                <span className="text-brand-text-2 font-mono">{sku}</span>
              </p>
            )}
          </div>

          <CompatibilityBadge metadata={meta as any} />

          {aiSummaryItems.length > 0 && <AiSummary items={aiSummaryItems} />}

          <CompatibilityChecker productId={product.id} />

          <ProductTabsDX product={product} />

          <VehicleCompatibility productId={product.id} />
        </div>

        <div className="large:col-span-3 min-w-0">
          <div className="large:sticky large:top-24">
            <Suspense
              fallback={
                <BuyBox
                  product={product}
                  region={region}
                  actionsSlot={null}
                />
              }
            >
              <BuyBox
                product={product}
                region={region}
                actionsSlot={
                  <ProductActionsWrapper id={product.id} region={region} />
                }
              />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="content-container py-6 small:py-10">
        <TrustSignals />
      </section>

      <GuaranteeHighlight />

      <section
        className="content-container my-12 small:my-20"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </section>
    </>
  )
}

/**
 * Extrai bullets pro AiSummary. Prioridade:
 *   1. metadata.ai_summary (array de strings ou string com `\n`)
 *   2. metadata.highlights (array)
 *   3. fallback: extrai 2-3 frases curtas da descrição (heurística simples)
 */
function extractAiSummary(
  meta: Record<string, unknown>,
  product: HttpTypes.StoreProduct
): string[] {
  const fromMeta = meta.ai_summary ?? meta.highlights
  if (Array.isArray(fromMeta) && fromMeta.length > 0) {
    return fromMeta.filter((x): x is string => typeof x === "string")
  }
  if (typeof fromMeta === "string" && fromMeta.trim()) {
    return fromMeta
      .split(/\n+/)
      .map((s) => s.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean)
  }

  const desc = product.description?.trim()
  if (!desc) return []
  return desc
    .split(/(?:[.!?]\s+|\n+)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 180)
    .slice(0, 4)
}

function Breadcrumb({ product }: { product: HttpTypes.StoreProduct }) {
  const cat = product.categories?.[0]
  return (
    <nav
      aria-label="Caminho de navegação"
      className="content-container py-4 text-xs text-brand-text-3"
    >
      <ol className="flex items-center gap-2 flex-wrap">
        <li>
          <LocalizedClientLink
            href="/"
            className="hover:text-brand-text transition-colors"
          >
            Início
          </LocalizedClientLink>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <LocalizedClientLink
            href="/store"
            className="hover:text-brand-text transition-colors"
          >
            Loja
          </LocalizedClientLink>
        </li>
        {cat && (
          <>
            <li aria-hidden="true">/</li>
            <li>
              <LocalizedClientLink
                href={`/categories/${cat.handle}`}
                className="hover:text-brand-text transition-colors"
              >
                {cat.name}
              </LocalizedClientLink>
            </li>
          </>
        )}
        <li aria-hidden="true">/</li>
        <li
          className="text-brand-text font-medium truncate max-w-xs"
          title={product.title}
        >
          {product.title}
        </li>
      </ol>
    </nav>
  )
}
