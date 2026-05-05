import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const fmt = (amount?: number | null) => {
    if (amount == null) return "—"
    return convertToLocale({ amount, currency_code: order.currency_code })
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-5 small:p-6">
      <h2 className="text-base font-extrabold text-brand-text mb-4">
        Resumo financeiro
      </h2>
      <div className="flex flex-col gap-y-2 text-sm">
        <Row label="Subtotal" value={fmt(order.subtotal)} />
        {order.discount_total > 0 && (
          <Row
            label="Desconto"
            value={`- ${fmt(order.discount_total)}`}
            valueClass="text-brand-success font-semibold"
          />
        )}
        {order.gift_card_total > 0 && (
          <Row
            label="Gift card"
            value={`- ${fmt(order.gift_card_total)}`}
            valueClass="text-brand-success font-semibold"
          />
        )}
        <Row label="Frete" value={fmt(order.shipping_total)} />
        {order.tax_total > 0 && (
          <Row label="Impostos" value={fmt(order.tax_total)} />
        )}

        <div className="border-t border-brand-border my-2" />

        <div className="flex items-center justify-between">
          <span className="text-brand-text font-semibold">Total</span>
          <span className="text-brand-text font-extrabold text-lg">
            {fmt(order.total)}
          </span>
        </div>
      </div>
    </div>
  )
}

const Row = ({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) => (
  <div className="flex items-center justify-between text-brand-muted">
    <span>{label}</span>
    <span className={valueClass ?? "text-brand-text"}>{value}</span>
  </div>
)

export default OrderSummary
