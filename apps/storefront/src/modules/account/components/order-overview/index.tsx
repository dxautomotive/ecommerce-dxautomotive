"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

import OrderCard from "../order-card"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full bg-brand-surface border border-brand-border rounded-xl p-8 small:p-12 text-center"
      data-testid="no-orders-container"
    >
      <span className="text-5xl" aria-hidden="true">📦</span>
      <h2 className="text-brand-text text-2xl font-bold mt-4">
        Nenhum pedido por aqui
      </h2>
      <p className="text-brand-muted mt-2 max-w-md mx-auto">
        Quando você fizer sua primeira compra na DX Automotive, ela aparece
        listada aqui com status, rastreio e detalhes.
      </p>
      <LocalizedClientLink
        href="/store"
        passHref
        className="inline-block mt-6 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-6 py-3 rounded-md transition-colors"
        data-testid="continue-shopping-button"
      >
        Ver produtos
      </LocalizedClientLink>
    </div>
  )
}

export default OrderOverview
