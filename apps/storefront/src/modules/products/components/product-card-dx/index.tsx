"use client"

import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"
import {
  PAYMENT_CONFIG,
  formatMoney,
  getDefaultInstallment,
} from "@lib/util/payment-display"

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

/**
 * ProductCardDX v2.1 (KaBuM-inspired, seção 8 do guide).
 *
 * Layout:
 *   - imagem aspect-square com bg-brand-surface-2
 *   - badges absolutos (desconto, frete grátis) no top-left
 *   - botão favorito no hover (top-right)
 *   - corpo: categoria (cyan eyebrow) → título → compat (se houver)
 *     → stars (futuro) → preço Pix com gradient elétrico → parcelamento
 *   - CTA "Adicionar" com bg-grad-primary + glow
 *
 * Hover: border-brand-primary + lift (-translate-y-0.5) + shadow.
 */
export default function ProductCardDX({ product, region }: Props) {
  const { cheapestPrice } = getProductPrice({ product })
  const calculated = cheapestPrice?.calculated_price_number
  const original = cheapestPrice?.original_price_number
  const onSale = cheapestPrice?.price_type === "sale"

  const pixPrice =
    calculated != null ? calculated * (1 - PAYMENT_CONFIG.pixDiscount) : null
  const installment = calculated != null ? getDefaultInstallment(calculated) : null
  const discountPct =
    onSale && original != null && calculated != null && original > calculated
      ? Math.round(((original - calculated) / original) * 100)
      : null

  const fmt = (n: number | null | undefined) => formatMoney(n, region.currency_code)
  const thumb = product.thumbnail || product.images?.[0]?.url
  const category = product.collection?.title || product.categories?.[0]?.name
  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const compat =
    typeof meta.compatibilidade === "string" ? meta.compatibilidade : null
  const freeShipping =
    calculated != null && calculated * 100 >= PAYMENT_CONFIG.freeShippingThreshold

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group flex flex-col bg-brand-surface border border-brand-border rounded-xl overflow-hidden transition-all duration-200 hover:border-brand-primary hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
      data-testid="product-card-dx"
    >
      <div className="relative aspect-square bg-brand-surface-2 flex items-center justify-center">
        {thumb ? (
          <Image
            src={thumb}
            alt={product.title || ""}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="text-6xl text-brand-border-2"
            aria-hidden="true"
          >
            📦
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {discountPct != null && discountPct > 0 && (
            <span className="text-[11px] font-black uppercase bg-brand-danger text-white px-2 py-0.5 rounded-[4px]">
              ⚡ {discountPct}% OFF
            </span>
          )}
          {freeShipping && (
            <span className="text-[11px] font-black uppercase bg-brand-success text-white px-2 py-0.5 rounded-[4px]">
              FRETE GRÁTIS
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label="Adicionar aos favoritos"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-text-3 opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-primary hover:border-brand-primary"
        >
          <HeartIcon />
        </button>
      </div>

      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        {category && (
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-brand-cyan">
            {category}
          </p>
        )}

        <h3 className="text-[14px] font-semibold text-brand-text leading-[1.35] line-clamp-2 min-h-[2.7em]">
          {product.title}
        </h3>

        {compat && (
          <p className="text-[11px] text-brand-text-2 flex items-center gap-1.5">
            <span
              className="w-1 h-1 rounded-full bg-brand-success flex-shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{compat}</span>
          </p>
        )}

        <div className="mt-1">
          {original != null && onSale && (
            <p className="text-[12px] text-brand-text-3 line-through">
              {fmt(original)}
            </p>
          )}
          {pixPrice != null && (
            <div className="flex items-baseline gap-1.5">
              <p className="text-[17px] font-black text-grad-electric leading-none">
                {fmt(pixPrice)}
              </p>
              <span className="text-[10px] font-bold text-brand-pix bg-brand-pix/10 px-1.5 py-0.5 rounded-[4px]">
                PIX
              </span>
            </div>
          )}
          {calculated != null && installment && (
            <p className="text-[11px] text-brand-text-2 mt-0.5">
              ou{" "}
              <strong className="text-brand-text">
                {installment.n}x de {fmt(installment.value)}
              </strong>{" "}
              sem juros
            </p>
          )}
        </div>

        <div className="mt-auto pt-3 inline-flex items-center justify-center gap-2 bg-grad-primary text-white text-[13px] font-bold py-2.5 rounded-md shadow-glow-sm group-hover:shadow-glow-primary transition-all">
          Ver produto
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}

function HeartIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
