"use client"

import { useEffect, useState } from "react"

const MESSAGES = [
  "🚚 Frete grátis acima de R$ 499 para todo o Brasil",
  "⚡ Pix com 10% de desconto · aprovação imediata",
  "💳 Parcele em até 12x sem juros",
  "🛡️ Garantia 2 anos direto com a loja",
  "💬 Suporte via WhatsApp · Seg–Sáb 8h–18h",
] as const

/**
 * Barra de anúncio rotativa no topo absoluto da página.
 * Design v2.1: gradiente elétrico (cyan → primary → primary-d) com
 * setas de navegação manual + auto-rotate a cada 4s.
 *
 * Acessível: role="status", aria-live="polite", botões com aria-label.
 */
export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  const prev = () =>
    setIdx((i) => (i - 1 + MESSAGES.length) % MESSAGES.length)
  const next = () => setIdx((i) => (i + 1) % MESSAGES.length)

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full px-6 py-2.5 flex items-center justify-center gap-3 bg-grad-electric"
    >
      <button
        type="button"
        onClick={prev}
        aria-label="Mensagem anterior"
        className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs flex items-center justify-center transition-colors flex-shrink-0"
      >
        ‹
      </button>
      <p className="text-white text-[13px] font-semibold text-center tracking-wide">
        {MESSAGES[idx]}
      </p>
      <button
        type="button"
        onClick={next}
        aria-label="Próxima mensagem"
        className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs flex items-center justify-center transition-colors flex-shrink-0"
      >
        ›
      </button>
    </div>
  )
}
