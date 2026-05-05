import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountdownTimer from "@modules/common/components/countdown-timer"

/**
 * Banner com countdown de oferta relâmpago para uso na home.
 * O `endsAt` é configurado aqui — em sessão futura virá de Store metadata
 * ou de uma área de campanha no admin.
 */
export default function FlashSaleBanner() {
  // Próximo domingo às 23:59 BRT — exemplo de "esta semana"
  const ends = nextSundayAtMidnight()

  return (
    <section className="content-container py-8">
      <div className="rounded-2xl border border-brand-border bg-gradient-to-r from-red-950 via-brand-surface to-red-950 p-6 small:p-8 flex flex-col medium:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-brand-danger text-xs uppercase tracking-[0.3em] font-bold">
            ⚡ Esta semana
          </span>
          <h2 className="text-2xl small:text-3xl font-extrabold text-brand-text leading-tight">
            Oferta relâmpago em multimídia
          </h2>
          <p className="text-brand-muted text-sm small:text-base">
            Até <strong className="text-brand-text">15% off</strong> em centrais
            selecionadas, com Pix e parcelamento em 6x sem juros. Estoque limitado.
          </p>
          <LocalizedClientLink
            href="/categories/multimidia"
            className="self-start mt-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-5 py-2.5 rounded transition-colors"
          >
            Ver multimídia em oferta →
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
