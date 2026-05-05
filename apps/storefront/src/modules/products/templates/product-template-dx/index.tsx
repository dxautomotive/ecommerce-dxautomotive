import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductGalleryDX from "@modules/products/components/product-gallery-dx"
import ProductTabsDX from "@modules/products/components/product-tabs-dx"
import VehicleCompatibility from "@modules/products/components/vehicle-compatibility"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import TrustBadges from "@modules/products/components/trust-badges"
import ProductInfoPanel from "@modules/products/templates/product-info-panel"
import ProductActionsWrapper from "../product-actions-wrapper"

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

/**
 * Template DX da página de produto.
 * Layout (desktop):
 *   ┌──────────────────────────────────────────────┐
 *   │ Breadcrumb                                   │
 *   ├──────────────────────────┬───────────────────┤
 *   │ Gallery (sticky)         │ Info panel        │
 *   │                          │ (preço, compra,   │
 *   │                          │  whatsapp, frete) │
 *   ├──────────────────────────┴───────────────────┤
 *   │ Trust badges (4)                             │
 *   ├──────────────────────────────────────────────┤
 *   │ Tabs (descrição/specs/compat./avaliações)   │
 *   ├──────────────────────────────────────────────┤
 *   │ Related products                             │
 *   └──────────────────────────────────────────────┘
 *
 * Mobile: tudo empilhado.
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

  return (
    <>
      <Breadcrumb product={product} />

      <section
        className="content-container grid grid-cols-1 medium:grid-cols-12 gap-6 small:gap-10 py-6 small:py-10"
        data-testid="product-container"
      >
        <div className="medium:col-span-7 large:col-span-8">
          <ProductGalleryDX images={images} alt={product.title || ""} />
        </div>

        <div className="medium:col-span-5 large:col-span-4">
          <div className="medium:sticky medium:top-32 flex flex-col gap-6">
            <Suspense
              fallback={
                <ProductInfoPanel
                  product={product}
                  region={region}
                  actionsSlot={null}
                />
              }
            >
              <ProductInfoPanel
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
        <TrustBadges />
      </section>

      <section className="content-container py-6 small:py-10">
        <VehicleCompatibility productId={product.id} />
      </section>

      <section className="content-container py-6 small:py-10">
        <ProductTabsDX product={product} />
      </section>

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

function Breadcrumb({ product }: { product: HttpTypes.StoreProduct }) {
  const cat = product.categories?.[0]
  return (
    <nav
      aria-label="Caminho de navegação"
      className="content-container py-4 text-xs text-brand-muted"
    >
      <ol className="flex items-center gap-2 flex-wrap">
        <li>
          <LocalizedClientLink href="/" className="hover:text-brand-text transition-colors">
            Início
          </LocalizedClientLink>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <LocalizedClientLink href="/store" className="hover:text-brand-text transition-colors">
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
        <li className="text-brand-text font-medium truncate max-w-xs" title={product.title}>
          {product.title}
        </li>
      </ol>
    </nav>
  )
}
