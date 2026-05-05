"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCardDX from "@modules/products/components/product-card-dx"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  initialSort?: SortOptions
  itemsPerPage?: number
}

/**
 * Grid de produtos com filtragem client-side a partir dos search params da URL.
 * Lê:
 *   ?marca=Toyota&modelo=Corolla&anoIni=2018&anoFim=2022
 *   ?priceMin=500&priceMax=2500
 *   ?sortBy=price_asc|price_desc|created_at
 *   ?page=2
 *
 * Pequeno catálogo (até ~200 produtos) cabe bem em filtragem client-side.
 * Quando crescer, migrar para Algolia/MeiliSearch ou search nativo do Medusa.
 */
export default function CategoryProductGrid({
  products,
  region,
  initialSort = "created_at",
  itemsPerPage = 12,
}: Props) {
  const params = useSearchParams()
  const [page, setPage] = useState(() => Number(params.get("page") || 1))

  const filtered = useMemo(() => {
    const marca = (params.get("marca") || "").trim().toLowerCase()
    const modelo = (params.get("modelo") || "").trim().toLowerCase()
    const anoIni = Number(params.get("anoIni") || 0)
    const anoFim = Number(params.get("anoFim") || 0)
    const priceMin = Number(params.get("priceMin") || 0)
    const priceMax = Number(params.get("priceMax") || 0)

    return products.filter((p) => {
      const meta = (p.metadata ?? {}) as Record<string, unknown>
      const marcas = toArr(meta.marca_compativel).map((s) => s.toLowerCase())
      const modelos = toArr(meta.modelo_compativel).map((s) => s.toLowerCase())
      const ai = num(meta.ano_inicio)
      const af = num(meta.ano_fim) ?? new Date().getFullYear()

      // Marca
      if (marca && marcas.length && !marcas.includes(marca)) return false
      // Modelo
      if (modelo && modelos.length && !modelos.includes(modelo)) return false
      // Ano (intervalo do produto deve sobrepor o intervalo solicitado)
      if (anoIni && ai && af && af < anoIni) return false
      if (anoFim && ai && ai > anoFim) return false
      // Preço (usa cheapest variant)
      const cheapest = (p.variants as any[] | undefined)?.reduce(
        (acc: number | null, v: any) => {
          const amt = v?.calculated_price?.calculated_amount
          if (amt == null) return acc
          return acc == null ? amt : Math.min(acc, amt)
        },
        null
      )
      if (priceMin && cheapest != null && cheapest < priceMin) return false
      if (priceMax && cheapest != null && cheapest > priceMax) return false

      return true
    })
  }, [products, params])

  const sortBy = (params.get("sortBy") as SortOptions) || initialSort
  const sorted = useMemo(() => {
    const arr = [...filtered]
    const cheapestOf = (p: HttpTypes.StoreProduct) => {
      const v = (p.variants as any[] | undefined)?.reduce(
        (acc: number | null, v: any) => {
          const amt = v?.calculated_price?.calculated_amount
          if (amt == null) return acc
          return acc == null ? amt : Math.min(acc, amt)
        },
        null
      )
      return v ?? Number.POSITIVE_INFINITY
    }
    if (sortBy === "price_asc") arr.sort((a, b) => cheapestOf(a) - cheapestOf(b))
    else if (sortBy === "price_desc") arr.sort((a, b) => cheapestOf(b) - cheapestOf(a))
    else
      arr.sort((a, b) => {
        const ad = new Date(a.created_at ?? 0).getTime()
        const bd = new Date(b.created_at ?? 0).getTime()
        return bd - ad
      })
    return arr
  }, [filtered, sortBy])

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage))
  const safePage = Math.min(page, totalPages)
  const slice = sorted.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage)

  if (!sorted.length) {
    return (
      <div className="bg-brand-surface border border-brand-border rounded-lg p-8 text-center">
        <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
        <h3 className="text-brand-text text-lg font-semibold mb-1">
          Nenhum produto encontrado
        </h3>
        <p className="text-brand-muted text-sm mb-4">
          Tente ajustar os filtros ou explorar outras categorias.
        </p>
        <LocalizedClientLink
          href="/store"
          className="inline-block bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold px-4 py-2 rounded transition-colors"
        >
          Ver todos os produtos
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-brand-muted">
        <span>
          {sorted.length} {sorted.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </span>
        <span>
          Página {safePage} de {totalPages}
        </span>
      </div>

      <div className="grid grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-3 small:gap-5">
        {slice.map((p) => (
          <ProductCardDX key={p.id} product={p} region={region} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            className="px-3 py-1.5 text-sm rounded border border-brand-border text-brand-text disabled:opacity-40 hover:border-brand-primary transition-colors"
          >
            ← Anterior
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === safePage}
                className={`w-9 h-9 text-sm rounded transition-colors ${
                  n === safePage
                    ? "bg-brand-primary text-white font-semibold"
                    : "border border-brand-border text-brand-text hover:border-brand-primary"
                }`}
              >
                {n}
              </button>
            )
          })}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
            className="px-3 py-1.5 text-sm rounded border border-brand-border text-brand-text disabled:opacity-40 hover:border-brand-primary transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
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
