"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-brand-primary text-[10px] uppercase tracking-[0.2em] font-bold block">
            Pedido #{order.display_id}
          </span>
          <h1 className="text-2xl small:text-3xl font-extrabold text-brand-text">
            Detalhes do pedido
          </h1>
        </div>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-1.5 items-center text-brand-muted hover:text-brand-text text-sm font-semibold transition-colors"
          data-testid="back-to-overview-button"
        >
          <ArrowLeftIcon /> Voltar
        </LocalizedClientLink>
      </div>

      <div
        className="flex flex-col gap-6"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

export default OrderDetailsTemplate
