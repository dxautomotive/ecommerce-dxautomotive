"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const apiHeaders: HeadersInit | undefined = PUBLISHABLE_KEY
  ? { "x-publishable-api-key": PUBLISHABLE_KEY }
  : undefined

const HELPFUL_KEY = "dx:reviews-helpful"
const MAX_IMAGES = 4
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB cada, antes do server reduzir pra WebP

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

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const absUrl = (u: string) => (u.startsWith("/") ? `${BACKEND_URL}${u}` : u)

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
  with_media: number
  without_media: number
}

type FilterMode =
  | "all"
  | "with_media"
  | "without_media"
  | "rating_5"
  | "rating_4"
  | "rating_3"
  | "rating_2"
  | "rating_1"

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
 * ProductReviews — section de avaliações da PDP (KaBuM/Shopee-style).
 *
 * Features:
 *  - Resumo com nota média + distribuição por estrela
 *  - Filtros chips (Tudo · ★5–★1 · Com mídia · Sem mídia) com contagens
 *  - Cards individuais em grid 2 colunas com avatar/nome/estrelas/data/texto
 *  - Galeria de imagens por review (max 4) com lightbox no click
 *  - Voto "Útil" otimista persistido em localStorage (sem auth)
 *  - Form de escrever review com upload de até 4 imagens (até 5MB cada)
 *    convertidas server-side pra WebP via sharp
 */
