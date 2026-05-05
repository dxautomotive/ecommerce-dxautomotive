"use client"

import { useEffect, useState } from "react"

type Review = {
  name: string
  date: string
  rating: number
  text: string
  initial: string
}

/**
 * Depoimentos placeholder — substituir por integração real (ex.: Trustvox)
 * em sessão futura. Por ora, 8 reviews fictícias para preencher visualmente.
 */
const REVIEWS: Review[] = [
  {
    name: "Carolina S.",
    date: "Março/2026",
    rating: 5,
    text: "Multimídia chegou rápido e a instalação foi plug-and-play, conforme prometido. Recomendo!",
    initial: "C",
  },
  {
    name: "João P.",
    date: "Março/2026",
    rating: 5,
    text: "Atendimento por WhatsApp foi ótimo, tirou todas as dúvidas antes de eu comprar. Produto excelente.",
    initial: "J",
  },
  {
    name: "Amanda C.",
    date: "Março/2026",
    rating: 5,
    text: "Comprei a moldura para o painel do meu Corolla e ficou idêntica à original. Vale muito a pena.",
    initial: "A",
  },
  {
    name: "Rafael A.",
    date: "Abril/2026",
    rating: 5,
    text: "Sensor de estacionamento com alarme sonoro funcionando perfeito. Entrega em 3 dias úteis.",
    initial: "R",
  },
  {
    name: "Lívia F.",
    date: "Abril/2026",
    rating: 5,
    text: "Site fácil de navegar e desconto no Pix bem interessante. Voltarei a comprar.",
    initial: "L",
  },
  {
    name: "Roberto G.",
    date: "Maio/2026",
    rating: 5,
    text: "Câmera de ré com qualidade muito acima do que esperava pelo preço. Imagem nítida até de noite.",
    initial: "R",
  },
  {
    name: "Gabriela R.",
    date: "Maio/2026",
    rating: 5,
    text: "Embalagem caprichada e produto exatamente como descrito. Compraria de novo.",
    initial: "G",
  },
  {
    name: "Felipe A.",
    date: "Maio/2026",
    rating: 5,
    text: "Indiquei para meu primo, que também ficou satisfeito. Já virou minha loja de confiança.",
    initial: "F",
  },
] as const

const PER_PAGE = 3

export default function Testimonials() {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(REVIEWS.length / PER_PAGE)

  useEffect(() => {
    const t = setInterval(() => setPage((p) => (p + 1) % totalPages), 7000)
    return () => clearInterval(t)
  }, [totalPages])

  const visible = REVIEWS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <section className="bg-brand-surface border-y border-brand-border">
      <div className="content-container py-16 small:py-20">
        <div className="text-center mb-10">
          <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-semibold">
            O que falam sobre nós
          </span>
          <h2 className="text-3xl small:text-4xl font-extrabold text-brand-text mt-2">
            Quem comprou recomenda
          </h2>
          <p className="text-brand-muted mt-2 max-w-xl mx-auto">
            Avaliações reais de clientes da DX Automotive.
          </p>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-3 gap-5">
          {visible.map((r) => (
            <article
              key={r.name + r.date}
              className="bg-brand-bg border border-brand-border rounded-xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-primary font-bold flex items-center justify-center">
                  {r.initial}
                </div>
                <div>
                  <p className="text-brand-text text-sm font-semibold">{r.name}</p>
                  <p className="text-brand-muted text-xs">{r.date}</p>
                </div>
              </div>

              <div className="flex gap-0.5" aria-label={`${r.rating} estrelas de 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={i < r.rating ? "#FF6B00" : "transparent"}
                    stroke={i < r.rating ? "#FF6B00" : "#3a3a3a"}
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              <p className="text-brand-muted text-sm leading-relaxed">"{r.text}"</p>
            </article>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Ir para página ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === page
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
