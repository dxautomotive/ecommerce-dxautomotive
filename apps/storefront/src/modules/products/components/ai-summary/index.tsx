"use client"

import { useState } from "react"

type Props = {
  /**
   * Lista de bullets do resumo (HTML simples permitido em cada item — ex.: <strong>).
   * Preferimos receber pré-processado pelo server pra não precisar IA em runtime;
   * fallback gera 2-3 highlights da descrição quando vazio.
   */
  items: string[]
}

/**
 * AI Summary v2.1 (seção 9.2 do guide).
 *
 * Bullets gerados por IA (preprocessados ou da metadata). Trunca em 2 itens;
 * "Ver mais" expande inline. Fica entre stars e CompatibilityChecker, na col 2
 * (info center) da PDP 3 colunas.
 */
export default function AiSummary({ items }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!items || items.length === 0) return null

  const visible = expanded ? items : items.slice(0, 2)
  const remaining = items.length - 2

  return (
    <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-[.15em] text-brand-cyan mb-2.5 flex items-center gap-1.5">
        <SparklesIcon />
        Resumo gerado por IA
      </p>
      {visible.map((item, i) => (
        <div
          key={i}
          className="text-[13px] text-brand-text-2 py-1.5 border-b border-brand-border last:border-none last:pb-0 flex gap-2"
        >
          <span
            className="text-brand-primary text-base leading-[1.3] flex-shrink-0"
            aria-hidden="true"
          >
            •
          </span>
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </div>
      ))}
      {!expanded && remaining > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-1 text-[12px] font-bold text-brand-primary mt-2.5 cursor-pointer hover:text-brand-cyan transition-colors"
        >
          Ver mais ({remaining})
          <ChevronDownIcon />
        </button>
      )}
    </div>
  )
}

function SparklesIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
      <path d="M19 14L19.75 17.25L23 18L19.75 18.75L19 22L18.25 18.75L15 18L18.25 17.25L19 14Z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
