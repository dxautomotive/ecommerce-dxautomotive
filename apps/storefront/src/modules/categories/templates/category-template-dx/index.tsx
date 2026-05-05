import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import CategoryFilters, {
  type FilterFacets,
} from "@modules/categories/components/category-filters"
import CategoryProductGrid from "@modules/categories/components/category-product-grid"
import SortDropdown from "@modules/categories/components/sort-dropdown"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  category: HttpTypes.StoreProductCategory
  countryCode: string
  sortBy?: SortOptions
}

/**
 * Template DX da página de categoria/coleção.
 * Layout (desktop):
 *  ┌─ Breadcrumb ─────────────────────────────────────┐
 *  ├─ Banner do header (título + descrição) ──────────┤
 *  ├──────────┬───────────────────────────────────────┤
 *  │ Sidebar  │ Toolbar (count + sort)                │
 *  │ filtros  │ ───────                               │
 *  │          │ Grid (2 colunas mobile, 3-4 desktop)  │
 *  │          │                                       │
 *  │          │ Paginação                             │
 *  └──────────┴───────────────────────────────────────┘
 *
 * Filtros mantidos via URL params (?marca=&modelo=&anoIni=&anoFim=&priceMin=&priceMax=).
 */
export default async function CategoryTemplateDX({
  category,
  countryCode,
  sortBy,
}: Props) {
  if (!category || !countryCode) notFound()

  const region = await getRegion(countryCode)
  if (!region) notFound()

  // Pega todos os produtos da categoria — limit alto para client-side filtering
  // funcionar bem. Quando o catálogo crescer (>500), trocar por server-side query.
  const { response } = await listProducts({
    countryCode,
    queryParams: {
      category_id: [category.id],
      limit: 200,
      fields: "*variants.calculated_price,*variants,*images,+metadata,+categories",
    } as any,
  })
  const products = response.products

  const facets = computeFacets(products)
  const parents = collectParents(category)

  return (
    <>
      {/* Breadcrumb */}
      <nav
        aria-label="Caminho de navegação"
        className="content-container py-4 text-xs text-brand-muted"
      >
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <LocalizedClientLink href="/" className="hover:text-brand-text transition-colors">
              Início
            </LocalizedClientLink>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <LocalizedClientLink href="/store" className="hover:text-brand-text transition-colors">
              Loja
            </LocalizedClientLink>
          </li>
          {parents.map((p) => (
            <span key={p.id} className="contents">
              <li aria-hidden="true">/</li>
              <li>
                <LocalizedClientLink
                  href={`/categories/${p.handle}`}
                  className="hover:text-brand-text transition-colors"
                >
                  {p.name}
                </LocalizedClientLink>
              </li>
            </span>
          ))}
          <li aria-hidden="true">/</li>
          <li className="text-brand-text font-medium">{category.name}</li>
        </ol>
      </nav>

      {/* Header da categoria */}
      <header className="content-container pb-6">
        <div className="bg-gradient-to-r from-brand-primary/15 via-brand-surface to-transparent border border-brand-border rounded-xl p-6 small:p-8">
          <h1 className="text-3xl small:text-4xl font-extrabold text-brand-text leading-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-brand-muted mt-2 max-w-2xl">{category.description}</p>
          )}
          <p className="text-brand-muted text-sm mt-3">
            <strong className="text-brand-text">{products.length}</strong>{" "}
            {products.length === 1 ? "produto disponível" : "produtos disponíveis"}
          </p>
        </div>
      </header>

      <section className="content-container pb-16 flex flex-col medium:flex-row gap-6 small:gap-8">
        <CategoryFilters facets={facets} currency={region.currency_code} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-sm text-brand-muted">
              Mostrando produtos compatíveis com seu filtro
            </p>
            <SortDropdown defaultValue={sortBy ?? "created_at"} />
          </div>

          <CategoryProductGrid
            products={products}
            region={region}
            initialSort={sortBy}
          />
        </div>
      </section>
    </>
  )
}

function collectParents(
  category: HttpTypes.StoreProductCategory
): HttpTypes.StoreProductCategory[] {
  const parents: HttpTypes.StoreProductCategory[] = []
  let cur = category.parent_category
  while (cur) {
    parents.unshift(cur)
    cur = cur.parent_category as any
  }
  return parents
}

function computeFacets(products: HttpTypes.StoreProduct[]): FilterFacets {
  const marcasSet = new Set<string>()
  const modelosByMarca: Record<string, Set<string>> = {}
  const anosSet = new Set<number>()
  let priceMin = Number.POSITIVE_INFINITY
  let priceMax = 0

  for (const p of products) {
    const meta = (p.metadata ?? {}) as Record<string, unknown>
    const marcas = toArr(meta.marca_compativel)
    const modelos = toArr(meta.modelo_compativel)
    marcas.forEach((m) => marcasSet.add(m))

    // Cruza marca x modelo: assume mesmo índice quando arrays paralelos,
    // ou se houver só uma marca, atribui todos os modelos a ela.
    if (marcas.length && modelos.length) {
      if (marcas.length === modelos.length) {
        marcas.forEach((m, i) => {
          modelosByMarca[m] = modelosByMarca[m] || new Set()
          modelosByMarca[m].add(modelos[i])
        })
      } else {
        for (const m of marcas) {
          modelosByMarca[m] = modelosByMarca[m] || new Set()
          for (const md of modelos) modelosByMarca[m].add(md)
        }
      }
    }

    const ai = num(meta.ano_inicio)
    const af = num(meta.ano_fim) ?? new Date().getFullYear()
    if (ai) {
      for (let y = ai; y <= af; y++) anosSet.add(y)
    }

    const cheapest = (p.variants as any[] | undefined)?.reduce(
      (acc: number | null, v: any) => {
        const amt = v?.calculated_price?.calculated_amount
        if (amt == null) return acc
        return acc == null ? amt : Math.min(acc, amt)
      },
      null
    )
    if (cheapest != null) {
      priceMin = Math.min(priceMin, cheapest)
      priceMax = Math.max(priceMax, cheapest)
    }
  }

  return {
    marcas: Array.from(marcasSet).sort(),
    modelos: Object.fromEntries(
      Object.entries(modelosByMarca).map(([k, v]) => [k, Array.from(v).sort()])
    ),
    anos: Array.from(anosSet).sort((a, b) => b - a),
    priceMin: priceMin === Number.POSITIVE_INFINITY ? 0 : priceMin,
    priceMax,
  }
}

function toArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String)
  if (typeof v === "string" && v.trim()) {
    try {
      const p = JSON.parse(v)
      if (Array.isArray(p)) return p.map(String)
    } catch {
      return v.split(",").map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = typeof v === "number" ? v : parseInt(String(v), 10)
  return Number.isFinite(n) ? n : null
}
