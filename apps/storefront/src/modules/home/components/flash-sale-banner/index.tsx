import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountdownTimer from "@modules/common/components/countdown-timer"

type Props = {
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaUrl?: string
  endsAtIso?: string
}

export default function FlashSaleBanner({
  title = "Black Week DX",
  subtitle = "Até 25% off + Pix com 10% adicional em centrais multimídia",
  ctaLabel = "Aproveitar agora",
  ctaUrl = "/store",
  endsAtIso,
}: Props = {}) {
  const ends = endsAtIso && endsAtIso.trim() ? endsAtIso : nextSundayAtMidnight()

  return (
    <section className="content-container py-8">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/25 blur-3xl" />
        </div>
        {/* Textura diagonal */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ background: "repeating-linear-gradient(60deg, transparent, transparent 60px, #fff 60px, #fff 61px)" }}
        />

        {/* ── Layout principal ──────────────────────────────────── */}
        <div className="relative z-10 px-6 py-5 small:px-10 small:py-6 flex flex-col medium:flex-row medium:items-stretch gap-5">

          {/* Esquerda — badge · título · subtítulo */}
          <div className="flex flex-col justify-center gap-2.5 flex-1">
            <span className="inline-flex w-fit items-center gap-1.5 bg-amber-400 text-black text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-[0.15em]">
              ⚡ Esta semana
            </span>
            <h2 className="text-3xl small:text-4xl font-extrabold text-white leading-tight">
              {title}
            </h2>
            <p className="text-white/70 text-sm small:text-base leading-relaxed max-w-md">
              {subtitle}
            </p>
          </div>

          {/* Direita — timer em cima · botão embaixo */}
          {/* items-stretch no pai faz esta coluna ter a mesma altura que a esquerda  */}
          {/* justify-between empurra timer pro topo e botão pro fundo — alinhados   */}
          <div className="flex flex-col items-start medium:items-end justify-between gap-4 medium:min-w-[280px]">
            <CountdownTimer
              endsAt={ends}
              eyebrow="Termina em"
              variant="glass"
              size="sm"
              showDays
            />
            <LocalizedClientLink
              href={ctaUrl}
              className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-extrabold px-6 py-3 rounded-lg transition-colors text-sm tracking-wide shadow-lg shadow-amber-400/20 w-full medium:w-auto"
            >
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </LocalizedClientLink>
          </div>

        </div>
      </div>
    </section>
  )
}

function nextSundayAtMidnight() {
  const d = new Date()
  const day = d.getDay()
  const diffToSunday = (7 - day) % 7 || 7
  const sunday = new Date(d)
  sunday.setDate(d.getDate() + diffToSunday)
  sunday.setHours(23, 59, 59, 999)
  return sunday.toISOString()
}
