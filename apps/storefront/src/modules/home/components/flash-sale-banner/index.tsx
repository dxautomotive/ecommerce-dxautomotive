import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountdownTimer from "@modules/common/components/countdown-timer"

type Props = {
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaUrl?: string
  /** ISO 8601. Se vazio, cai no "próximo domingo às 23:59" como fallback. */
  endsAtIso?: string
}

/**
 * Banner com countdown de oferta relâmpago. Settings configuráveis
 * via /app/page-builder.
 */
export default function FlashSaleBanner({
  title = "Oferta relâmpago em multimídia",
  subtitle = "Até 15% off em centrais selecionadas, com Pix e parcelamento em 6x sem juros. Estoque limitado.",
  ctaLabel = "Ver multimídia em oferta →",
  ctaUrl = "/categories/multimidia",
  endsAtIso,
}: Props = {}) {
  const ends = endsAtIso && endsAtIso.trim() ? endsAtIso : nextSundayAtMidnight()

  return (
    <section className="content-container py-8">
      <div className="rounded-2xl border border-brand-border bg-gradient-to-r from-red-950 via-brand-surface to-red-950 p-6 small:p-8 flex flex-col medium:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-brand-danger text-xs uppercase tracking-[0.3em] font-bold">
            ⚡ Esta semana
          </span>
          <h2 className="text-2xl small:text-3xl font-extrabold text-brand-text leading-tight">
            {title}
          </h2>
          <p className="text-brand-muted text-sm small:text-base">{subtitle}</p>
          <LocalizedClientLink
            href={ctaUrl}
            className="self-start mt-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-5 py-2.5 rounded transition-colors"
          >
            {ctaLabel}
          </LocalizedClientLink>
        </div>

        <CountdownTimer
          endsAt={ends}
          eyebrow="Termina em"
          variant="danger"
          size="md"
          showDays
        />
      </div>
    </section>
  )
}

function nextSundayAtMidnight() {
  const d = new Date()
  const day = d.getDay() // 0 = domingo
  const diffToSunday = (7 - day) % 7 || 7
  const sunday = new Date(d)
  sunday.setDate(d.getDate() + diffToSunday)
  sunday.setHours(23, 59, 59, 999)
  return sunday.toISOString()
}
