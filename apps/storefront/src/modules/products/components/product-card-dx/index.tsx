import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

/**
 * Card de produto estilo DX/Vision:
 * - imagem com aspect-square
 * - badge de promo se houver desconto
 * - preço Pix em destaque + parcelamento exibido
 * - hover com ring azul + lift
 *
 * Esquema de Pix (10% off) e parcelamento (10x sem juros) por enquanto é
 * fixo. Em uma sessão futura vai vir do admin (Store metadata) ou env.
 */
const PIX_DISCOUNT = 0.1
const INSTALLMENTS = 10

export default function ProductCardDX({ product, region }: Props) {
  const { cheapestPrice } = getProductPrice({ product })
  const calculated = cheapestPrice?.calculated_price_number
  const original = cheapestPrice?.original_price_number
  const onSale = cheapestPrice?.price_type === "sale"

  const pixPrice = calculated != null ? calculated * (1 - PIX_DISCOUNT) : null
  const installmentValue = calculated != null ? calculated / INSTALLMENTS : null

  const fmt = (n?: number | null) =>
    n == null
      ? null
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: region.currency_code.toUpperCase(),
        }).format(n)

  const thumb = product.thumbnail || product.images?.[0]?.url

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group flex flex-col bg-brand-surface border border-brand-border rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-xl hover:shadow-brand-primary/10 transition-all"
      data-testid="product-card-dx"
    >
      <div className="relative aspect-square bg-brand-bg overflow-hidden">
        {thumb ? (
          <Image
            src={thumb}
            alt={product.title || ""}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl text-brand-border" aria-hidden="true">
            📦
          </div>
        )}

        {onSale && (
          <span className="absolute top-3 left-3 bg-brand-warning text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded">
            Promoção
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="text-brand-text text-sm small:text-base font-semibold leading-snug line-clamp-2 min-h-[2.5em]">
          {product.title}
        </h3>

        <div className="mt-auto flex flex-col gap-1">
          {original != null && onSale && (
            <span className="text-xs text-brand-muted line-through">
              de {fmt(original)}
            </span>
          )}
          {pixPrice != null && (
            <div className="flex items-baseline gap-2">
              <span className="text-xl small:text-2xl font-extrabold text-brand-text">
                {fmt(pixPrice)}
              </span>
              <span className="text-xs text-brand-pix font-bold uppercase">no Pix</span>
            </div>
          )}
          {calculated != null && (
            <span className="text-xs text-brand-muted">
              ou <strong className="text-brand-text">{fmt(calculated)}</strong>{" "}
              em até <strong className="text-brand-text">{INSTALLMENTS}x</strong>{" "}
              de <strong className="text-brand-text">{fmt(installmentValue ?? 0)}</strong>{" "}
              sem juros
            </span>
          )}
        </div>

        <div className="mt-3 inline-flex items-center justify-center gap-2 bg-brand-primary group-hover:bg-brand-primary-hover text-white text-sm font-semibold py-2 rounded transition-colors">
          Ver produto
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
