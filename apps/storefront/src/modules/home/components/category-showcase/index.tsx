import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type CategoryBlock = {
  id?: string
  category_handle: string
  emoji?: string
  gradient?: string
  pitch?: string
  custom_link?: string
}

type Visual = {
  gradient: string
  emoji: string
  pitch: string
}

const VISUALS: Record<string, Visual> = {
  multimidia: {
    gradient: "from-blue-500 to-blue-800",
    emoji: "🚗",
    pitch: "Android Auto, CarPlay e GPS",
  },
  molduras: {
    gradient: "from-purple-500 to-indigo-700",
    emoji: "🪞",
    pitch: "Acabamento original por modelo",
  },
  "camera-de-re": {
    gradient: "from-emerald-500 to-teal-700",
    emoji: "📷",
    pitch: "Visão noturna e linhas-guia",
  },
  "sensor-de-estacionamento": {
    gradient: "from-amber-400 to-orange-600",
    emoji: "🛞",
    pitch: "Alarme sonoro e display LED",
  },
}

const DEFAULT_ORDER = [
  "multimidia",
  "molduras",
  "camera-de-re",
  "sensor-de-estacionamento",
]

type Props = {
  eyebrow?: string
  title?: string
  description?: string
  blocks?: CategoryBlock[]
}

export default async function CategoryShowcase({
  eyebrow = "Para o seu carro",
  title = "Encontre o que precisa",
  description = "Equipamentos selecionados para os principais modelos do mercado brasileiro. Compatibilidade verificada por veículo.",
  blocks,
}: Props = {}) {
  const categories = await listCategories({ limit: 20 })
  const catByHandle = Object.fromEntries(categories.map((c) => [c.handle, c]))

  // Resolve itens — usa blocks do admin quando configurado, senão fallback
  const useBlocks = blocks && blocks.length > 0
  const items = useBlocks
    ? blocks
        .filter((b) => b.category_handle || b.custom_link)
        .map((b) => ({
          id: b.id || b.category_handle,
          href: b.custom_link || `/categories/${b.category_handle}`,
          name: catByHandle[b.category_handle]?.name ?? b.category_handle,
          emoji: b.emoji || VISUALS[b.category_handle]?.emoji || "📦",
          gradient:
            b.gradient ||
            VISUALS[b.category_handle]?.gradient ||
            "from-blue-500 to-blue-800",
          pitch: b.pitch ?? VISUALS[b.category_handle]?.pitch ?? "",
        }))
    : DEFAULT_ORDER.filter((h) => catByHandle[h]).map((h) => ({
        id: h,
        href: `/categories/${h}`,
        name: catByHandle[h]?.name ?? h,
        emoji: VISUALS[h]?.emoji ?? "📦",
        gradient: VISUALS[h]?.gradient ?? "from-blue-500 to-blue-800",
        pitch: VISUALS[h]?.pitch ?? "",
      }))

  if (!items.length) return null

  return (
    <section className="content-container py-16 small:py-20">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10 small:mb-12">
        <div>
          <span className="text-brand-primary text-xs uppercase tracking-[0.25em] font-semibold">
            {eyebrow}
          </span>
          <h2 className="text-3xl small:text-4xl font-extrabold text-brand-text mt-2">
            {title}
          </h2>
          <p className="text-brand-muted mt-2 max-w-xl">{description}</p>
        </div>
        <LocalizedClientLink
          href="/store"
          className="text-brand-primary hover:text-brand-text font-semibold text-sm flex items-center gap-1 transition-colors"
        >
          Ver tudo <span aria-hidden="true">→</span>
        </LocalizedClientLink>
      </div>

      {/* Layout circular — inspirado no Vision-Generico-V35 collection-list */}
      <div className="flex gap-6 small:gap-10 overflow-x-auto pb-3 medium:justify-center snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <LocalizedClientLink
            key={item.id}
            href={item.href}
            className="group flex flex-col items-center gap-3 flex-shrink-0 snap-start w-[128px] small:w-[152px]"
            data-testid={`category-card-${item.id}`}
          >
            {/* Círculo — scale 0.95 → 1.0 no hover (padrão Vision) */}
            <div
              className={`
                w-[128px] h-[128px] small:w-[152px] small:h-[152px]
                rounded-full
                bg-gradient-to-br ${item.gradient}
                flex items-center justify-center
                shadow-[0_0_3px_0_rgba(0,0,0,0.25)]
                overflow-hidden
                transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                scale-95 group-hover:scale-100
              `}
            >
              <span
                className="text-5xl small:text-6xl select-none transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              >
                {item.emoji}
              </span>
            </div>

            {/* Título e pitch abaixo do círculo */}
            <div className="text-center">
              <h3 className="text-brand-text font-bold text-sm small:text-base leading-tight group-hover:text-brand-primary transition-colors duration-200">
                {item.name}
              </h3>
              {item.pitch && (
                <p className="text-brand-muted text-xs mt-1 leading-snug">
                  {item.pitch}
                </p>
              )}
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
