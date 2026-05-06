"use client"

import { useEffect, useState } from "react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const apiHeaders: HeadersInit | undefined = PUBLISHABLE_KEY
  ? { "x-publishable-api-key": PUBLISHABLE_KEY }
  : undefined

type Review = {
  id: string
  rating: number
  title: string
  body: string
  author_name: string
  verified_purchase: boolean
  helpful_count: number
  created_at: string
}

type Summary = {
  total: number
  average: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

type Props = {
  productId: string
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

const Stars = ({ rating, size = 14 }: { rating: number; size?: number }) => {
  const r = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span
      className="text-brand-star inline-flex"
      style={{ fontSize: size }}
      aria-label={`${r} de 5 estrelas`}
    >
      {"★".repeat(r)}
      <span className="text-brand-border-2">{"☆".repeat(5 - r)}</span>
    </span>
  )
}

/**
 * Painel de avaliações do produto.
 *
 * Renderiza dentro da tab "Avaliações" do `<ProductTabsDX>`. Faz fetch em
 * `/store/products/:id/reviews` e mostra:
 *  - resumo com nota média + total + distribuição por estrela (5★, 4★, ...)
 *  - lista das reviews aprovadas com nome/data/título/texto + badge "Compra verificada"
 *  - formulário "Escrever avaliação" inline (POST cria com status=pending)
 *
 * O resumo + lista usam o mesmo endpoint pra evitar 2 round-trips.
 */
export default function ProductReviews({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [writing, setWriting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [form, setForm] = useState({
    rating: 5,
    title: "",
    body: "",
    author_name: "",
    author_email: "",
  })

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`${BACKEND_URL}/store/products/${productId}/reviews`, {
      headers: apiHeaders,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return
        setReviews(data.reviews ?? [])
        setSummary(data.summary ?? null)
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [productId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!form.title.trim() || !form.body.trim() || !form.author_name.trim()) {
      setErr("Preencha nome, título e texto da avaliação.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(
        `${BACKEND_URL}/store/products/${productId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(apiHeaders ?? {}) },
          body: JSON.stringify({
            rating: form.rating,
            title: form.title.trim(),
            body: form.body.trim(),
            author_name: form.author_name.trim(),
            author_email: form.author_email.trim() || undefined,
          }),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErr(data.message ?? "Erro ao enviar avaliação")
        return
      }
      setSubmitted(true)
      setWriting(false)
      setForm({
        rating: 5,
        title: "",
        body: "",
        author_name: "",
        author_email: "",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-brand-text-2 text-sm py-8 text-center">
        Carregando avaliações…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {summary && summary.total > 0 ? (
        <div className="grid grid-cols-1 small:grid-cols-[200px_1fr] gap-6 small:gap-8 items-start">
          <div className="flex flex-col items-center small:items-start gap-1">
            <p className="text-[40px] font-black text-brand-text leading-none">
              {summary.average.toFixed(1)}
            </p>
            <Stars rating={summary.average} size={18} />
            <p className="text-[12px] text-brand-text-2 mt-1">
              {summary.total} avaliaç{summary.total === 1 ? "ão" : "ões"}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const c = summary.distribution[star] ?? 0
              const pct =
                summary.total > 0
                  ? Math.round((c / summary.total) * 100)
                  : 0
              return (
                <div
                  key={star}
                  className="flex items-center gap-2 text-[12px]"
                >
                  <span className="w-4 text-brand-text-2">{star}★</span>
                  <div className="flex-1 h-2 bg-brand-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-star"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-brand-text-3">
                    {c}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed border-brand-border-2 rounded-xl">
          <p className="text-brand-text font-bold mb-1">
            Seja o primeiro a avaliar
          </p>
          <p className="text-[13px] text-brand-text-2">
            Compartilhe sua experiência com este produto.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-bold text-brand-text">
          Avaliações dos clientes
        </h3>
        {!writing && !submitted && (
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="text-[13px] font-bold text-brand-primary hover:text-brand-cyan transition-colors"
          >
            Escrever avaliação →
          </button>
        )}
      </div>

      {submitted && (
        <div className="bg-brand-success/8 border border-brand-success/20 rounded-md p-3 text-[13px] text-brand-success font-semibold">
          ✓ Avaliação enviada! Após moderação ela aparece aqui.
        </div>
      )}

      {writing && (
        <form
          onSubmit={submit}
          className="bg-brand-surface-2 border border-brand-border rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <label className="text-[12px] font-semibold text-brand-text-2">
              Sua nota:
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  className={`text-2xl leading-none transition-colors ${
                    n <= form.rating
                      ? "text-brand-star"
                      : "text-brand-border-2 hover:text-brand-text-3"
                  }`}
                  aria-label={`${n} estrelas`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <input
            value={form.author_name}
            onChange={(e) => setForm({ ...form, author_name: e.target.value })}
            placeholder="Seu nome"
            maxLength={80}
            className="bg-brand-surface border border-brand-border rounded-md text-brand-text text-[13px] px-3 py-2.5 placeholder:text-brand-text-3 focus:border-brand-primary/50 focus:outline-none"
          />
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título da avaliação (ex.: Excelente produto!)"
            maxLength={120}
            className="bg-brand-surface border border-brand-border rounded-md text-brand-text text-[13px] px-3 py-2.5 placeholder:text-brand-text-3 focus:border-brand-primary/50 focus:outline-none"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Conte sua experiência com o produto..."
            maxLength={4000}
            rows={4}
            className="bg-brand-surface border border-brand-border rounded-md text-brand-text text-[13px] px-3 py-2.5 placeholder:text-brand-text-3 focus:border-brand-primary/50 focus:outline-none resize-y"
          />
          <input
            value={form.author_email}
            onChange={(e) =>
              setForm({ ...form, author_email: e.target.value })
            }
            placeholder="E-mail (opcional, não exibido)"
            type="email"
            maxLength={200}
            className="bg-brand-surface border border-brand-border rounded-md text-brand-text text-[13px] px-3 py-2.5 placeholder:text-brand-text-3 focus:border-brand-primary/50 focus:outline-none"
          />
          {err && (
            <p className="text-[12px] text-brand-danger">{err}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setWriting(false)
                setErr(null)
              }}
              className="text-[13px] font-semibold text-brand-text-2 px-4 py-2 hover:text-brand-text transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-grad-primary text-white font-bold text-[13px] px-5 py-2 rounded-md shadow-glow-sm hover:shadow-glow-primary transition-all disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Enviar avaliação"}
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? null : (
        <div className="flex flex-col">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-t border-brand-border py-4 first:border-none first:pt-0"
            >
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Stars rating={review.rating} size={13} />
                <span className="font-bold text-[14px] text-brand-text">
                  {review.title}
                </span>
                {review.verified_purchase && (
                  <span className="text-[10px] font-bold text-brand-success bg-brand-success/10 px-1.5 py-0.5 rounded-[4px]">
                    ✓ COMPRA VERIFICADA
                  </span>
                )}
              </div>
              <p className="text-[12px] text-brand-text-3 mb-2">
                Por <strong className="text-brand-text-2">{review.author_name}</strong>
                {" · "}
                {fmtDate(review.created_at)}
              </p>
              <p className="text-[13px] text-brand-text-2 leading-relaxed whitespace-pre-wrap">
                {review.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
