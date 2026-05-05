import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button, Select } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Lead = {
  id: string
  name: string
  company: string | null
  cnpj: string | null
  email: string
  phone: string
  city: string | null
  province: string | null
  segment: string | null
  monthly_volume: string | null
  message: string | null
  status: "new" | "contacted" | "quoted" | "won" | "lost" | "spam"
  source: string
  internal_notes: string | null
  created_at: string
}

const STATUS_LABEL: Record<Lead["status"], string> = {
  new: "Novo",
  contacted: "Em contato",
  quoted: "Cotação enviada",
  won: "Ganho",
  lost: "Perdido",
  spam: "Spam",
}

const STATUS_COLOR: Record<Lead["status"], "blue" | "green" | "orange" | "red" | "grey" | "purple"> = {
  new: "blue",
  contacted: "purple",
  quoted: "orange",
  won: "green",
  lost: "red",
  spam: "grey",
}

const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as Lead["status"][]

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const AtacadoLeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")
  const [count, setCount] = useState(0)

  const load = async () => {
    setLoading(true)
    const qs = filter ? `?status=${filter}` : ""
    const res = await fetch(`/admin/atacado-leads${qs}`, {
      credentials: "include",
    })
    if (res.ok) {
      const data = await res.json()
      setLeads(data.leads)
      setCount(data.count)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [filter])

  const updateStatus = async (id: string, status: Lead["status"]) => {
    await fetch(`/admin/atacado-leads/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    )
  }

  const remove = async (id: string) => {
    if (!confirm("Remover este lead permanentemente?")) return
    await fetch(`/admin/atacado-leads/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <Container className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Heading level="h1">Leads de atacado</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Cotações B2B capturadas pela página /atacado da loja.
            {count > 0 && ` ${count} ${count === 1 ? "lead" : "leads"} no total.`}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <Select.Trigger className="min-w-[180px]">
              <Select.Value placeholder="Todos os status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="">Todos os status</Select.Item>
              {STATUS_OPTIONS.map((s) => (
                <Select.Item key={s} value={s}>
                  {STATUS_LABEL[s]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Button variant="secondary" size="small" onClick={load}>
            Atualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-ui-fg-subtle">Carregando…</div>
      ) : leads.length === 0 ? (
        <div className="py-12 text-center text-ui-fg-subtle">
          Nenhum lead {filter ? `com status "${STATUS_LABEL[filter as Lead["status"]]}"` : "ainda"}.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="border border-ui-border-base rounded-lg p-4 bg-ui-bg-base"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold">{lead.name}</span>
                    {lead.company && (
                      <span className="text-ui-fg-subtle text-sm">
                        · {lead.company}
                        {lead.cnpj && ` (CNPJ ${lead.cnpj})`}
                      </span>
                    )}
                    <Badge color={STATUS_COLOR[lead.status]} size="2xsmall">
                      {STATUS_LABEL[lead.status]}
                    </Badge>
                  </div>
                  <div className="text-xs text-ui-fg-subtle">
                    <span>{lead.email}</span>
                    <span className="mx-2">·</span>
                    <span>{lead.phone}</span>
                    {(lead.city || lead.province) && (
                      <>
                        <span className="mx-2">·</span>
                        <span>
                          {lead.city}
                          {lead.province && `/${lead.province.toUpperCase()}`}
                        </span>
                      </>
                    )}
                    <span className="mx-2">·</span>
                    <span>{fmtDate(lead.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select
                    value={lead.status}
                    onValueChange={(v) => updateStatus(lead.id, v as Lead["status"])}
                  >
                    <Select.Trigger className="min-w-[160px]">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {STATUS_OPTIONS.map((s) => (
                        <Select.Item key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => remove(lead.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>

              {(lead.segment || lead.monthly_volume || lead.message) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm border-t border-ui-border-base pt-3 mt-2">
                  {lead.segment && (
                    <div>
                      <span className="block text-xs text-ui-fg-muted">Segmento</span>
                      <span>{lead.segment}</span>
                    </div>
                  )}
                  {lead.monthly_volume && (
                    <div>
                      <span className="block text-xs text-ui-fg-muted">Volume mensal</span>
                      <span>{lead.monthly_volume}</span>
                    </div>
                  )}
                  {lead.message && (
                    <div className="lg:col-span-3">
                      <span className="block text-xs text-ui-fg-muted">Mensagem</span>
                      <span className="text-ui-fg-base whitespace-pre-wrap">
                        {lead.message}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Leads atacado",
})

export default AtacadoLeadsPage
