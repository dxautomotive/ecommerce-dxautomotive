import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const completion = getProfileCompletion(customer)
  const recentOrders = orders?.slice(0, 5) ?? []

  return (
    <div data-testid="overview-page-wrapper" className="flex flex-col gap-6">
      <section className="grid grid-cols-1 small:grid-cols-3 gap-4">
        <StatCard
          label="Perfil completo"
          value={`${completion}%`}
          hint={completion === 100 ? "Tudo certo!" : "Complete em Meus dados"}
          accent={completion === 100 ? "success" : "primary"}
        />
        <StatCard
          label="Endereços salvos"
          value={String(customer?.addresses?.length || 0)}
          hint={
            customer?.addresses?.length
              ? "Pronto pra finalizar mais rápido"
              : "Cadastre seu endereço de entrega"
          }
          dataTestid="addresses-count"
          dataValue={customer?.addresses?.length || 0}
        />
        <StatCard
          label="Pedidos realizados"
          value={String(orders?.length || 0)}
          hint={
            orders?.length
              ? "Veja o histórico em Meus pedidos"
              : "Faça sua primeira compra"
          }
          accent="warning"
        />
      </section>

      <section className="bg-brand-surface border border-brand-border rounded-xl p-5 small:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-brand-text font-bold text-lg">Pedidos recentes</h2>
            <p className="text-brand-muted text-xs mt-0.5">
              Últimos 5 pedidos · acompanhe rastreio e detalhes
            </p>
          </div>
          {(orders?.length ?? 0) > 5 && (
            <LocalizedClientLink
              href="/account/orders"
              className="text-brand-primary hover:text-brand-primary-hover text-sm font-semibold"
            >
              Ver todos →
            </LocalizedClientLink>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8" data-testid="no-orders-message">
            <span className="text-4xl" aria-hidden="true">📦</span>
            <p className="text-brand-text font-semibold mt-3">
              Nenhum pedido por enquanto
            </p>
            <p className="text-brand-muted text-sm mt-1">
              Quando você fizer sua primeira compra, ela aparece aqui.
            </p>
            <LocalizedClientLink
              href="/store"
              className="inline-block mt-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
            >
              Ver produtos
            </LocalizedClientLink>
          </div>
        ) : (
          <ul className="flex flex-col gap-2" data-testid="orders-wrapper">
            {recentOrders.map((order) => (
              <li
                key={order.id}
                data-testid="order-wrapper"
                data-value={order.id}
              >
                <LocalizedClientLink
                  href={`/account/orders/details/${order.id}`}
                  className="group flex items-center justify-between gap-3 bg-brand-bg border border-brand-border hover:border-brand-primary rounded-lg p-3 small:p-4 transition-colors"
                >
                  <div className="grid grid-cols-3 gap-3 small:gap-6 flex-1 text-xs small:text-sm min-w-0">
                    <div className="min-w-0">
                      <p className="text-brand-muted text-xs">Data</p>
                      <p
                        className="text-brand-text font-medium truncate"
                        data-testid="order-created-date"
                      >
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-brand-muted text-xs">Pedido</p>
                      <p
                        className="text-brand-text font-mono font-medium"
                        data-testid="order-id"
                        data-value={order.display_id}
                      >
                        #{order.display_id}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-brand-muted text-xs">Total</p>
                      <p
                        className="text-brand-text font-semibold"
                        data-testid="order-amount"
                      >
                        {convertToLocale({
                          amount: order.total,
                          currency_code: order.currency_code,
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-brand-muted group-hover:text-brand-primary transition-colors text-lg"
                    aria-hidden="true"
                    data-testid="open-order-button"
                  >
                    →
                  </span>
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  accent = "primary",
  dataTestid,
  dataValue,
}: {
  label: string
  value: string
  hint?: string
  accent?: "primary" | "success" | "warning"
  dataTestid?: string
  dataValue?: string | number
}) {
  const accentClass = {
    primary: "text-brand-primary",
    success: "text-brand-success",
    warning: "text-brand-warning",
  }[accent]
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-5">
      <p className="text-brand-muted text-xs uppercase tracking-wider">{label}</p>
      <p
        className={`text-3xl font-extrabold mt-2 ${accentClass}`}
        data-testid={dataTestid}
        data-value={dataValue}
      >
        {value}
      </p>
      {hint && <p className="text-brand-muted text-xs mt-2">{hint}</p>}
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  if (!customer) return 0
  let count = 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  if (customer.addresses?.find((a) => a.is_default_billing)) count++
  return (count / 4) * 100
}

export default Overview
