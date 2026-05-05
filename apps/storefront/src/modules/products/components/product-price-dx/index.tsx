"use client"

import { useState } from "react"
import {
  PAYMENT_CONFIG,
  formatMoney,
  getDefaultInstallment,
} from "@lib/util/payment-display"
import ParcelamentoModal from "@modules/products/components/parcelamento-modal"

type Props = {
  /** Preço calculado em unidade da moeda (ex.: 1899.00) */
  amount: number
  /** Preço original (antes do desconto) — opcional */
  originalAmount?: number | null
  currency: string
  /** Indica que é um preço promocional (price_type === "sale") */
  onSale?: boolean
}

/**
 * Bloco de preço estilo DX/Vision para a página de produto.
 * Exibe (de cima para baixo):
 *  1. Preço original riscado com tag de desconto (se onSale)
 *  2. Preço PIX em destaque com badge "10% OFF"
 *  3. Preço cheio + maior parcela sem juros
 *  4. Link "Ver formas de pagamento" → abre modal completo
 */
export default function ProductPriceDX({
  amount,
  originalAmount,
  currency,
  onSale,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const pixPrice = amount * (1 - PAYMENT_CONFIG.pixDiscount)
  const boletoPrice = amount * (1 - PAYMENT_CONFIG.boletoDiscount)
  const installment = getDefaultInstallment(amount)

  const fmt = (n: number) => formatMoney(n, currency)
  const pixOffPct = Math.round(PAYMENT_CONFIG.pixDiscount * 100)

  return (
    <div className="flex flex-col gap-3" data-testid="product-price-dx">
      {originalAmount != null && onSale && originalAmount > amount && (
        <div className="flex items-baseline gap-2 text-sm">
          <span className="text-brand-muted line-through">de {fmt(originalAmount)}</span>
          <span className="bg-brand-warning/15 text-brand-warning text-xs font-bold uppercase px-2 py-0.5 rounded">
            {Math.round(((originalAmount - amount) / originalAmount) * 100)}% OFF
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <PixIcon />
            <span className="text-3xl small:text-4xl font-extrabold text-brand-text leading-none">
              {fmt(pixPrice)}
            </span>
          </div>
          <span className="bg-brand-pix/15 text-brand-pix text-xs font-bold uppercase px-2 py-1 rounded tracking-wider">
            no Pix · {pixOffPct}% off
          </span>
        </div>
        <p className="text-sm text-brand-muted">
          Aprovação imediata — desconto à vista
        </p>
      </div>

      <div className="border-t border-brand-border pt-3 flex flex-col gap-1">
        <p className="text-sm text-brand-text">
          ou <strong>{fmt(amount)}</strong> em até{" "}
          <strong>{installment?.n}x</strong> de{" "}
          <strong>{fmt(installment?.value ?? 0)}</strong>{" "}
          <span className="text-brand-success">sem juros</span>
        </p>
        <p className="text-xs text-brand-muted">
          Boleto: <strong>{fmt(boletoPrice)}</strong>{" "}
          ({Math.round(PAYMENT_CONFIG.boletoDiscount * 100)}% off)
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="self-start text-sm text-brand-primary hover:text-brand-primary-hover font-semibold underline-offset-4 hover:underline mt-1"
        >
          Ver todas as formas de pagamento →
        </button>
      </div>

      <ParcelamentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={amount}
        currency={currency}
      />
    </div>
  )
}

function PixIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path
        d="M5 12L12 5L19 12L12 19L5 12Z"
        stroke="#32BCAD"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L12 9L15 12L12 15L9 12Z"
        fill="#32BCAD"
      />
    </svg>
  )
}
