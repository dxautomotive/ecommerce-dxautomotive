"use client"

import { useMemo } from "react"
import { PAYMENT_CONFIG, formatMoney } from "@lib/util/payment-display"

type Props = {
  subtotal: number // unidade da moeda (não centavos)
  currency: string
}

/**
 * Barra de progresso para frete grátis. Mostra:
 *  - "Faltam R$ X para frete grátis" + barra
 *  - "🎉 Você ganhou frete grátis!" quando atingido
 */
export default function FreeShippingBar({ subtotal, currency }: Props) {
  const threshold = PAYMENT_CONFIG.freeShippingThreshold / 100 // em unidades
  const remaining = Math.max(0, threshold - subtotal)
  const pct = Math.min(100, (subtotal / threshold) * 100)

  const message = useMemo(() => {
    if (remaining <= 0) return "🎉 Você ganhou frete grátis!"
    return (
      <>
        Faltam{" "}
        <strong className="text-brand-text">{formatMoney(remaining, currency)}</strong>{" "}
        para você ganhar <strong className="text-brand-primary">frete grátis</strong>
      </>
    )
  }, [remaining, currency])

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-4">
      <div className="flex items-center gap-2 text-sm text-brand-muted">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary" aria-hidden="true">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <span>{message}</span>
      </div>
      <div className="mt-2 h-2 bg-brand-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
