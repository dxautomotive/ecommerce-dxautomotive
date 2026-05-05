import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const shippingMethod = order.shipping_methods?.[0] as
    | (HttpTypes.StoreOrderShippingMethod & { name?: string })
    | undefined

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-5 small:p-6">
      <h2 className="text-base font-extrabold text-brand-text mb-4">
        Entrega
      </h2>
      <div className="grid grid-cols-1 small:grid-cols-3 gap-6 text-sm">
        <div data-testid="shipping-address-summary">
          <h3 className="text-brand-text font-semibold mb-1">Endereço</h3>
          <p className="text-brand-muted leading-relaxed">
            {order.shipping_address?.first_name} {order.shipping_address?.last_name}
            <br />
            {order.shipping_address?.address_1}
            {order.shipping_address?.address_2 && (
              <>
                <br />
                {order.shipping_address?.address_2}
              </>
            )}
            <br />
            {order.shipping_address?.postal_code} ·{" "}
            {order.shipping_address?.city}
            {order.shipping_address?.province &&
              `/${order.shipping_address.province.toUpperCase()}`}
          </p>
        </div>

        <div data-testid="shipping-contact-summary">
          <h3 className="text-brand-text font-semibold mb-1">Contato</h3>
          <p className="text-brand-muted leading-relaxed">
            {order.email}
            {order.shipping_address?.phone && (
              <>
                <br />
                {order.shipping_address.phone}
              </>
            )}
          </p>
        </div>

        <div data-testid="shipping-method-summary">
          <h3 className="text-brand-text font-semibold mb-1">Método</h3>
          <p className="text-brand-muted leading-relaxed">
            {shippingMethod?.name ?? "—"}
            {shippingMethod && (
              <>
                <br />
                <span className="text-brand-text font-semibold">
                  {convertToLocale({
                    amount: shippingMethod.total ?? 0,
                    currency_code: order.currency_code,
                  })}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ShippingDetails
