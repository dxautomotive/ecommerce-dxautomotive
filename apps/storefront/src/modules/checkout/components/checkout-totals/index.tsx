"use client"

import { PAYMENT_CONFIG, formatMoney } from "@lib/util/payment-display"

type Props = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
}

/**
 * Totais do pedido no padrão visual DX (dark + brand) e em pt-BR.
 * Inclui destaque para o valor à vista no Pix (-10%) sob o total.
 */
const CheckoutTotals = ({ totals }: Props) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  const currency = currency_code ?? "BRL"
  const fmt = (n: number) => formatMoney(n, currency)
  const totalSafe = total ?? 0
  const pixValue = totalSafe * (1 - PAYMENT_CONFIG.pixDiscount)
  const pixSavings = totalSafe - pixValue

  return (
    <div className="flex flex-col gap-y-2 text-sm">
      <Row label="Subtotal" value={fmt(item_subtotal ?? 0)} testId="cart-subtotal" testValue={item_subtotal || 0} />
      <Row
        label="Frete"
        value={
          (shipping_subtotal ?? 0) > 0
            ? fmt(shipping_subtotal ?? 0)
            : "—"
        }
        testId="cart-shipping"
        testValue={shipping_subtotal || 0}
      />
      {!!discount_subtotal && (
        <Row
          label="Desconto"
          value={`- ${fmt(discount_subtotal ?? 0)}`}
          valueClass="text-brand-success font-semibold"
          testId="cart-discount"
          testValue={discount_subtotal || 0}
        />
      )}
      {!!tax_total && tax_total > 0 && (
        <Row
          label="Impostos"
          value={fmt(tax_total ?? 0)}
          testId="cart-taxes"
          testValue={tax_total || 0}
        />
      )}

      <div className="border-t border-brand-border my-2" />

      <div className="flex items-center justify-between">
        <span className="text-brand-text font-semibold text-base">Total</span>
        <span
          className="text-brand-text font-extrabold text-xl"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {fmt(totalSafe)}
        </span>
      </div>

      {totalSafe > 0 && (
        <div className="bg-brand-success/10 border border-brand-success/30 rounded-lg px-3 py-2.5 mt-2 flex items-start gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-success text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
            Pix
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-brand-muted">à vista no Pix</span>
              <span className="text-brand-success font-extrabold text-base">
                {fmt(pixValue)}
              </span>
            </div>
            <span className="text-[11px] text-brand-success/80">
              Economia de {fmt(pixSavings)} ({Math.round(PAYMENT_CONFIG.pixDiscount * 100)}% de desconto)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

const Row = ({
  label,
  value,
  valueClass,
  testId,
  testValue,
}: {
  label: string
  value: string
  valueClass?: string
  testId?: string
  testValue?: number | null
}) => (
  <div className="flex items-center justify-between text-brand-muted">
    <span>{label}</span>
    <span
      className={valueClass ?? "text-brand-text"}
      data-testid={testId}
      data-value={testValue ?? 0}
    >
      {value}
    </span>
  </div>
)

export default CheckoutTotals
