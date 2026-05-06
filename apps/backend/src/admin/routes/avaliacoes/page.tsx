import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button, Select } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Review = {
  id: string
  product_id: string
  rating: number
  title: string
  body: string
  author_name: string
  author_email: string | null
  status: "pending" | "approved" | "rejected" | "spam"
  verified_purchase: boolean
  helpful_count: number
  internal_notes: string | null
  created_at: string
  product: {
    id: string
    title: string | null
    thumbnail: string | null
  } | null
}

const STATUS_LABEL: Record<Review["status"], string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Reprovada",
  spam: "Spam",
}

const STATUS_COLOR: Record<
  Review["status"],
  "blue" | "green" | "orange" | "red" | "grey" | "purple"
> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
  spam: "grey",
}

const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as Review["status"][]

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const Stars = ({ rating }: { rating: number }) => {
  const r = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span className="text-ui-fg-base font-mono text-xs" aria-label={`${r} de 5`}>
      {"★".repeat(r)}
      <span className="text-ui-fg-muted">{"☆".repeat(5 - r)}</span>
    </span>
  )
}

const AvaliacoesPage = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")
  const [count, setCount] = useState(0)

  const load = async () => {
    setLoading(true)
    const real = filter === "__all__" ? "" : filter
    const qs = real ? `?status=${real}` : ""
    const res = await fetch(`/admin/reviews${qs}`, { credentials: "include" })
    if (res.ok) {
      const data = await res.json()
      setReviews(data.reviews)
      setCount(data.count)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const updateStatus = async (id: string, status: Review["status"]) => {
    await fetch(`/admin/reviews/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  const remove = async (id: string) => {
    if (!confirm("Remover esta avaliação permanentemente?")) return
    await fetch(`/admin/reviews/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <Container className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Heading level="h1">Avaliações de produtos</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Reviews enviadas pelos clientes na PDP.
            {count > 0 &&
              ` ${count} ${count === 1 ? "avaliação" : "avaliações"} ${
                filter ? `com status "${STATUS_LABEL[filter as Review["status"]]}"` : "no total"
              }.`}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter || "__all__"} onValueChange={setFilter}>
            <Select.Trigger className="min-w-[180px]">
              <Select.Value placeholder="Todos os status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="__all__">Todos os status</Select.Item>
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
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center text-ui-fg-subtle">
          Nenhuma avaliação{" "}
          {filter ? `com status "${STATUS_LABEL[filter as Review["status"]]}"` : "ainda"}.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-ui-border-base rounded-lg p-4 bg-ui-bg-base"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Stars rating={review.rating} />
                    <span className="font-semibold">{review.title}</span>
                    <Badge color={STATUS_COLOR[review.status]} size="2xsmall">
                      {STATUS_LABEL[review.status]}
                    </Badge>
                    {review.verified_purchase && (
                      <Badge color="blue" size="2xsmall">
                        Compra verificada
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-ui-fg-subtle flex items-center gap-2 flex-wrap">
                    <span>{review.author_name}</span>
                    {review.author_email && (
                      <>
                        <span>·</span>
                        <span>{review.author_email}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{fmtDate(review.created_at)}</span>
                    {review.product && (
                      <>
                        <span>·</span>
                        <a
                          href={`/app/products/${review.product.id}`}
                          className="text-ui-fg-interactive hover:underline truncate max-w-[280px]"
                          title={review.product.title ?? ""}
                        >
                          {review.product.title ?? review.product_id}
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select
                    value={review.status}
                    onValueChange={(v) =>
                      updateStatus(review.id, v as Review["status"])
                    }
                  >
                    <Select.Trigger className="min-w-[140px]">
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
                    onClick={() => remove(review.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>

              <p className="text-sm text-ui-fg-base whitespace-pre-wrap border-t border-ui-border-base pt-3 mt-2">
                {review.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Avaliações",
  nested: "/products",
})

export default AvaliacoesPage
