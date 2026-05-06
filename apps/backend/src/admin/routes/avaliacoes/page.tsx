import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button, Select } from "@medusajs/ui"
import { useEffect, useState } from "react"

type ProductSummary = {
  id: string
  title: string | null
  thumbnail: string | null
  status: string | null
  handle: string | null
  review_total: number
  review_approved: number
  review_pending: number
  review_average: number
}

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

/**
 * Página /app/avaliacoes — hierarquia em 2 níveis:
 *  1) Lista de produtos com contagens (total, aprovadas, pendentes, média)
 *  2) Drill-down: reviews daquele produto + ações inline
 *
 * Estado mantido em React (selectedProduct = ProductSummary | null).
 * Quando null: mostra lista de produtos. Quando setado: mostra reviews.
 */
const AvaliacoesPage = () => {
  const [selected, setSelected] = useState<ProductSummary | null>(null)

  return selected ? (
    <ReviewsForProduct
      product={selected}
      onBack={() => setSelected(null)}
    />
  ) : (
    <ProductsList onSelect={setSelected} />
  )
}

function ProductsList({
  onSelect,
}: {
  onSelect: (p: ProductSummary) => void
}) {
  const [items, setItems] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/admin/reviews/summary`, { credentials: "include" })
    if (res.ok) {
      const data = await res.json()
      setItems(data.items)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const totalPending = items.reduce((s, p) => s + p.review_pending, 0)
  const totalApproved = items.reduce((s, p) => s + p.review_approved, 0)

  return (
    <Container className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Heading level="h1">Avaliações por produto</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Selecione um produto pra ver e moderar suas avaliações.
            {items.length > 0 && (
              <>
                {" "}
                {items.length} produto{items.length === 1 ? "" : "s"} ·{" "}
                {totalApproved} aprovada{totalApproved === 1 ? "" : "s"}
                {totalPending > 0 && (
                  <>
                    {" · "}
                    <strong className="text-ui-tag-orange-text">
                      {totalPending} pendente{totalPending === 1 ? "" : "s"}
                    </strong>
                  </>
                )}
                .
              </>
            )}
          </Text>
        </div>
        <Button variant="secondary" size="small" onClick={load}>
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-ui-fg-subtle">Carregando…</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-ui-fg-subtle">
          Nenhum produto cadastrado ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="text-left border border-ui-border-base rounded-lg p-3 bg-ui-bg-base hover:bg-ui-bg-base-hover transition-colors flex items-center gap-3"
            >
              <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center">
                {p.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true" className="text-ui-fg-muted text-xl">
                    📦
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-semibold truncate">
                    {p.title ?? p.id}
                  </span>
                  {p.review_pending > 0 && (
                    <Badge color="orange" size="2xsmall">
                      {p.review_pending} pendente{p.review_pending === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-ui-fg-subtle flex-wrap">
                  {p.review_approved > 0 ? (
                    <>
                      <span className="flex items-center gap-1">
                        <Stars rating={p.review_average} />
                        <span className="font-semibold text-ui-fg-base">
                          {p.review_average.toFixed(1)}
                        </span>
                      </span>
                      <span>
                        {p.review_approved} aprovada
                        {p.review_approved === 1 ? "" : "s"}
                      </span>
                    </>
                  ) : (
                    <span className="text-ui-fg-muted">
                      Sem avaliações aprovadas
                    </span>
                  )}
                  {p.review_total > 0 && (
                    <span className="text-ui-fg-muted">
                      · {p.review_total} no total
                    </span>
                  )}
                </div>
              </div>
              <span aria-hidden="true" className="text-ui-fg-muted text-xl">
                ›
              </span>
            </button>
          ))}
        </div>
      )}
    </Container>
  )
}

function ReviewsForProduct({
  product,
  onBack,
}: {
  product: ProductSummary
  onBack: () => void
}) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("__all__")

  const load = async () => {
    setLoading(true)
    const real = filter === "__all__" ? "" : filter
    const params = new URLSearchParams({ product_id: product.id })
    if (real) params.set("status", real)
    const res = await fetch(`/admin/reviews?${params.toString()}`, {
      credentials: "include",
    })
    if (res.ok) {
      const data = await res.json()
      setReviews(data.reviews)
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
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-ui-fg-interactive hover:underline mb-3 inline-flex items-center gap-1"
      >
        ← Voltar para todos os produtos
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center">
            {product.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.thumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span aria-hidden="true" className="text-ui-fg-muted text-xl">
                📦
              </span>
            )}
          </div>
          <div className="min-w-0">
            <Heading level="h1" className="truncate">
              {product.title ?? product.id}
            </Heading>
            <div className="flex items-center gap-2 text-xs text-ui-fg-subtle mt-0.5 flex-wrap">
              {product.review_approved > 0 ? (
                <>
                  <Stars rating={product.review_average} />
                  <span>
                    <strong>{product.review_average.toFixed(1)}</strong>
                    {" · "}
                    {product.review_approved} aprovada
                    {product.review_approved === 1 ? "" : "s"}
                  </span>
                </>
              ) : (
                <span>Sem avaliações aprovadas</span>
              )}
              {product.review_pending > 0 && (
                <span className="text-ui-tag-orange-text">
                  · {product.review_pending} pendente
                  {product.review_pending === 1 ? "" : "s"}
                </span>
              )}
              <span>·</span>
              <a
                href={`/app/products/${product.id}`}
                className="text-ui-fg-interactive hover:underline"
              >
                Ver produto
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Select value={filter} onValueChange={setFilter}>
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
          {filter !== "__all__"
            ? `com status "${STATUS_LABEL[filter as Review["status"]]}"`
            : "para este produto"}
          .
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
