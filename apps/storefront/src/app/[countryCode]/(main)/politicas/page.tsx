import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Políticas da loja",
  description:
    "Garantia, trocas e devoluções, prazo de entrega e privacidade na DX Automotive.",
}

const POLICIES = [
  {
    slug: "garantia",
    title: "Garantia",
    icon: "🛡️",
    summary:
      "Cobertura, prazo legal + garantia da fábrica e processo para acionar a garantia.",
  },
  {
    slug: "trocas-e-devolucoes",
    title: "Trocas e devoluções",
    icon: "↩️",
    summary:
      "7 dias de arrependimento (CDC) e regras para troca por defeito ou divergência.",
  },
  {
    slug: "entrega",
    title: "Prazo de entrega",
    icon: "🚚",
    summary:
      "Modalidades (PAC e SEDEX), prazos por região e o que fazer em caso de extravio.",
  },
  {
    slug: "privacidade",
    title: "Privacidade",
    icon: "🔒",
    summary:
      "Dados que coletamos, como usamos e seus direitos como titular pela LGPD.",
  },
] as const

export default function PoliciesIndex() {
  return (
    <main className="content-container py-12 small:py-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-brand-primary text-xs uppercase tracking-[0.3em] font-bold">
          Transparência
        </span>
        <h1 className="text-3xl small:text-4xl font-extrabold text-brand-text mt-3">
          Políticas da loja
        </h1>
        <p className="text-brand-muted mt-3">
          Aqui você encontra todas as regras que valem ao comprar na DX
          Automotive — desde a garantia até como tratamos seus dados pessoais.
        </p>
      </div>

      <div className="grid grid-cols-1 medium:grid-cols-2 gap-4 small:gap-6 mt-10">
        {POLICIES.map((p) => (
          <LocalizedClientLink
            key={p.slug}
            href={`/politicas/${p.slug}`}
            className="group bg-brand-surface border border-brand-border hover:border-brand-primary rounded-xl p-6 small:p-8 transition-all hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0" aria-hidden="true">
                {p.icon}
              </span>
              <div className="min-w-0">
                <h2 className="text-brand-text text-xl font-bold group-hover:text-brand-primary transition-colors">
                  {p.title}
                </h2>
                <p className="text-brand-muted text-sm mt-2 leading-relaxed">
                  {p.summary}
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-brand-primary text-sm font-semibold">
                  Ler política
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </main>
  )
}
