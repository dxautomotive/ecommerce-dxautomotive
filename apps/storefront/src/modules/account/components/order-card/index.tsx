import { useMemo } from "react"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(
    () => order.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0,
    [order]
  )

  const numberOfProducts = order.items?.length ?? 0
  const previewItems = order.items?.slice(0, 4) ?? []

  return (
    <article
      className="bg-brand-surface border border-brand-border rounded-xl p-5"
      data-testid="order-card"
    >
      <header className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-brand-muted text-xs uppercase tracking-wider">
            Pedido
          </p>
          <h3 className="text-brand-text text-xl font-extrabold font-mono leading-tight">
            #<span data-testid="order-display-id">{order.display_id}</span>
          </h3>
        </div>
        <div className="text-right">
          <p className="text-brand-muted text-xs uppercase tracking-wider">
            Total
          </p>
          <p
            className="text-brand-text text-xl font-extrabold leading-tight"
            data-testid="order-amount"
          >
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-muted mb-4">
        <span data-testid="order-created-at">
          {new Date(order.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {numberOfLines} {numberOfLines === 1 ? "item" : "itens"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 small:gap-3 mb-4">
        {previewItems.map((item) => (
          <div
            key={item.id}
            className="aspect-square bg-brand-bg border border-brand-border rounded-lg overflow-hidden relative"
            data-testid="order-item"
            title={item.title || ""}
          >
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.title || ""}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center text-2xl text-brand-border"
                aria-hidden="true"
              >
                📦
              </div>
            )}
            {item.quantity > 1 && (
              <span
                className="absolute top-1 right-1 bg-brand-bg/80 backdrop-blur text-brand-text text-[10px] font-bold px-1.5 rounded"
                data-testid="item-quantity"
              >
                ×{item.quantity}
              </span>
            )}
          </div>
        ))}
        {numberOfProducts > 4 && (
          <div className="aspect-square bg-brand-bg border border-brand-border rounded-lg flex items-center justify-center text-brand-muted text-sm font-semibold">
            +{numberOfProducts - 4}
          </div>
        )}
      </div>

      <LocalizedClientLink
        href={`/account/orders/details/${order.id}`}
        data-testid="order-details-link"
        className="block w-full text-center bg-brand-bg border border-brand-border hover:border-brand-primary text-brand-text hover:text-brand-primary text-sm font-semibold py-2.5 rounded transition-colors"
      >
        Ver detalhes do pedido →
      </LocalizedClientLink>
    </article>
  )
}

export default OrderCard
