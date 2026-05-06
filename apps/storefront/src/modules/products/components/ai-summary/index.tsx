"use client"

type Props = {
  /** Bullets do resumo (HTML simples permitido em cada item — ex.: <strong>) */
  items: string[]
  /**
   * ID do elemento DOM pra scroll suave quando clicar em "Ver descrição completa".
   * Default: "produto-detalhes" (a section full-width com `<ProductTabsDX>`).
   */
  scrollTargetId?: string
  /** Quantos bullets mostrar antes de oferecer o link pra descrição completa */
  truncateAt?: number
}

/**
 * AI Summary v2.1 (seção 9.2 do guide).
 *
 * Mostra os primeiros N bullets do resumo (default 2) e oferece um link
 * "Ver descrição completa →" que rola suavemente pra section full-width
 * abaixo do grid 3 colunas (onde fica o `<ProductTabsDX>` com tudo).
 *
 * Comportamento alinhado com KaBuM: a coluna info center fica enxuta com
 * só o resumo + verificador de compatibilidade; a descrição completa,
 * specs, compatibilidade e avaliações ficam abaixo do grid em largura cheia.
 */
export default function AiSummary({
  items,
  scrollTargetId = "produto-detalhes",
  truncateAt = 2,
}: Props) {
  if (!items || items.length === 0) return null

  const visible = items.slice(0, truncateAt)
  const hasMore = items.length > truncateAt

  const handleVerMais = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const el = document.getElementById(scrollTargetId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

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
      {hasMore && (
        <a
          href={`#${scrollTargetId}`}
          onClick={handleVerMais}
          className="inline-flex items-center gap-1 text-[12px] font-bold text-brand-primary mt-3 cursor-pointer hover:text-brand-cyan transition-colors"
        >
          Ver descrição completa
          <ChevronDownIcon />
        </a>
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
