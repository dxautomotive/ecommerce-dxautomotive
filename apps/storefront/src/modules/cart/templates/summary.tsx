"use client"

import { HttpTypes } from "@medusajs/types"

import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PAYMENT_CONFIG, formatMoney } from "@lib/util/payment-display"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) return "address"
  if (!cart?.shipping_methods?.length) return "delivery"
  return "payment"
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const total = cart.total ?? cart.subtotal ?? 0
  const pixPrice = total * (1 - PAYMENT_CONFIG.pixDiscount)
  const installmentN = PAYMENT_CONFIG.maxInstallmentsNoInterest
  const installmentValue = total / installmentN

  return (
    <div className="flex flex-col gap-5 bg-brand-surface border border-brand-border rounded-lg p-5 small:p-6">
      <h2 className="text-brand-text text-xl font-bold">Resumo do pedido</h2>

      <DiscountCode cart={cart} />

      <div className="border-t border-brand-border pt-4">
        <CartTotals totals={cart} />
      </div>

      <div className="border-t border-brand-border pt-4 flex flex-col gap-2">
        <p className="text-sm text-brand-text">
          Pagando no <strong className="text-brand-pix">Pix</strong>:{" "}
          <strong className="text-brand-text text-base">
            {formatMoney(pixPrice, cart.currency_code)}
          </strong>{" "}
          <span className="text-xs text-brand-muted">
            ({Math.round(PAYMENT_CONFIG.pixDiscount * 100)}% off)
          </span>
        </p>
        <p className="text-xs text-brand-muted">
          ou em até {installmentN}x de{" "}
          {formatMoney(installmentValue, cart.currency_code)} sem juros no
          cartão
        </p>
      </div>

      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        className="block w-full text-center bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-3.5 rounded-md transition-colors"
      >
        Finalizar compra
      </LocalizedClientLink>

      <LocalizedClientLink
        href="/store"
        className="text-center text-sm text-brand-muted hover:text-brand-text underline-offset-4 hover:underline transition-colors"
      >
        ← Continuar comprando
      </LocalizedClientLink>

      <div className="border-t border-brand-border pt-4 flex flex-col gap-2 text-xs text-brand-muted">
        <p className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-success" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Pagamento 100% seguro
        </p>
        <p className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-success" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Frete e devolução conforme política
        </p>
      </div>
    </div>
  )
}

export default Summary