export default function ProductReviews({ productId }: Props) {
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterMode>("all")
  const [voted, setVoted] = useState<string[]>([])
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(
    null
  )

  // Form
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
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  useEffect(() => {
    setVoted(readHelpfulVoted())
    let active = true
    setLoading(true)
    fetch(`${BACKEND_URL}/store/products/${productId}/reviews?limit=50`, {
      headers: apiHeaders,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return
        setAllReviews(data.reviews ?? [])
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

  // Limpa object URLs quando imageFiles muda (evita memory leak)
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((u) => URL.revokeObjectURL(u))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPickFiles = (files: FileList | null) => {
    if (!files) return
    const incoming = Array.from(files)
    const slot = MAX_IMAGES - imageFiles.length
    const accepted: File[] = []
    for (const f of incoming.slice(0, slot)) {
      if (!f.type.startsWith("image/")) continue
      if (f.size > MAX_IMAGE_BYTES) {
        setErr(`A imagem "${f.name}" excede 5MB. Tente outra.`)
        continue
      }
      accepted.push(f)
    }
    if (accepted.length === 0) return
    setImageFiles((prev) => [...prev, ...accepted])
    setImagePreviewUrls((prev) => [
      ...prev,
      ...accepted.map((f) => URL.createObjectURL(f)),
    ])
  }

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx))
    setImagePreviewUrls((prev) => {
      const removed = prev[idx]
      if (removed) URL.revokeObjectURL(removed)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!form.title.trim() || !form.body.trim() || !form.author_name.trim()) {
      setErr("Preencha nome, título e texto da avaliação.")
      return
    }
    setSubmitting(true)
    try {
      const imagesDataUrls = await Promise.all(
        imageFiles.map((f) => fileToDataUrl(f))
      )
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
            images: imagesDataUrls,
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
      imagePreviewUrls.forEach((u) => URL.revokeObjectURL(u))
      setImageFiles([])
      setImagePreviewUrls([])
    } finally {
      setSubmitting(false)
    }
  }

  const voteHelpful = async (id: string) => {
    if (voted.includes(id)) return
    setAllReviews((prev) =>
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
      // best-effort
    }
  }

  // Filtragem client-side (a lista de até 50 já vem completa, suficiente em escala atual)
  const filtered = useMemo(() => {
    switch (filter) {
      case "with_media":
        return allReviews.filter((r) => r.images && r.images.length > 0)
      case "without_media":
        return allReviews.filter((r) => !r.images || r.images.length === 0)
      case "rating_5":
        return allReviews.filter((r) => Math.round(r.rating) === 5)
      case "rating_4":
        return allReviews.filter((r) => Math.round(r.rating) === 4)
      case "rating_3":
        return allReviews.filter((r) => Math.round(r.rating) === 3)
      case "rating_2":
        return allReviews.filter((r) => Math.round(r.rating) === 2)
      case "rating_1":
        return allReviews.filter((r) => Math.round(r.rating) === 1)
      default:
        return allReviews
    }
  }, [allReviews, filter])

  if (loading) {
    return (
      <div className="text-brand-text-2 text-sm py-8 text-center">
        Carregando avaliações…
      </div>
    )
  }

  const total = summary?.total ?? 0
  const dist = summary?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const withMedia = summary?.with_media ?? 0
  const withoutMedia = summary?.without_media ?? 0

  const filterChips: { id: FilterMode; label: string; count: number }[] = [
    { id: "all", label: "Tudo", count: total },
    { id: "with_media", label: "Com mídia", count: withMedia },
    { id: "without_media", label: "Sem mídia", count: withoutMedia },
    { id: "rating_5", label: "5 ★", count: dist[5] },
    { id: "rating_4", label: "4 ★", count: dist[4] },
    { id: "rating_3", label: "3 ★", count: dist[3] },
    { id: "rating_2", label: "2 ★", count: dist[2] },
    { id: "rating_1", label: "1 ★", count: dist[1] },
  ]

  return (
    <div className="flex flex-col gap-6">
      {summary && total > 0 ? (
        <div className="grid grid-cols-1 small:grid-cols-[200px_1fr] gap-6 small:gap-8 items-start pb-6 border-b border-brand-border">
          <div className="flex flex-col items-center small:items-start gap-1">
            <p className="text-[40px] font-black text-brand-text leading-none">
              {summary.average.toFixed(1)}
            </p>
            <Stars rating={summary.average} size={18} />
            <p className="text-[12px] text-brand-text-2 mt-1">
              {total} avaliaç{total === 1 ? "ão" : "ões"}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const c = dist[star] ?? 0
              const pct = total > 0 ? Math.round((c / total) * 100) : 0
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
                  <span className="w-10 text-right text-brand-text-3">{c}</span>
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

      {total > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filterChips
            .filter((c) => c.count > 0 || c.id === "all")
            .map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  filter === chip.id
                    ? "bg-brand-primary/15 border-brand-primary text-brand-primary"
                    : "bg-brand-surface-2 border-brand-border text-brand-text-2 hover:border-brand-border-2 hover:text-brand-text"
                }`}
              >
                {chip.label}{" "}
                <span className="text-brand-text-3">({chip.count})</span>
              </button>
            ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-[14px] font-bold text-brand-text">
          {filtered.length > 0
            ? `${filtered.length} comentário${filtered.length === 1 ? "" : "s"}`
            : "Nenhum comentário com esse filtro"}
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

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-semibold text-brand-text-2">
              Fotos (até {MAX_IMAGES}, máx 5MB cada — convertemos pra WebP)
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {imagePreviewUrls.map((url, i) => (
                <div
                  key={url}
                  className="relative w-16 h-16 rounded-md overflow-hidden border border-brand-border bg-brand-surface group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Pré-visualização ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Remover imagem"
                    className="absolute top-0 right-0 w-5 h-5 bg-black/70 text-white text-[10px] rounded-bl-md leading-none hover:bg-brand-danger transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              {imageFiles.length < MAX_IMAGES && (
                <label className="w-16 h-16 rounded-md border border-dashed border-brand-border-2 hover:border-brand-primary cursor-pointer text-brand-text-3 hover:text-brand-primary transition-colors flex flex-col items-center justify-center gap-0.5">
                  <PlusIcon />
                  <span className="text-[10px]">Adicionar</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      onPickFiles(e.target.files)
                      e.target.value = ""
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-brand-text-3">
              Vídeos serão suportados em breve, quando ativarmos a infra de mídia.
            </p>
          </div>

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

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
          {filtered.map((review) => {
            const hasVoted = voted.includes(review.id)
            const imgs = (review.images ?? []).map(absUrl)
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

                {imgs.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {imgs.slice(0, 4).map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightbox({ urls: imgs, index: i })}
                        aria-label={`Ampliar foto ${i + 1}`}
                        className="relative w-16 h-16 rounded-md overflow-hidden bg-brand-surface border border-brand-border hover:border-brand-primary transition-colors cursor-zoom-in"
                      >
                        <Image
                          src={url}
                          alt={`Foto ${i + 1} da avaliação`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </button>
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

      {lightbox && (
        <ReviewLightbox
          urls={lightbox.urls}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

function ReviewLightbox({
  urls,
  initialIndex,
  onClose,
}: {
  urls: string[]
  initialIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % urls.length)
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + urls.length) % urls.length)
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [urls.length, onClose])

  const current = urls[index]
  if (!current) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada da avaliação"
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 small:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
      >
        <CloseIcon />
      </button>

      <div
        className="relative w-full h-full max-w-[1100px] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={current}
          alt={`Foto ${index + 1} de ${urls.length}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-sm font-semibold px-3 py-1 rounded">
          {index + 1} / {urls.length}
        </div>
      </div>
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

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
