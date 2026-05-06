"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const apiHeaders: HeadersInit | undefined = PUBLISHABLE_KEY
  ? { "x-publishable-api-key": PUBLISHABLE_KEY }
  : undefined

const HELPFUL_KEY = "dx:reviews-helpful"

const readHelpfulVoted = (): string[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(HELPFUL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const markHelpfulVoted = (id: string) => {
  if (typeof window === "undefined") return
  const cur = readHelpfulVoted()
  if (cur.includes(id)) return
  window.localStorage.setItem(HELPFUL_KEY, JSON.stringify([...cur, id]))
}

type Review = {
  id: string
  rating: number
  title: string
  body: string
  author_name: string
  verified_purchase: boolean
  helpful_count: number
  images: string[]
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
    month: "2-digit",
    year: "numeric",
  })

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const Stars = ({ rating, size = 13 }: { rating: number; size?: number }) => {
  const r = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span
      className="text-brand-star inline-flex select-none"
      style={{ fontSize: size, lineHeight: 1, letterSpacing: 1 }}
      aria-label={`${r} de 5 estrelas`}
    >
      {"★".repeat(r)}
      <span className="text-brand-border-2">{"☆".repeat(5 - r)}</span>
    </span>
  )
}

/**
 * ProductReviews — section dedicada de avaliações na PDP (KaBuM-style).
 *
 * Layout:
 *  - Header com nota média + distribuição por estrela + botão "Escrever avaliação"
 *  - Grid de cards (2 colunas em desktop, 1 em mobile) — cada card individual,
 *    bordado, com avatar de iniciais + nome + estrelas + data + título + texto +
 *    galeria de fotos (se tiver) + botão "Útil (N)"
 *
 * Empty state convida o cliente a escrever.
 */
export default function ProductReviews({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [writing, setWriting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [voted, setVoted] = useState<string[]>([])
  const [form, setForm] = useState({
    rating: 5,
    title: "",
    body: "",
    author_name: "",
    author_email: "",
  })

  useEffect(() => {
    setVoted(readHelpfulVoted())
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

  const voteHelpful = async (id: string) => {
    if (voted.includes(id)) return
    // Otimista: incrementa local imediato + marca votado
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, helpful_count: r.helpful_count + 1 } : r
      )
    )
    markHelpfulVoted(id)
    setVoted((v) => [...v, id])
    try {
      await fetch(`${BACKEND_URL}/store/reviews/${id}/helpful`, {
        method: "POST",
        headers: apiHeaders,
      })
    } catch {
      // best-effort; em produção tratar rollback se o servidor falhar
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
        <div className="grid grid-cols-1 small:grid-cols-[200px_1fr] gap-6 small:gap-8 items-start pb-6 border-b border-brand-border">
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

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-[14px] font-bold text-brand-text">
          {reviews.length > 0
            ? `${reviews.length} comentário${reviews.length === 1 ? "" : "s"}`
            : "Comentários"}
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
          {err && <p className="text-[12px] text-brand-danger">{err}</p>}
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

      {reviews.length > 0 && (
        <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
          {reviews.map((review) => {
            const hasVoted = voted.includes(review.id)
            return (
              <article
                key={review.id}
                className="bg-brand-surface-2 border border-brand-border rounded-xl p-4 flex flex-col gap-3"
              >
                <header className="flex items-start gap-3">
                  <span
                    className="w-9 h-9 rounded-full bg-brand-primary/15 text-brand-primary font-extrabold text-[12px] flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    {initials(review.author_name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-brand-text leading-tight uppercase tracking-wide">
                      {review.author_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Stars rating={review.rating} size={13} />
                      <span className="text-[11px] text-brand-text-3">
                        Avaliado em {fmtDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                  {review.verified_purchase && (
                    <span
                      className="text-[10px] font-bold text-brand-success bg-brand-success/10 px-1.5 py-0.5 rounded-[4px] flex-shrink-0"
                      title="Compra verificada"
                    >
                      ✓
                    </span>
                  )}
                </header>

                {review.title && (
                  <h4 className="text-[14px] font-bold text-brand-text leading-snug">
                    {review.title}
                  </h4>
                )}

                <p className="text-[13px] text-brand-text-2 leading-relaxed whitespace-pre-wrap">
                  {review.body}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {review.images.slice(0, 4).map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-16 h-16 rounded-md overflow-hidden bg-brand-surface border border-brand-border hover:border-brand-primary transition-colors"
                      >
                        <Image
                          src={url}
                          alt={`Foto ${i + 1} da avaliação`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}

                <footer className="pt-2 border-t border-brand-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => voteHelpful(review.id)}
                    disabled={hasVoted}
                    className={`text-[12px] font-semibold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                      hasVoted
                        ? "text-brand-success cursor-default"
                        : "text-brand-text-2 hover:text-brand-primary hover:bg-brand-primary/10"
                    }`}
                  >
                    <ThumbsUpIcon filled={hasVoted} />
                    {hasVoted ? "Útil ✓" : "Útil"} ({review.helpful_count})
                  </button>
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ThumbsUpIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}
