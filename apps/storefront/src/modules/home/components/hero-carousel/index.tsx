"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Feature = { icon: string; label: string; sub: string }

type Slide = {
  eyebrow?: string
  title: string
  highlight?: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  /** gradient de cor aplicado sobre o fundo dark */
  accentGradient: string
  features: Feature[]
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
    accentGradient:
      "radial-gradient(ellipse at 70% 40%, rgba(59,130,246,0.45) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.3) 0%, transparent 55%)",
    features: [
      { icon: "📱", label: "Android Auto", sub: "e Apple CarPlay" },
      { icon: "🛰️", label: "GPS integrado", sub: "mapas offline" },
      { icon: "🔌", label: "Plug & Play", sub: "sem modificar" },
      { icon: "🚚", label: "Frete grátis", sub: "todo o Brasil" },
    ],
  },
  {
    eyebrow: "Linha Multimídia",
    title: "Android Auto e CarPlay",
    highlight: "sem fio.",
    description:
      "Telas de 9 e 10 polegadas, GPS integrado e compatibilidade verificada por modelo de veículo.",
    primaryCta: { label: "Ver multimídia", href: "/categories/multimidia" },
    secondaryCta: { label: "Falar com vendedor", href: "/store?q=multimidia" },
    accentGradient:
      "radial-gradient(ellipse at 70% 40%, rgba(16,185,129,0.45) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.3) 0%, transparent 55%)",
    features: [
      { icon: "📺", label: "Tela 9–10″", sub: "Full HD" },
      { icon: "🎵", label: "Bluetooth 5.0", sub: "streaming" },
      { icon: "🏎️", label: "Compatível", sub: "por modelo" },
      { icon: "⚡", label: "Instalação", sub: "em 30 min" },
    ],
  },
  {
    eyebrow: "Compre em volume",
    title: "Revendedor ou instalador?",
    highlight: "Atacado direto.",
    description:
      "Preços especiais para revendedores e oficinas. Cotação rápida pelo WhatsApp, sem burocracia.",
    primaryCta: { label: "Pedir cotação", href: "/atacado" },
    accentGradient:
      "radial-gradient(ellipse at 70% 40%, rgba(245,158,11,0.45) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(239,68,68,0.25) 0%, transparent 55%)",
    features: [
      { icon: "💰", label: "Preço atacado", sub: "a partir de 5 un" },
      { icon: "📦", label: "Estoque pronto", sub: "envio imediato" },
      { icon: "🤝", label: "Suporte B2B", sub: "WhatsApp direto" },
      { icon: "🧾", label: "Nota fiscal", sub: "para CNPJ" },
    ],
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
      className="relative w-full overflow-hidden bg-slate-900"
    >
      <div className="relative min-h-[58vh] small:min-h-[65vh]">
        {SLIDES.map((s, i) => (
          <div
            key={s.title}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Gradiente colorido do slide */}
            <div
              className="absolute inset-0"
              style={{ background: s.accentGradient }}
              aria-hidden="true"
            />
            {/* Textura sutil de grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
              aria-hidden="true"
            />

            <div className="relative content-container h-full min-h-[58vh] small:min-h-[65vh] grid grid-cols-1 medium:grid-cols-2 items-center gap-8 py-14 small:py-20">

              {/* ── Coluna de texto ── */}
              <div className="flex flex-col gap-5 max-w-2xl">
                {s.eyebrow && (
                  <span className="text-blue-400 text-xs uppercase tracking-[0.25em] font-semibold">
                    {s.eyebrow}
                  </span>
                )}
                <h1 className="text-4xl small:text-5xl medium:text-6xl leading-[1.05] text-white font-extrabold">
                  {s.title}
                  {s.highlight && (
                    <>
                      {" "}
                      <span className="text-blue-400">{s.highlight}</span>
                    </>
                  )}
                </h1>
                <p className="text-white/65 text-base small:text-lg leading-relaxed">
                  {s.description}
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <LocalizedClientLink
                    href={s.primaryCta.href}
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-3 rounded-md shadow-lg shadow-blue-500/25 transition-colors"
                  >
                    {s.primaryCta.label}
                    <span aria-hidden="true">→</span>
                  </LocalizedClientLink>
                  {s.secondaryCta && (
                    <LocalizedClientLink
                      href={s.secondaryCta.href}
                      className="inline-flex items-center border border-white/25 hover:border-white/60 text-white/80 hover:text-white font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                      {s.secondaryCta.label}
                    </LocalizedClientLink>
                  )}
                </div>
              </div>

              {/* ── Coluna direita: grid de features ── */}
              <div className="hidden medium:grid grid-cols-2 gap-3 w-full max-w-sm ml-auto">
                {s.features.map((f) => (
                  <div
                    key={f.label}
                    className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 transition-colors backdrop-blur-sm"
                  >
                    <span className="text-3xl" aria-hidden="true">{f.icon}</span>
                    <p className="text-white font-semibold text-sm leading-tight">{f.label}</p>
                    <p className="text-white/50 text-xs">{f.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Dots de navegação */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ir para slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active
                  ? "w-8 bg-blue-400"
                  : "w-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
