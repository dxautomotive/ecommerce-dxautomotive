"use client"

import { useEffect, useMemo, useState } from "react"

type Props = {
  /** ISO date string ou Date — quando atinge zero, o `endLabel` substitui o timer */
  endsAt: string | Date
  /** Texto antes do timer */
  preLabel?: string
  /** Texto exibido quando o timer chega a zero */
  endLabel?: string
  /** Mostra/esconde o quadro de DIAS (deixe `false` se a campanha for curta) */
  showDays?: boolean
  /** Variante visual */
  variant?: "dark" | "danger" | "warning" | "glass"
  /** Texto-chamada antes do timer (ex.: "🔥 OFERTA RELÂMPAGO") */
  eyebrow?: string
  /** Tamanho dos quadros (default md) */
  size?: "sm" | "md" | "lg"
}

/**
 * Countdown timer reutilizável estilo Vision/kitssom.
 * - Quadros DD : HH : MM : SS com bordas
 * - Auto-update a cada 1s, sem libs externas
 * - Acessível com aria-live
 */
export default function CountdownTimer({
  endsAt,
  preLabel,
  endLabel = "Promoção encerrada",
  showDays = true,
  variant = "danger",
  eyebrow,
  size = "md",
}: Props) {
  const target = useMemo(() => new Date(endsAt).getTime(), [endsAt])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = Math.max(0, target - now)
  const expired = diff <= 0

  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)

  const sizes = {
    sm: { box: "w-10 h-10 small:w-12 small:h-12", num: "text-base small:text-lg", label: "text-[10px]" },
    md: { box: "w-14 h-14 small:w-16 small:h-16", num: "text-xl small:text-2xl", label: "text-[10px] small:text-xs" },
    lg: { box: "w-20 h-20 small:w-24 small:h-24", num: "text-3xl small:text-4xl", label: "text-xs" },
  }[size]

  const palette = {
    dark: {
      wrap: "bg-brand-surface border border-brand-border",
      box: "bg-brand-bg border-brand-border text-brand-text",
      boxLabel: "text-brand-muted",
      sep: "text-brand-muted",
      eyebrow: "text-brand-primary",
    },
    danger: {
      wrap: "bg-gradient-to-r from-red-900/40 via-brand-surface to-red-900/40 border border-brand-danger/30",
      box: "bg-brand-bg border-brand-danger/40 text-brand-text",
      boxLabel: "text-brand-muted",
      sep: "text-brand-danger",
      eyebrow: "text-brand-danger",
    },
    warning: {
      wrap: "bg-gradient-to-r from-orange-900/40 via-brand-surface to-orange-900/40 border border-brand-warning/30",
      box: "bg-brand-bg border-brand-warning/40 text-brand-text",
      boxLabel: "text-brand-muted",
      sep: "text-brand-warning",
      eyebrow: "text-brand-warning",
    },
    glass: {
      wrap: "bg-white/5 backdrop-blur-sm border border-white/10",
      box: "bg-white/10 border-white/20 text-white",
      boxLabel: "text-white/55",
      sep: "text-white/40",
      eyebrow: "text-amber-300",
    },
  }[variant]

  if (expired) {
    return (
      <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${palette.wrap}`}>
        <span className="text-brand-text font-semibold text-sm" aria-live="polite">
          {endLabel}
        </span>
      </div>
    )
  }

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div
      className={`flex flex-col items-center justify-center rounded border ${sizes.box} ${palette.box} font-mono`}
    >
      {/* suppressHydrationWarning: server/client diff de 1s é esperado em timers */}
      <span suppressHydrationWarning className={`${sizes.num} font-extrabold tabular-nums leading-none`}>
        {value.toString().padStart(2, "0")}
      </span>
      <span className={`${sizes.label} ${palette.boxLabel} uppercase tracking-wider mt-0.5`}>
        {label}
      </span>
    </div>
  )

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg ${palette.wrap}`}
    >
      {(eyebrow || preLabel) && (
        <div className="flex flex-col items-center text-center">
          {eyebrow && (
            <span className={`text-xs uppercase tracking-[0.25em] font-bold ${palette.eyebrow}`}>
              {eyebrow}
            </span>
          )}
          {preLabel && (
            <span className="text-brand-muted text-xs small:text-sm mt-0.5">
              {preLabel}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 small:gap-2">
        {showDays && (
          <>
            <Box value={days} label="dias" />
            <span className={`${sizes.num} font-bold ${palette.sep}`} aria-hidden="true">:</span>
          </>
        )}
        <Box value={hours} label="hrs" />
        <span className={`${sizes.num} font-bold ${palette.sep}`} aria-hidden="true">:</span>
        <Box value={minutes} label="min" />
        <span className={`${sizes.num} font-bold ${palette.sep}`} aria-hidden="true">:</span>
        <Box value={seconds} label="seg" />
      </div>
    </div>
  )
}
