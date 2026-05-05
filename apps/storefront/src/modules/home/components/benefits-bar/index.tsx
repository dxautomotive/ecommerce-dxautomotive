/**
 * Barra de benefícios — 4 ícones logo abaixo do hero.
 * PRD §6.1 item 2 — Frete BR / Pix com desconto / 12x / Suporte WhatsApp.
 */
const BENEFITS = [
  {
    icon: "🚚",
    title: "Frete para todo o Brasil",
    desc: "Envio via Correios em até 24h após confirmação",
  },
  {
    icon: "💸",
    title: "Pix com desconto",
    desc: "Pague com Pix e economize na hora",
  },
  {
    icon: "💳",
    title: "Parcele em até 12x",
    desc: "No cartão, com taxas competitivas",
  },
  {
    icon: "💬",
    title: "Suporte por WhatsApp",
    desc: "Tire suas dúvidas direto com o vendedor",
  },
] as const

export default function BenefitsBar() {
  return (
    <section className="border-y border-brand-border bg-brand-surface">
      <div className="content-container py-8 grid grid-cols-2 small:grid-cols-4 gap-4 small:gap-6">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0" aria-hidden="true">
              {b.icon}
            </span>
            <div>
              <p className="text-brand-text font-semibold text-sm small:text-base">
                {b.title}
              </p>
              <p className="text-brand-muted text-xs small:text-sm mt-0.5">
                {b.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
