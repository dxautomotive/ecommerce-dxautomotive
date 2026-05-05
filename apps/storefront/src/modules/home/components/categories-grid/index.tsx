import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ICONS: Record<string, string> = {
  multimidia: "🚗", // central multimídia
  molduras: "🪞",
  "camera-de-re": "📷",
  "sensor-de-estacionamento": "🛞",
}

/**
 * Grid de 4 categorias na home — as principais do DX.
 * Cada card é dark com hover azul elétrico (PRD §6.1 item 4).
 */
export default async function CategoriesGrid() {
  const categories = await listCategories({ limit: 12 })

  // Filtra só categorias raiz (sem parent), ordem fixa pelas 4 do DX
  const order = ["multimidia", "molduras", "camera-de-re", "sensor-de-estacionamento"]
  const visible = categories
    .filter((c) => !c.parent_category && order.includes(c.handle))
    .sort((a, b) => order.indexOf(a.handle) - order.indexOf(b.handle))

  if (!visible.length) return null

  return (
    <section className="content-container py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl small:text-4xl font-bold text-brand-text">
            Categorias em destaque
          </h2>
          <p className="text-brand-muted mt-2">
            Encontre o equipamento certo para o seu veículo.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 small:grid-cols-4 gap-4 small:gap-6">
        {visible.map((cat) => (
          <LocalizedClientLink
            key={cat.id}
            href={`/categories/${cat.handle}`}
            className="group bg-brand-surface border border-brand-border hover:border-brand-primary rounded-rounded p-6 small:p-8 transition-all hover:-translate-y-1"
          >
            <div className="text-4xl small:text-5xl mb-4" aria-hidden="true">
              {ICONS[cat.handle] ?? "📦"}
            </div>
            <h3 className="text-brand-text font-semibold text-base small:text-lg mb-1 group-hover:text-brand-primary transition-colors">
              {cat.name}
            </h3>
            <p className="text-brand-muted text-sm line-clamp-2">
              {cat.description || "Ver produtos"}
            </p>
            <span className="inline-flex items-center gap-1 mt-3 text-brand-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Ver produtos
              <span aria-hidden="true">→</span>
            </span>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
