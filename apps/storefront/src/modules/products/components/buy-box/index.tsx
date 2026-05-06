import { HttpTypes } from "@medusajs/types"

import {
  PAYMENT_CONFIG,
  formatMoney,
  getDefaultInstallment,
} from "@lib/util/payment-display"
import { getProductPrice } from "@lib/util/get-product-price"
import FreteCalculator from "@modules/products/components/frete-calculator"
import WhatsAppProductButton from "@modules/products/components/whatsapp-product-button"

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  /** Slot do ProductActions (variantes + botão Adicionar ao carrinho) */
  actionsSlot: React.ReactNode
}

const trustItems = [
  { icon: "🛡️", text: "Garantia 2 anos direto com a loja" },
  { icon: "🔒", text: "Compra 100% segura" },
  { icon: "🔄", text: "Troca em até 7 dias" },
  { icon: "🚚", text: "Frete grátis acima de R$ 499" },
] as const

/**
 * BuyBox v2.1 — coluna 3 da PDP (320px sticky desktop).
 *
 * Consolida tudo da seção 9.1 do guide:
 *  - Vendido por DX (loja oficial)
 *  - Preço original riscado
 *  - Preço Pix com gradiente elétrico (text-grad-electric) + badge 10% off
 *  - Preço cartão + parcelamento sem juros
 *  - Estoque badge verde
 *  - CTAs: actionsSlot (variantes + Adicionar) + WhatsApp + Favoritos
 *  - Calcular frete inline
 *  - Trust signals vertical (4 linhas com ícone)
 *
 * `actionsSlot` é injetado pelo template (vem de Suspense/server) com o
 * `<ProductActions>` que contém o seletor de variantes e o botão azul.
 */
export default function BuyBox({ product, region, actionsSlot }: Props) {
  const { cheapestPrice } = getProductPrice({ product })
  const amount = cheapestPrice?.calculated_price_number ?? 0
  const originalAmount = cheapestPrice?.original_price_number ?? null
  const onSale =
    cheapestPrice?.price_type === "sale" &&
    originalAmount != null &&
    originalAmount > amount

  const pixPrice = amount * (1 - PAYMENT_CONFIG.pixDiscount)
  const installment = getDefaultInstallment(amount)

  const fmt = (n: number) => formatMoney(n, region.currency_code)
  const pixOffPct = Math.round(PAYMENT_CONFIG.pixDiscount * 100)

  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const weight =
    typeof meta.peso_gramas === "number"
      ? meta.peso_gramas
      : typeof meta.peso_gramas === "string"
        ? Number(meta.peso_gramas) || null
        : null

  return (
    <aside className="bg-brand-surface border border-brand-primary/15 rounded-xl p-5 shadow-glow-primary">
      <p className="text-[11px] text-brand-text-2 mb-1">
        Vendido por{" "}
        <span className="text-brand-cyan font-semibold">DX Automotive</span>{" "}
        · <span className="text-brand-success font-bold">Loja oficial ✓</span>
      </p>

      <hr className="border-brand-border my-3" />

      {onSale && originalAmount != null && (
        <p className="text-[13px] text-brand-text-3 line-through">
          {fmt(originalAmount)}
        </p>
      )}

      <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
        <span className="text-[28px] font-black text-grad-electric leading-none">
          {fmt(pixPrice)}
        </span>
        <span className="text-[12px] font-bold text-brand-pix bg-brand-pix/10 px-2 py-0.5 rounded-[4px]">
          PIX {pixOffPct}% OFF
        </span>
      </div>
      <p className="text-[11px] text-brand-pix font-semibold mb-3">
        ⚡ Aprovação imediata
      </p>

      <hr className="border-brand-border my-3" />

      <p className="text-[15px] font-bold text-brand-text-2 mb-0.5">
        {fmt(amount)} no cartão
      </p>
      {installment && (
        <p className="text-[13px] text-brand-text-2 mb-4">
          ou{" "}
          <strong className="text-brand-text">
            {installment.n}x de {fmt(installment.value)}
          </strong>{" "}
          sem juros
        </p>
      )}

      <div className="flex items-center gap-2 text-[13px] font-semibold mb-4">
        <span
          className="w-2 h-2 rounded-full bg-brand-success flex-shrink-0"
          aria-hidden="true"
        />
        <span className="text-brand-success">Em estoque</span>
        <span className="text-brand-text-2">· Envio em 1 dia útil</span>
      </div>

      <div className="flex flex-col gap-2 mb-3">{actionsSlot}</div>

      <WhatsAppProductButton
        productTitle={product.title || ""}
        productHandle={product.handle}
      />

      <button
        type="button"
        className="mt-2 w-full flex items-center justify-center gap-1.5 bg-transparent border border-brand-border-2 text-brand-text-2 font-semibold text-[13px] py-2.5 rounded-md hover:border-brand-silver-dim hover:text-brand-text transition-all"
      >
        <HeartIcon /> Adicionar aos favoritos
      </button>

      <div className="mt-3.5">
        <FreteCalculator weightGrams={weight} />
      </div>

      <div className="flex flex-col gap-2 mt-3.5">
        {trustItems.map(({ icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 text-[12px] text-brand-text-2"
          >
            <span aria-hidden="true">{icon}</span>
            {text}
          </div>
        ))}
      </div>
    </aside>
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
