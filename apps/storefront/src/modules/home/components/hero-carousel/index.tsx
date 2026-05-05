"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Slide = {
  eyebrow?: string
  title: string
  highlight?: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  /** classes Tailwind para o gradient de fundo do slide */
  gradient: string
  /** texto SVG decorativo (placeholder até subir imagens reais) */
  emoji?: string
}

const SLIDES: Slide[] = [
  {
    eyebrow: "DX Automotive",
    title: "Tecnologia que transforma",
    highlight: "o seu carro.",
    description:
      "Centrais multimídia, molduras, câmeras e sensores com instalação plug-and-play. Frete para todo o Brasil.",
    primaryCta: { label: "Ver produtos", href: "/store" },
    secondaryCta: { label: "Multimídia para meu carro", href: "/categories/multimidia" },
    gradient:
      "bg-[radial-gradient(ellipse_at_30%_30%,rgba(0,102,255,0.35)_0%,transparent_55%),radial-gradient(ellipse_at_70%_70%,rgba(0,102,255,0.2)_0%,transparent_55%)]",
    emoji: "🚗",
  },
  {
    eyebrow: "Linha Multimídia",
    title: "Android Auto e CarPlay",
    highlight: "sem fio.",
    description:
      "Centrais com tela de 9 e 10 polegadas, GPS integrado e plug-and-play para os principais modelos do mercado.",
    primaryCta: { label: "Ver multimídia", href: "/categories/multimidia" },
    secondaryCta: { label: "Falar com vendedor", href: "/store?q=multimidia" },
    gradient:
      "bg-[radial-gradient(ellipse_at_70%_30%,rgba(0,200,81,0.28)_0%,transparent_55%),radial-gradient(ellipse_at_20%_70%,rgba(0,102,255,0.25)_0%,transparent_55%)]",
    emoji: "📱",
  },
  {
    eyebrow: "Compre em volume",
    title: "Revendedor ou instalador?",
    highlight: "Atacado direto.",
    description:
      "Preços especiais para revendedores e oficinas. Cotação rápida pelo WhatsApp, sem burocracia.",
    primaryCta: { label: "Pedir cotação", href: "/atacado" },
    gradient:
      "bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,107,0,0.28)_0%,transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(0,102,255,0.2)_0%,transparent_55%)]",
    emoji: "🤝",
  },
] as const

export default function HeroCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      aria-label="Banner principal"
      className="relative w-full overflow-hidden bg-brand-bg border-b border-brand-border"
    >
      <div className="relative min-h-[55vh] small:min-h-[68vh]">
        {SLIDES.map((s, i) => (
          <div
            key={s.title}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className={`absolute inset-0 ${s.gradient}`} aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/80 to-transparent" aria-hidden="true" />

            <div className="relative content-container h-full min-h-[55vh] small:min-h-[68vh] grid grid-cols-1 medium:grid-cols-2 items-center gap-8 py-16 small:py-24">
              <div className="flex flex-col gap-5 max-w-2xl">
                {s.eyebrow && (
                  <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-semibold">
                    {s.eyebrow}
                  </span>
                )}
                <h1 className="text-4xl small:text-5xl medium:text-6xl leading-[1.05] text-brand-text font-extrabold">
                  {s.title}
                  {s.highlight && (
                    <>
                      {" "}
                      <span className="text-brand-primary">{s.highlight}</span>
                    </>
                  )}
                </h1>
                <p className="text-brand-muted text-base small:text-lg leading-relaxed">
                  {s.description}
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <LocalizedClientLink
                    href={s.primaryCta.href}
                    className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-6 py-3 rounded-md shadow-lg shadow-brand-primary/20 transition-colors"
                  >
                    {s.primaryCta.label}
                    <span aria-hidden="true">→</span>
                  </LocalizedClientLink>
                  {s.secondaryCta && (
                    <LocalizedClientLink
                      href={s.secondaryCta.href}
                      className="inline-flex items-center border border-brand-border hover:border-brand-primary text-brand-text hover:text-brand-primary font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                      {s.secondaryCta.label}
                    </LocalizedClientLink>
                  )}
                </div>
              </div>

              <div className="hidden medium:flex justify-center items-center">
                <div className="relative w-72 h-72 large:w-96 large:h-96 rounded-full bg-brand-surface/50 backdrop-blur border border-brand-border flex items-center justify-center">
                  <span className="text-[10rem] large:text-[14rem] opacity-90" aria-hidden="true">
                    {s.emoji}
                  </span>
                  <div className="absolute inset-0 rounded-full border border-brand-primary/30 animate-ping" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ir para slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === active
                  ? "w-8 bg-brand-primary"
                  : "w-2 bg-brand-border hover:bg-brand-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
