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
import CompatibilityBadge from "@modules/products/components/compatibility-badge"
import AiSummary from "@modules/products/components/ai-summary"
import CompatibilityChecker from "@modules/products/components/compatibility-checker"
import BuyBox from "@modules/products/components/buy-box"
import ProductHeaderActions from "@modules/products/components/product-header-actions"
import ProductReviews from "@modules/products/components/product-reviews"
import BundleSection from "@modules/products/components/bundle-section"
import ProductActionsWrapper from "../product-actions-wrapper"

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

/**
 * Template DX da página de produto v2.2 (KaBuM sticky layout).
 *
 * Grid 12-col com 2 linhas implícitas:
 *   Row 1 ┌──────────────────┬─────────┬──────────┐
 *         │ Gallery  (6/12)  │Info(3/12)│Buy (3/12)│  ← buy box coluna sticky
 *   Row 2 ├──────────────────────────────┤         │
 *         │ Tabs + Bundle   (9/12)       │ (vazio) │  ← buy box continua sticky
 *         └──────────────────────────────┴─────────┘
 *
 * Fora do grid: reviews, garantia, relacionados → sticky para aqui.
 * Mobile: empilha na ordem galeria → info → buy box → tabs.
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

  const variantImageMap: Record<string, string> = {}
  for (const v of product.variants ?? []) {
    const imgId = (v.metadata as { image_id?: unknown } | null | undefined)
      ?.image_id
    if (typeof imgId === "string" && imgId) variantImageMap[v.id] = imgId
  }

  return (
    <>
      <Breadcrumb product={product} />

      {/*
       * Grid principal — row 1 (galeria + info + buy box) + row 2 (tabs 9-col).
       * O buy box fica sticky pela altura total do grid, parando antes das reviews.
       */}
      <section
        className="content-container grid grid-cols-1 large:grid-cols-12 gap-6 large:gap-8 pt-2 pb-3"
        data-testid="product-container"
      >
        {/* ── Coluna 1: Galeria (6/12) ── */}
        <div className="large:col-span-6 min-w-0">
          <ProductGalleryDX
            images={images}
            alt={product.title || ""}
            variantImageMap={variantImageMap}
            initialVariantId={product.variants?.[0]?.id}
          />
        </div>

        {/* ── Coluna 2: Info (3/12) — inner sticky p/ título ficar visível ── */}
        <div className="large:col-span-3 min-w-0">
          <div className="flex flex-col gap-4 large:sticky large:top-24">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {product.collection?.title ? (
                <span className="text-brand-cyan text-[10px] uppercase tracking-[0.2em] font-bold">
                  {product.collection.title}
                </span>
              ) : (
                <span aria-hidden="true" />
              )}
              <ProductHeaderActions
                productId={product.id}
                productTitle={product.title || ""}
              />
            </div>

            <div>
              <h1 className="text-[20px] leading-[28px] font-bold text-brand-text">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="text-brand-text-2 text-[13px] mt-2">
                  {product.subtitle}
                </p>
              )}
              {sku && (
                <p className="text-brand-text-3 text-[11px] mt-2 uppercase tracking-wider">
                  SKU:{" "}
                  <span className="text-brand-text-2 font-mono">{sku}</span>
                </p>
              )}
            </div>

            <CompatibilityBadge metadata={meta as any} />

            {aiSummaryItems.length > 0 && <AiSummary items={aiSummaryItems} />}

            <CompatibilityChecker productId={product.id} />
          </div>
        </div>

        {/*
         * ── Coluna 3: Buy Box (3/12) — A COLUNA INTEIRA É STICKY ──
         *
         * h-fit: impede que a coluna estique para preencher a linha do grid,
         * permitindo que o sticky funcione pelo comprimento total do grid
         * (incluindo a row 2 com as tabs de 9 colunas abaixo).
         * z-10 garante que fique na frente do conteúdo da row 2 ao colidir.
         */}
        <div className="large:col-span-3 min-w-0 h-fit large:sticky large:top-24 large:z-10">
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

        {/*
         * ── Row 2: Tabs + Bundle (9/12) ──
         *
         * Ocupa as 9 colunas da esquerda, deixando as 3 da direita livres.
         * O buy box sticky "ocupa" visualmente essas 3 colunas enquanto o
         * usuário scrola por este conteúdo.
         */}
        <div
          id="produto-detalhes"
          className="large:col-span-9 min-w-0 flex flex-col gap-8 scroll-mt-24"
        >
          <BundleSection
            product={
              {
                id: product.id,
                title: product.title || "",
                thumbnail: product.thumbnail ?? null,
                handle: product.handle || "",
                variants: (product.variants ?? []).map((v) => ({
                  id: v.id,
                  calculated_price: (v as any).calculated_price,
                })),
              } as any
            }
            currencyCode={region.currency_code}
          />

          <ProductTabsDX product={product} />
          <VehicleCompatibility productId={product.id} />
        </div>
      </section>

      {/* ── Fora do grid: sticky para aqui ── */}

      <section
        id="avaliacoes"
        className="content-container scroll-mt-24 py-3"
      >
        <h2 className="text-[20px] small:text-[24px] font-extrabold text-brand-text mb-5">
          Avaliações dos clientes
        </h2>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 small:p-7">
          <ProductReviews productId={product.id} />
        </div>
      </section>

      <div className="py-3">
        <GuaranteeHighlight />
      </div>

      <Suspense
        fallback={
          <div className="content-container py-3">
            <SkeletonRelatedProducts />
          </div>
        }
      >
        <RelatedProducts product={product} countryCode={countryCode} />
      </Suspense>
    </>
  )
}

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
      className="content-container pt-3 pb-1 text-xs text-brand-text-3"
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
