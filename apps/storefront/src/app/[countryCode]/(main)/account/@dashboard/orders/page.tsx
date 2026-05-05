import { Metadata } from "next"

import { listOrders } from "@lib/data/orders"
import OrderOverview from "@modules/account/components/order-overview"
import TransferRequestForm from "@modules/account/components/transfer-request-form"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Meus pedidos",
  description: "Acompanhe seus pedidos, status de entrega e detalhes.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-2">
        <span className="text-brand-primary text-[10px] uppercase tracking-[0.2em] font-bold">
          Minha conta
        </span>
        <h1 className="text-2xl small:text-3xl font-extrabold text-brand-text">
          Meus pedidos
        </h1>
        <p className="text-sm text-brand-muted max-w-xl">
          Acompanhe o status de cada pedido, baixe a nota fiscal ou
          solicite trocas e devoluções pela página de detalhes.
        </p>
      </div>
      <OrderOverview orders={orders} />
      <div className="mt-10 pt-8 border-t border-brand-border">
        <TransferRequestForm />
      </div>
    </div>
  )
}
