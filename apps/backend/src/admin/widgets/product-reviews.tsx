import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Textarea,
  Select,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

type Review = {
  id: string
  rating: number
  title: string
  body: string
  author_name: string
  author_email: string | null
  status: "pending" | "approved" | "rejected" | "spam"
  verified_purchase: boolean
  helpful_count: number
  created_at: string
}

type Product = { id: string }

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

const ProductReviewsWidget = ({ data }: DetailWidgetProps<Product>) => {
  const productId = data.id

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    rating: 5,
    title: "",
    body: "",
    author_name: "",
    verified_purchase: false,
  })
  const [err, setErr] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch(
      `/admin/reviews?product_id=${encodeURIComponent(productId)}&limit=100`,
      { credentials: "include" }
    )
    if (res.ok) {
      const data = await res.json()
      setReviews(data.reviews)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [productId])

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

  const submit = async () => {
    setErr(null)
    if (!form.title.trim() || !form.body.trim() || !form.author_name.trim()) {
      setErr("Título, texto e nome do autor são obrigatórios")
      return
    }
    setSubmitting(true)
    const res = await fetch(`/admin/reviews`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        rating: form.rating,
        title: form.title.trim(),
        body: form.body.trim(),
        author_name: form.author_name.trim(),
        verified_purchase: form.verified_purchase,
        status: "approved",
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setErr(data.message ?? "Erro ao criar avaliação")
      return
    }
    setForm({
      rating: 5,
      title: "",
      body: "",
      author_name: "",
      verified_purchase: false,
    })
    setCreating(false)
    load()
  }

  const approved = reviews.filter((r) => r.status === "approved")
  const pending = reviews.filter((r) => r.status === "pending")
  const avg =
    approved.length === 0
      ? 0
      : Math.round(
          (approved.reduce((s, r) => s + r.rating, 0) / approved.length) * 10
        ) / 10

  return (
    <Container className="p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <Heading level="h2">Avaliações do produto</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            {approved.length === 0
              ? "Sem avaliações aprovadas ainda."
              : `${approved.length} aprovada${
                  approved.length === 1 ? "" : "s"
                } · média ${avg.toFixed(1)} ★`}
            {pending.length > 0 && ` · ${pending.length} pendente${pending.length === 1 ? "" : "s"}`}
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setCreating((c) => !c)}
        >
          {creating ? "Cancelar" : "Adicionar avaliação"}
        </Button>
      </div>

      {creating && (
        <div className="border border-ui-border-base rounded-lg p-4 mb-4 bg-ui-bg-subtle">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <Text size="xsmall" className="text-ui-fg-muted mb-1">Nota (1-5)</Text>
              <Select
                value={String(form.rating)}
                onValueChange={(v) => setForm({ ...form, rating: Number(v) })}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <Select.Item key={n} value={String(n)}>
                      {"★".repeat(n)}
                      {"☆".repeat(5 - n)} ({n})
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div>
              <Text size="xsmall" className="text-ui-fg-muted mb-1">Nome do autor</Text>
              <Input
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                placeholder="Ex.: João Silva"
              />
            </div>
            <div className="lg:col-span-2">
              <Text size="xsmall" className="text-ui-fg-muted mb-1">Título</Text>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex.: Excelente custo-benefício"
              />
            </div>
            <div className="lg:col-span-2">
              <Text size="xsmall" className="text-ui-fg-muted mb-1">Texto da avaliação</Text>
              <Textarea
                rows={3}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="O que o cliente achou do produto..."
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.verified_purchase}
                onChange={(e) =>
                  setForm({ ...form, verified_purchase: e.target.checked })
                }
              />
              Compra verificada
            </label>
          </div>
          {err && (
            <Text size="small" className="text-ui-fg-error mt-2">
              {err}
            </Text>
          )}
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="secondary" size="small" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar avaliação"}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-ui-fg-subtle">Carregando…</div>
      ) : reviews.length === 0 ? (
        <div className="py-8 text-center text-ui-fg-subtle border border-dashed border-ui-border-base rounded-lg">
          Sem avaliações pra esse produto.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-ui-border-base rounded-lg p-3"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <Stars rating={review.rating} />
                    <span className="font-semibold text-sm">{review.title}</span>
                    <Badge color={STATUS_COLOR[review.status]} size="2xsmall">
                      {STATUS_LABEL[review.status]}
                    </Badge>
                    {review.verified_purchase && (
                      <Badge color="blue" size="2xsmall">
                        Verificada
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-ui-fg-subtle">
                    {review.author_name} · {fmtDate(review.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select
                    value={review.status}
                    onValueChange={(v) =>
                      updateStatus(review.id, v as Review["status"])
                    }
                  >
                    <Select.Trigger className="min-w-[120px]">
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
              <p className="text-sm text-ui-fg-base whitespace-pre-wrap mt-2">
                {review.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductReviewsWidget
