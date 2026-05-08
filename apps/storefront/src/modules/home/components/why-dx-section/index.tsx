type Pillar = {
  icon: string
  accent: string
  title: string
  description: string
}

const PILLARS: Pillar[] = [
  {
    icon: "🛡️",
    accent: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
    title: "Garantia 12 meses",
    description: "Suporte direto com a loja. Sem burocracia, sem intermediários.",
  },
  {
    icon: "⚡",
    accent: "from-amber-400/20 to-amber-500/10 border-amber-400/30",
    title: "Pix com 10% off",
    description: "Desconto real no Pix, aprovação em segundos. Sem pagar a mais.",
  },
  {
    icon: "🚚",
    accent: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    title: "Frete grátis acima de R$ 499",
    description: "Enviamos para todo o Brasil via Correios com rastreamento.",
  },
  {
    icon: "🔌",
    accent: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
    title: "Plug & Play garantido",
    description: "Compatibilidade verificada por modelo. Instala em 30 minutos.",
  },
]

type Props = {
  eyebrow?: string
  title?: string
  description?: string
}

export default function WhyDXSection({
  eyebrow = "Por que a DX Automotive?",
  title = "Tecnologia automotiva sem complicação",
  description = "Mais de 200 modelos compatíveis, suporte humano no WhatsApp e entrega rápida para qualquer estado do Brasil.",
}: Props = {}) {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-16 small:py-20">
      {/* Background gradient decorativo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 55%), radial-gradient(ellipse at 10% 80%, rgba(99,102,241,0.10) 0%, transparent 50%)",
        }}
        aria-hidden="true"
      />
      {/* Grid texture sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <div className="relative content-container">
        {/* Header */}
        <div className="text-center mb-12 small:mb-16">
          <span className="text-blue-400 text-xs uppercase tracking-[0.25em] font-semibold">
            {eyebrow}
          </span>
          <h2 className="text-3xl small:text-4xl font-extrabold text-white mt-3 leading-tight">
            {title}
          </h2>
          <p className="text-white/55 mt-3 max-w-xl mx-auto text-base small:text-lg leading-relaxed">
            {description}
          </p>
        </div>

        {/* Grid de pilares */}
        <div className="grid grid-cols-1 small:grid-cols-2 large:grid-cols-4 gap-4">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className={`bg-gradient-to-br ${p.accent} border rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-sm`}
            >
              <span
                className="text-4xl select-none"
                aria-hidden="true"
              >
                {p.icon}
              </span>
              <div>
                <p className="text-white font-bold text-base leading-snug">
                  {p.title}
                </p>
                <p className="text-white/55 text-sm mt-1 leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
