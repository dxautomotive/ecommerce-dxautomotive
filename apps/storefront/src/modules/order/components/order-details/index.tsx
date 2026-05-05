import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const FULFILLMENT_STATUS_PT: Record<string, string> = {
  not_fulfilled: "Aguardando preparação",
  partially_fulfilled: "Parcialmente preparado",
  fulfilled: "Preparado",
  partially_shipped: "Parcialmente enviado",
  shipped: "Enviado",
  partially_returned: "Parcialmente devolvido",
  returned: "Devolvido",
  canceled: "Cancelado",
  delivered: "Entregue",
}

const PAYMENT_STATUS_PT: Record<string, string> = {
  not_paid: "Aguardando pagamento",
  awaiting: "Aguardando confirmação",
  authorized: "Autorizado",
  partially_authorized: "Parcialmente autorizado",
  captured: "Pago",
  partially_captured: "Parcialmente pago",
  partially_refunded: "Parcialmente estornado",
  refunded: "Estornado",
  canceled: "Cancelado",
  requires_action: "Requer ação",
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

const StatusBadge = ({
  label,
  variant,
}: {
  label: string
  variant: "neutral" | "success" | "warning"
}) => {
  const cls =
    variant === "success"
      ? "bg-brand-success/10 text-brand-success border-brand-success/30"
      : variant === "warning"
      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
      : "bg-brand-bg text-brand-muted border-brand-border"
  return (
    <span
      className={`inline-flex items-center text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded border ${cls}`}
    >
      {label}
    </span>
  )
}

const variantFor = (status: string): "neutral" | "success" | "warning" => {
  if (["captured", "shipped", "delivered", "fulfilled"].includes(status)) return "success"
  if (["not_paid", "awaiting", "not_fulfilled"].includes(status)) return "warning"
  return "neutral"
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-5 small:p-6">
      <p className="text-sm text-brand-muted">
        Confirmação enviada para{" "}
        <strong className="text-brand-text" data-testid="order-email">
          {order.email}
        </strong>
        .
      </p>

      <div className="mt-4 grid grid-cols-1 small:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="block text-xs text-brand-muted">Data do pedido</span>
          <span className="text-brand-text font-semibold" data-testid="order-date">
            {fmtDate(order.created_at)}
          </span>
        </div>
        <div>
          <span className="block text-xs text-brand-muted">Número do pedido</span>
          <span className="text-brand-text font-mono font-bold" data-testid="order-id">
            #{order.display_id}
          </span>
        </div>
        {showStatus && (
          <div className="flex flex-col gap-1.5">
            <span className="block text-xs text-brand-muted">Status</span>
            <div className="flex flex-wrap items-center gap-2" data-testid="order-status">
              <StatusBadge
                label={
                  PAYMENT_STATUS_PT[order.payment_status] ?? order.payment_status
                }
                variant={variantFor(order.payment_status)}
              />
              <StatusBadge
                label={
                  FULFILLMENT_STATUS_PT[order.fulfillment_status] ??
                  order.fulfillment_status
                }
                variant={variantFor(order.fulfillment_status)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
