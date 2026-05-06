"use client"

import { useEffect, useState } from "react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const apiHeaders: HeadersInit | undefined = PUBLISHABLE_KEY
  ? { "x-publishable-api-key": PUBLISHABLE_KEY }
  : undefined

type Props = {
  productId: string
  /** ID DOM da section pra rolar quando clicar (default `avaliacoes`) */
  scrollTargetId?: string
}

type Summary = {
  total: number
  average: number
}

/**
 * RatingSummary — Stars com preenchimento fracionário + "(N avaliações)".
 *
 * Renderizado no topo da info center da PDP (entre o título e o AiSummary),
 * estilo KaBuM. As estrelas são preenchidas conforme a média (ex.: 4.6 = 4
 * cheias + 0.6 da quinta) usando duas camadas sobrepostas:
 *  - fundo: 5 estrelas vazias (border)
 *  - frente: 5 estrelas amarelas com `width: ${pct}%; overflow: hidden`
 *
 * Click no componente: `scrollIntoView({ behavior: "smooth" })` no `#avaliacoes`
 * (section full-width sempre visível abaixo da descrição).
 *
 * Quando o produto não tem reviews aprovadas, mostra "Seja o primeiro a avaliar"
 * em estilo discreto (ainda clicável — leva pra section onde o form de escrever está).
 */
export default function RatingSummary({
  productId,
  scrollTargetId = "avaliacoes",
}: Props) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch(`${BACKEND_URL}/store/products/${productId}/reviews?limit=1`, {
      headers: apiHeaders,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active || !d?.summary) return
        setSummary(d.summary)
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [productId])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const el = document.getElementById(scrollTargetId)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (loading) {
    return <div className="h-5" aria-hidden="true" />
  }

  const total = summary?.total ?? 0
  const avg = summary?.average ?? 0
  const pct = Math.max(0, Math.min(100, (avg / 5) * 100))

  if (total === 0) {
    return (
      <a
        href={`#${scrollTargetId}`}
        onClick={handleClick}
        className="inline-flex items-center gap-2 text-[12px] text-brand-text-3 hover:text-brand-text-2 transition-colors group"
      >
        <Stars5 fillPct={0} />
        <span className="group-hover:underline">Seja o primeiro a avaliar →</span>
      </a>
    )
  }

  return (
    <a
      href={`#${scrollTargetId}`}
      onClick={handleClick}
      aria-label={`${avg.toFixed(1)} de 5 estrelas, ${total} avaliações`}
      className="inline-flex items-center gap-2 group"
    >
      <Stars5 fillPct={pct} />
      <span className="text-[13px] font-bold text-brand-text">
        {avg.toFixed(1)}
      </span>
      <span className="text-[12px] text-brand-text-2 group-hover:text-brand-cyan group-hover:underline transition-colors">
        ({total} {total === 1 ? "avaliação" : "avaliações"})
      </span>
    </a>
  )
}

/**
 * 5 estrelas em row com fill fracionário via duas camadas.
 * Fundo: vazias (text-brand-border-2). Frente: cheias (text-brand-star)
 * recortadas por `width:${pct}%`.
 */
function Stars5({ fillPct }: { fillPct: number }) {
  return (
    <span
      className="relative inline-block leading-none select-none"
      aria-hidden="true"
    >
      <span className="text-brand-border-2 text-[15px] tracking-[1px]">
        ★★★★★
      </span>
      <span
        className="absolute top-0 left-0 overflow-hidden text-brand-star text-[15px] tracking-[1px] whitespace-nowrap"
        style={{ width: `${fillPct}%` }}
      >
        ★★★★★
      </span>
    </span>
  )
}
