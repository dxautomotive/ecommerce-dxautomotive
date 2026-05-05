import { Metadata } from "next"
import AtacadoForm from "@modules/atacado/components/atacado-form"

export const metadata: Metadata = {
  title: "Compra em volume / Atacado",
  description:
    "Preços especiais para revendedores, oficinas e instaladores. Cotação rápida pelo WhatsApp.",
}

const PERKS = [
  {
    icon: "💰",
    title: "Preços diferenciados",
    desc: "Tabela de atacado a partir de 5 unidades. Quanto mais pedido, melhor o preço.",
  },
  {
    icon: "🤝",
    title: "Atendimento dedicado",
    desc: "Vendedor exclusivo no WhatsApp pra fechar pedidos rápido e tirar dúvidas técnicas.",
  },
  {
    icon: "🚚",
    title: "Logística facilitada",
    desc: "Despacho consolidado e prazos negociados conforme volume e frequência.",
  },
  {
    icon: "🛡️",
    title: "Garantia estendida",
    desc: "Garantia contratual estendida em pedidos recorrentes para parceiros.",
  },
] as const

const TARGETS = [
  "Revendedores e lojas físicas de acessórios",
  "Oficinas e centros de instalação automotiva",
  "Lojistas de marketplaces (Shopee, Mercado Livre, Magazine Luiza)",
  "Concessionárias multimarca e seminovos",
  "Frotistas e gestores de veículos pesados",
] as const

export default function AtacadoPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-brand-primary/20 via-brand-surface to-brand-bg border-b border-brand-border">
        <div className="content-container py-12 small:py-20">
          <div className="max-w-3xl">
            <span className="text-brand-primary text-xs uppercase tracking-[0.3em] font-bold">
              Atacado · B2B
            </span>
            <h1 className="text-3xl small:text-5xl font-extrabold text-brand-text mt-3 leading-tight">
              Revendedor ou instalador?
              <br />
              <span className="text-brand-primary">Compre em volume.</span>
            </h1>
            <p className="text-brand-muted text-base small:text-lg mt-4 leading-relaxed">
              Preços especiais a partir de 5 unidades, atendimento dedicado e
              logística consolidada. Preencha abaixo e nosso vendedor entra em
              contato em até 2 horas úteis.
            </p>
          </div>
        </div>
      </section>

      <section className="content-container py-12 small:py-16">
        <div className="grid grid-cols-2 medium:grid-cols-4 gap-3 small:gap-5">
          {PERKS.map((p) => (
            <div
              key={p.title}
              className="bg-brand-surface border border-brand-border rounded-lg p-5"
            >
              <span className="text-3xl" aria-hidden="true">{p.icon}</span>
              <p className="text-brand-text font-semibold text-sm mt-3">
                {p.title}
              </p>
              <p className="text-brand-muted text-xs mt-1.5 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-container pb-16 grid grid-cols-1 medium:grid-cols-[1fr_minmax(0,420px)] gap-8 small:gap-12 items-start">
        <div>
          <h2 className="text-2xl small:text-3xl font-bold text-brand-text">
            Para quem é
          </h2>
          <ul className="mt-4 space-y-2.5">
            {TARGETS.map((t) => (
              <li key={t} className="flex gap-3 text-brand-muted">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0066FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm small:text-base">{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 bg-brand-surface border border-brand-border rounded-lg p-5">
            <h3 className="text-brand-text font-bold text-base mb-2">
              Como funciona
            </h3>
            <ol className="space-y-2 text-brand-muted text-sm">
              <li>
                <strong className="text-brand-text">1.</strong> Você preenche o
                formulário ao lado.
              </li>
              <li>
                <strong className="text-brand-text">2.</strong> Recebemos a
                cotação direto no WhatsApp e enviamos a tabela de preços
                negociada para o volume informado.
              </li>
              <li>
                <strong className="text-brand-text">3.</strong> Fechamos o
                pedido por Pix, boleto faturado ou cartão (até 12x).
              </li>
              <li>
                <strong className="text-brand-text">4.</strong> Despacho
                consolidado e nota fiscal em até 2 dias úteis.
              </li>
            </ol>
          </div>
        </div>

        <div className="medium:sticky medium:top-32">
          <AtacadoForm />
        </div>
      </section>
    </main>
  )
}
