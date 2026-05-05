import { HttpTypes } from "@medusajs/types"

import CompatibilityBadge from "@modules/products/components/compatibility-badge"
import FreteCalculator from "@modules/products/components/frete-calculator"
import ProductPriceDX from "@modules/products/components/product-price-dx"
import WhatsAppProductButton from "@modules/products/components/whatsapp-product-button"
import { getProductPrice } from "@lib/util/get-product-price"

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  actionsSlot: React.ReactNode
}

/**
 * Painel direito da página de produto. Server component que monta:
 *   - Título + subtítulo + SKU
 *   - Compatibilidade (badge verde se metadata)
 *   - ProductPriceDX (Pix highlight, parcelamento, link modal)
 *   - actionsSlot (variantes + qtd + botão Comprar — vem do Suspense)
 *   - WhatsApp button "Falar com vendedor"
 *   - FreteCalculator (CEP + estimativa)
 */
export default function ProductInfoPanel({ product, region, actionsSlot }: Props) {
  const { cheapestPrice } = getProductPrice({ product })
  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const sku = product.variants?.[0]?.sku
  const weight =
    typeof meta.peso_gramas === "number"
      ? meta.peso_gramas
      : typeof meta.peso_gramas === "string"
        ? Number(meta.peso_gramas) || null
        : null

  return (
    <div className="flex flex-col gap-5">
      {product.collection?.title && (
        <span className="text-brand-primary text-xs uppercase tracking-[0.2em] font-semibold">
          {product.collection.title}
        </span>
      )}

      <div>
        <h1 className="text-2xl small:text-3xl font-extrabold text-brand-text leading-tight">
          {product.title}
        </h1>
        {product.subtitle && (
          <p className="text-brand-muted text-base mt-2">{product.subtitle}</p>
        )}
        {sku && (
          <p className="text-brand-muted text-xs mt-2 uppercase tracking-wider">
            SKU: <span className="text-brand-text font-mono">{sku}</span>
          </p>
        )}
      </div>

      <CompatibilityBadge metadata={meta as any} />

      {cheapestPrice && (
        <ProductPriceDX
          amount={cheapestPrice.calculated_price_number}
          originalAmount={cheapestPrice.original_price_number}
          currency={region.currency_code}
          onSale={cheapestPrice.price_type === "sale"}
        />
      )}

      <div className="flex flex-col gap-3 [&_button[type='submit']]:!bg-brand-primary [&_button[type='submit']]:hover:!bg-brand-primary-hover [&_button[type='submit']]:!text-white [&_button[type='submit']]:!font-semibold">
        {actionsSlot}
      </div>

      <WhatsAppProductButton
        productTitle={product.title || ""}
        productHandle={product.handle}
      />

      <FreteCalculator weightGrams={weight} />
    </div>
  )
}
