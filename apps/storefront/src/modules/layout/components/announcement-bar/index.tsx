"use client"

import { useEffect, useState } from "react"

const MESSAGES = [
  { icon: "🚚", text: "Frete para todo o Brasil" },
  { icon: "💸", text: "Desconto especial no Pix" },
  { icon: "💳", text: "Parcele em até 12x no cartão" },
  { icon: "💬", text: "Atendimento por WhatsApp seg a sáb 9h–18h" },
  { icon: "🛡️", text: "Garantia em todos os produtos" },
] as const

/**
 * Barra de anúncio rotativa no topo absoluto da página.
 * Inspirada na barra-topo do tema Vision (kitssom-style).
 * Auto-roda a cada 4s. Acessível com role="status".
 */
export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-brand-primary text-white text-xs sm:text-sm font-medium tracking-wide"
    >
      <div className="content-container flex items-center justify-center gap-2 py-2 overflow-hidden">
        {MESSAGES.map((m, i) => (
          <div
            key={m.text}
            className={`flex items-center gap-2 transition-all duration-500 ${
              i === idx
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 absolute"
            }`}
            aria-hidden={i !== idx}
          >
            <span aria-hidden="true">{m.icon}</span>
            <span>{m.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
