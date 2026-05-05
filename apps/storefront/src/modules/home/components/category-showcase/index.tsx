import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Visual = {
  gradient: string
  emoji: string
  pitch: string
}

const VISUALS: Record<string, Visual> = {
  multimidia: {
    gradient: "from-blue-600/40 via-blue-800/30 to-brand-bg",
    emoji: "🚗",
    pitch: "Android Auto, CarPlay e GPS",
  },
  molduras: {
    gradient: "from-purple-700/40 via-indigo-800/30 to-brand-bg",
    emoji: "🪞",
    pitch: "Acabamento original por modelo",
  },
  "camera-de-re": {
    gradient: "from-emerald-600/40 via-teal-800/30 to-brand-bg",
    emoji: "📷",
    pitch: "Visão noturna e linhas-guia",
  },
  "sensor-de-estacionamento": {
    gradient: "from-amber-600/40 via-orange-800/30 to-brand-bg",
    emoji: "🛞",
    pitch: "Alarme sonoro e display LED",
  },
}

const ORDER = [
  "multimidia",
  "molduras",
  "camera-de-re",
  "sensor-de-estacionamento",
]

export default async function CategoryShowcase() {
  const categories = await listCategories({ limit: 12 })
  const visible = categories
    .filter((c) => !c.parent_category && ORDER.includes(c.handle))
    .sort((a, b) => ORDER.indexOf(a.handle) - ORDER.indexOf(b.handle))

  if (!visible.length) return null

  return (
    <section className="content-container py-16 small:py-20">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8 small:mb-10">
        <div>
          <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-semibold">
            Para o seu carro
          </span>
          <h2 className="text-3xl small:text-4xl font-extrabold text-brand-text mt-2">
            Encontre o que precisa
          </h2>
          <p className="text-brand-muted mt-2 max-w-xl">
            Equipamentos selecionados para os principais modelos do mercado
            brasileiro. Compatibilidade verificada por veículo.
          </p>
        </div>
        <LocalizedClientLink
          href="/store"
          className="text-brand-primary hover:text-brand-text font-semibold text-sm flex items-center gap-1 transition-colors"
        >
          Ver tudo <span aria-hidden="true">→</span>
        </LocalizedClientLink>
      </div>

      <div className="grid grid-cols-2 medium:grid-cols-4 gap-3 small:gap-5">
        {visible.map((cat) => {
          const v = VISUALS[cat.handle]
          return (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="group relative rounded-xl overflow-hidden bg-brand-surface border border-brand-border hover:border-brand-primary transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-primary/10"
              data-testid={`category-card-${cat.handle}`}
            >
              <div
                className={`relative aspect-[4/5] medium:aspect-[3/4] bg-gradient-to-b ${v?.gradient ?? "from-brand-surface to-brand-bg"} flex items-end p-5`}
              >
                <span
                  className="absolute top-4 right-4 text-5xl small:text-6xl opacity-90 transition-transform group-hover:scale-110"
                  aria-hidden="true"
                >
                  {v?.emoji ?? "📦"}
                </span>

                <div className="relative z-10">
                  <p className="text-white/70 text-xs uppercase tracking-wider mb-1">
                    {v?.pitch ?? "Ver produtos"}
                  </p>
                  <h3 className="text-white text-lg small:text-xl font-bold leading-tight">
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 mt-3 text-white/80 text-sm font-medium group-hover:text-brand-primary transition-colors">
                    Ver categoria
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </LocalizedClientLink>
          )
        })}
      </div>
    </section>
  )
}
