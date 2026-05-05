import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

type KPIs = {
  orders_today: number
  orders_week: number
  orders_month: number
  leads_pending: number
  leads_total: number
  products_total: number
  vehicles_total: number
  generated_at: string
}

/**
 * Widget DX no topo da lista de pedidos com KPIs do dia/semana/mês +
 * leads pendentes + total de produtos e veículos cadastrados.
 *
 * Atualiza ao montar e a cada 60s. Útil pra dar contexto rápido ao
 * cliente quando entra no admin.
 */
const DXDashboardKPIs = () => {
  const [data, setData] = useState<KPIs | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await fetch("/admin/dashboard", { credentials: "include" })
      if (res.ok) {
        const j = await res.json()
        setData(j)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Heading level="h2">Visão geral · DX Automotive</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Atualiza automaticamente a cada minuto.
          </Text>
        </div>
        {data?.leads_pending && data.leads_pending > 0 ? (
          <Badge color="orange" size="small">
            {data.leads_pending} leads aguardando atendimento
          </Badge>
        ) : null}
      </div>

      {loading || !data ? (
        <Text size="small" className="text-ui-fg-subtle">
          Carregando…
        </Text>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Pedidos hoje"
            value={data.orders_today}
            hint={`${data.orders_week} nos últimos 7 dias`}
          />
          <KpiCard
            label="Pedidos no mês"
            value={data.orders_month}
            hint="Últimos 30 dias"
          />
          <KpiCard
            label="Leads atacado"
            value={data.leads_pending}
            hint={`${data.leads_total} no histórico`}
            highlight={data.leads_pending > 0}
          />
          <KpiCard
            label="Catálogo"
            value={data.products_total}
            hint={`${data.vehicles_total} veículos cadastrados`}
          />
        </div>
      )}
    </Container>
  )
}

const KpiCard = ({
  label,
  value,
  hint,
  highlight,
}: {
  label: string
  value: number
  hint?: string
  highlight?: boolean
}) => (
  <div
    className={`border rounded-lg p-4 ${
      highlight
        ? "border-ui-tag-orange-border bg-ui-tag-orange-bg"
        : "border-ui-border-base bg-ui-bg-base"
    }`}
  >
    <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">
      {label}
    </Text>
    <div className="text-3xl font-bold mt-1">{value}</div>
    {hint && (
      <Text size="xsmall" className="text-ui-fg-muted mt-1">
        {hint}
      </Text>
    )}
  </div>
)

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default DXDashboardKPIs
