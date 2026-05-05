import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Block = {
  eyebrow: string
  title: string
  description: string
  cta: { label: string; href: string }
  emoji: string
  /** classe Tailwind do gradient — usar tokens da paleta DX */
  bg: string
  badge?: string
}

const BLOCKS: Block[] = [
  {
    eyebrow: "Atacado",
    title: "Revendedor ou instalador?",
    description:
      "Cotação rápida pelo WhatsApp e preços especiais a partir de 5 unidades.",
    cta: { label: "Pedir cotação", href: "/atacado" },
    emoji: "🤝",
    bg: "bg-gradient-to-br from-blue-700 via-blue-900 to-brand-bg",
    badge: "Oferta B2B",
  },
  {
    eyebrow: "Compatibilidade garantida",
    title: "Achou pra seu carro?",
    description:
      "Conferimos compatibilidade marca/modelo/ano antes de despachar. Trocou? Devolvemos.",
    cta: { label: "Ver multimídia", href: "/categories/multimidia" },
    emoji: "✅",
    bg: "bg-gradient-to-br from-emerald-700 via-emerald-900 to-brand-bg",
    badge: "Garantia",
  },
  {
    eyebrow: "Pague no Pix",
    title: "Desconto exclusivo",
    description:
      "10% off à vista no Pix em todos os produtos da loja. Aprovação imediata.",
    cta: { label: "Ver promoções", href: "/store" },
    emoji: "💸",
    bg: "bg-gradient-to-br from-fuchsia-700 via-purple-900 to-brand-bg",
    badge: "Pix",
  },
] as const

export default function PromotionBlocks() {
  return (
    <section className="content-container py-12 small:py-16">
      <div className="grid grid-cols-1 medium:grid-cols-3 gap-4 small:gap-6">
        {BLOCKS.map((b) => (
          <LocalizedClientLink
            key={b.title}
            href={b.cta.href}
            className={`group relative rounded-2xl overflow-hidden border border-brand-border hover:border-brand-primary transition-all hover:-translate-y-1 ${b.bg}`}
          >
            <div className="relative p-6 small:p-8 flex flex-col gap-3 min-h-[220px]">
              <span
                className="absolute top-4 right-4 text-6xl opacity-30 transition-transform group-hover:scale-110 group-hover:opacity-50"
                aria-hidden="true"
              >
                {b.emoji}
              </span>

              {b.badge && (
                <span className="self-start bg-white/15 backdrop-blur text-white text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded">
                  {b.badge}
                </span>
              )}

              <span className="text-white/70 text-xs uppercase tracking-[0.2em] font-semibold">
                {b.eyebrow}
              </span>
              <h3 className="text-white text-2xl small:text-3xl font-extrabold leading-tight">
                {b.title}
              </h3>
              <p className="text-white/80 text-sm small:text-base leading-relaxed max-w-sm">
                {b.description}
              </p>

              <span className="mt-2 inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:text-brand-primary transition-colors">
                {b.cta.label}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
