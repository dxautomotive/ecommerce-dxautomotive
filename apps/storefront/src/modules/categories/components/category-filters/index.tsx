"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

export type FilterFacets = {
  marcas: string[]
  modelos: Record<string, string[]> // marca → modelos
  anos: number[]
  priceMin: number
  priceMax: number
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const apiHeaders = PUBLISHABLE_KEY
  ? { "x-publishable-api-key": PUBLISHABLE_KEY }
  : undefined

/**
 * Hook que busca marcas/modelos/anos da API real `/store/vehicles`.
 * Quando a API retorna lista vazia (banco sem veículos cadastrados),
 * cai nos facets locais passados como prop pra não deixar o filtro
 * vazio.
 */
function useVehicleFacets(fallback: {
  marcas: string[]
  modelos: Record<string, string[]>
  anos: number[]
}) {
  const [makes, setMakes] = useState<string[]>([])
  const [modelsByMake, setModelsByMake] = useState<Record<string, string[]>>({})
  const [yearsByModel, setYearsByModel] = useState<Record<string, number[]>>({})

  // Carrega marcas no mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/store/vehicles`, { headers: apiHeaders })
      .then((r) => (r.ok ? r.json() : { makes: [] }))
      .then((j) => setMakes(j.makes ?? []))
      .catch(() => setMakes([]))
  }, [])

  const loadModels = useCallback(async (make: string) => {
    if (!make || modelsByMake[make]) return
    try {
      const r = await fetch(
        `${BACKEND_URL}/store/vehicles?make=${encodeURIComponent(make)}`,
        { headers: apiHeaders }
      )
      if (!r.ok) return
      const j = await r.json()
      setModelsByMake((p) => ({ ...p, [make]: j.models ?? [] }))
    } catch {
      // silencia
    }
  }, [modelsByMake])

  const loadYears = useCallback(
    async (make: string, model: string) => {
      const key = `${make}|${model}`
      if (!make || !model || yearsByModel[key]) return
      try {
        const r = await fetch(
          `${BACKEND_URL}/store/vehicles?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
          { headers: apiHeaders }
        )
        if (!r.ok) return
        const j = await r.json()
        setYearsByModel((p) => ({ ...p, [key]: j.years ?? [] }))
      } catch {
        // silencia
      }
    },
    [yearsByModel]
  )

  // Combina API + fallback (API tem prioridade)
  const effectiveMakes = makes.length > 0 ? makes : fallback.marcas
  const effectiveModels = (make: string): string[] => {
    if (makes.length > 0) {
      return modelsByMake[make] ?? []
    }
    return fallback.modelos[make] ?? []
  }
  const effectiveYears = (make: string, model: string): number[] => {
    if (makes.length > 0) {
      return yearsByModel[`${make}|${model}`] ?? []
    }
    return fallback.anos
  }

  return {
    makes: effectiveMakes,
    getModels: effectiveModels,
    getYears: effectiveYears,
    loadModels,
    loadYears,
    usingApi: makes.length > 0,
  }
}

type Props = {
  facets: FilterFacets
  /** valor pre-formatado em moeda local pra exibir no header */
  currency: string
}

/**
 * Sidebar de filtros estilo DX/Vision para a página de coleção/categoria.
 *  - Marca → Modelo (cascade): selecionar marca filtra os modelos exibidos
 *  - Ano (range com 2 dropdowns: de / até)
 *  - Faixa de preço (min/max)
 *  - Botão "Limpar filtros"
 *
 * Estado vive na URL (?marca=...&modelo=...&anoIni=...&anoFim=...&priceMin=...&priceMax=...)
 * pra ser compartilhável e SEO-friendly. O grid lê os mesmos params e filtra.
 */
export default function CategoryFilters({ facets, currency }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [open, setOpen] = useState(false) // mobile: drawer

  const current = useMemo(
    () => ({
      marca: params.get("marca") ?? "",
      modelo: params.get("modelo") ?? "",
      anoIni: params.get("anoIni") ?? "",
      anoFim: params.get("anoFim") ?? "",
      priceMin: params.get("priceMin") ?? "",
      priceMax: params.get("priceMax") ?? "",
    }),
    [params]
  )

  const setParam = useCallback(
    (patch: Record<string, string | null | undefined>) => {
      const sp = new URLSearchParams(params.toString())
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") sp.delete(k)
        else sp.set(k, v)
      }
      // ao mudar marca, sempre limpa modelo
      if ("marca" in patch) sp.delete("modelo")
      router.push(`${pathname}?${sp.toString()}`, { scroll: false })
    },
    [params, pathname, router]
  )

  const clearAll = () => router.push(pathname, { scroll: false })
  const hasFilters = Object.values(current).some(Boolean)

  const vehicles = useVehicleFacets({
    marcas: facets.marcas,
    modelos: facets.modelos,
    anos: facets.anos,
  })

  // Quando troca de marca, carrega modelos da API
  useEffect(() => {
    if (current.marca) vehicles.loadModels(current.marca)
  }, [current.marca, vehicles])

  // Quando troca de modelo, carrega anos da API
  useEffect(() => {
    if (current.marca && current.modelo) {
      vehicles.loadYears(current.marca, current.modelo)
    }
  }, [current.marca, current.modelo, vehicles])

  const modelosForMarca = current.marca
    ? vehicles.getModels(current.marca)
    : Object.values(facets.modelos).flat()

  const anosForModelo =
    current.marca && current.modelo
      ? vehicles.getYears(current.marca, current.modelo)
      : facets.anos

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(n)

  const FilterContent = (
    <div className="flex flex-col gap-5">
      <FilterSection title="Veículo">
        <div className="flex flex-col gap-2">
          <Label>Marca</Label>
          <Select
            value={current.marca}
            onChange={(v) => setParam({ marca: v })}
            placeholder="Todas as marcas"
            options={[
              { label: "Todas", value: "" },
              ...vehicles.makes.map((m) => ({ label: m, value: m })),
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Modelo</Label>
          <Select
            value={current.modelo}
            onChange={(v) => setParam({ modelo: v })}
            placeholder={current.marca ? "Todos os modelos" : "Selecione a marca primeiro"}
            disabled={!current.marca && Object.keys(facets.modelos).length > 1}
            options={[
              { label: "Todos", value: "" },
              ...modelosForMarca.map((m) => ({ label: m, value: m })),
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            <Label>Ano (de)</Label>
            <Select
              value={current.anoIni}
              onChange={(v) => setParam({ anoIni: v })}
              placeholder="—"
              options={[
                { label: "—", value: "" },
                ...anosForModelo.map((y) => ({ label: String(y), value: String(y) })),
              ]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Ano (até)</Label>
            <Select
              value={current.anoFim}
              onChange={(v) => setParam({ anoFim: v })}
              placeholder="—"
              options={[
                { label: "—", value: "" },
                ...anosForModelo.map((y) => ({ label: String(y), value: String(y) })),
              ]}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Preço">
        <div className="flex items-center gap-2">
          <NumInput
            placeholder={`mín · ${fmt(facets.priceMin)}`}
            value={current.priceMin}
            onChange={(v) => setParam({ priceMin: v })}
          />
          <span className="text-brand-muted">—</span>
          <NumInput
            placeholder={`máx · ${fmt(facets.priceMax)}`}
            value={current.priceMax}
            onChange={(v) => setParam({ priceMax: v })}
          />
        </div>
        <p className="text-xs text-brand-muted">Em reais (R$).</p>
      </FilterSection>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="self-start text-sm text-brand-primary hover:text-brand-primary-hover font-semibold underline-offset-4 hover:underline"
        >
          Limpar todos os filtros
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Botão para abrir drawer em mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="medium:hidden flex items-center gap-2 bg-brand-surface border border-brand-border text-brand-text px-4 py-2 rounded text-sm font-semibold hover:border-brand-primary transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        Filtros
        {hasFilters && (
          <span className="bg-brand-primary text-white text-xs px-1.5 rounded-full">
            ●
          </span>
        )}
      </button>

      {/* Sidebar desktop */}
      <aside className="hidden medium:block w-64 flex-shrink-0">
        <div className="sticky top-32 bg-brand-surface border border-brand-border rounded-lg p-5">
          <h2 className="text-brand-text font-bold text-base mb-4">Filtrar</h2>
          {FilterContent}
        </div>
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex medium:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="ml-auto w-[85%] max-w-sm h-full bg-brand-surface border-l border-brand-border p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-brand-text font-bold text-base">Filtrar</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar filtros"
                className="text-brand-muted hover:text-brand-text"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {FilterContent}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-3 rounded transition-colors"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 border-b border-brand-border pb-5 last:border-0 last:pb-0">
      <h3 className="text-brand-text text-sm font-bold uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-brand-muted text-xs uppercase tracking-wider">
      {children}
    </span>
  )
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed text-brand-text text-sm rounded px-3 py-2 outline-none transition-colors"
    >
      {placeholder && !options.some((o) => o.value === value) && (
        <option value="">{placeholder}</option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function NumInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-brand-bg border border-brand-border focus:border-brand-primary text-brand-text text-sm rounded px-3 py-2 outline-none transition-colors"
    />
  )
}
