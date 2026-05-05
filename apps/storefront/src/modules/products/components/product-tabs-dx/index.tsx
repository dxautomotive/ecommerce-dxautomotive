"use client"

import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

type Tab = "descricao" | "especificacoes" | "compatibilidade" | "avaliacoes"

type Metadata = {
  marca_compativel?: unknown
  modelo_compativel?: unknown
  ano_inicio?: unknown
  ano_fim?: unknown
  peso_gramas?: unknown
  dimensoes_cm?: unknown
  video_youtube_id?: unknown
  compatibilidade?: unknown
} & Record<string, unknown>

type Props = {
  product: HttpTypes.StoreProduct
}

/**
 * Abas de informação do produto.
 * - Descrição: usa product.description (text)
 * - Especificações: lê metadata + product.weight/length/etc.
 * - Compatibilidade: lista veículos compatíveis (do metadata)
 * - Avaliações: placeholder até integrarmos provedor
 */
export default function ProductTabsDX({ product }: Props) {
  const [tab, setTab] = useState<Tab>("descricao")
  const meta = (product.metadata ?? {}) as Metadata

  const tabs = [
    { id: "descricao" as const, label: "Descrição" },
    { id: "especificacoes" as const, label: "Especificações" },
    { id: "compatibilidade" as const, label: "Compatibilidade" },
    { id: "avaliacoes" as const, label: "Avaliações" },
  ]

  return (
    <div className="bg-brand-surface border border-brand-border rounded-lg overflow-hidden">
      <div role="tablist" aria-label="Informações do produto" className="flex flex-wrap border-b border-brand-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            id={`tab-${t.id}`}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "text-brand-primary border-b-2 border-brand-primary"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "descricao" && (
          <div id="panel-descricao" role="tabpanel" aria-labelledby="tab-descricao">
            {product.description ? (
              <div className="prose prose-invert max-w-none text-brand-muted leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            ) : (
              <p className="text-brand-muted text-sm">
                Descrição em breve.
              </p>
            )}
            {typeof meta.video_youtube_id === "string" && meta.video_youtube_id && (
              <div className="mt-6">
                <p className="text-brand-text font-semibold mb-2">Vídeo demonstrativo</p>
                <div className="aspect-video rounded overflow-hidden border border-brand-border">
                  <iframe
                    src={`https://www.youtube.com/embed/${meta.video_youtube_id}`}
                    title="Vídeo do produto"
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "especificacoes" && (
          <div id="panel-especificacoes" role="tabpanel" aria-labelledby="tab-especificacoes">
            <SpecsTable product={product} meta={meta} />
          </div>
        )}

        {tab === "compatibilidade" && (
          <div id="panel-compatibilidade" role="tabpanel" aria-labelledby="tab-compatibilidade">
            <CompatibilityList meta={meta} />
          </div>
        )}

        {tab === "avaliacoes" && (
          <div
            id="panel-avaliacoes"
            role="tabpanel"
            aria-labelledby="tab-avaliacoes"
            className="text-brand-muted text-sm"
          >
            <p>
              As avaliações deste produto vão aparecer aqui assim que clientes
              começarem a comentar.
            </p>
            <p className="mt-2 text-xs">
              (Integração com Trustvox prevista para sessão futura.)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SpecsTable({
  product,
  meta,
}: {
  product: HttpTypes.StoreProduct
  meta: Metadata
}) {
  const rows: { label: string; value: string }[] = []

  const sku = product.variants?.[0]?.sku
  if (sku) rows.push({ label: "SKU", value: sku })

  if (meta.peso_gramas) {
    const g = Number(meta.peso_gramas)
    if (Number.isFinite(g) && g > 0) {
      rows.push({
        label: "Peso",
        value: g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`,
      })
    }
  }

  if (typeof meta.dimensoes_cm === "string" && meta.dimensoes_cm) {
    rows.push({ label: "Dimensões", value: `${meta.dimensoes_cm} cm` })
  }

  if (product.material) rows.push({ label: "Material", value: product.material })
  if (product.origin_country) {
    rows.push({ label: "País de origem", value: product.origin_country })
  }

  // Atributos de variante (se existirem)
  product.options?.forEach((opt) => {
    const values = opt.values?.map((v) => v.value).filter(Boolean).join(", ")
    if (opt.title && values) rows.push({ label: opt.title, value: values })
  })

  if (!rows.length) {
    return (
      <p className="text-brand-muted text-sm">
        Especificações técnicas em breve.
      </p>
    )
  }

  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-b border-brand-border/40 last:border-0">
            <th
              scope="row"
              className="text-left py-2 pr-6 text-brand-muted font-medium align-top"
            >
              {r.label}
            </th>
            <td className="py-2 text-brand-text">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CompatibilityList({ meta }: { meta: Metadata }) {
  const compat = parseList(meta)
  if (!compat.length) {
    return (
      <p className="text-brand-muted text-sm">
        Compatibilidade não cadastrada para este produto. Em caso de dúvida,
        fale com o vendedor pelo WhatsApp.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-brand-text font-semibold text-sm mb-1">
        Veículos compatíveis:
      </p>
      <ul className="grid grid-cols-1 small:grid-cols-2 gap-2">
        {compat.map((c, i) => (
          <li
            key={i}
            className="bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text"
          >
            <strong>{c.marca}</strong> {c.modelo}{" "}
            <span className="text-brand-muted">{c.years}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function parseList(meta: Metadata): { marca: string; modelo: string; years: string }[] {
  const out: { marca: string; modelo: string; years: string }[] = []
  if (Array.isArray(meta.compatibilidade)) {
    for (const c of meta.compatibilidade as Record<string, unknown>[]) {
      const ai = num(c.ano_inicio)
      const af = num(c.ano_fim)
      out.push({
        marca: String(c.marca ?? "Veículo"),
        modelo: String(c.modelo ?? ""),
        years: ai && af ? `${ai}–${af}` : ai ? `${ai}+` : "",
      })
    }
    if (out.length) return out
  }
  const marcas = toArr(meta.marca_compativel)
  const modelos = toArr(meta.modelo_compativel)
  const ai = num(meta.ano_inicio)
  const af = num(meta.ano_fim)
  const years = ai && af ? `${ai}–${af}` : ai ? `${ai}+` : ""
  const max = Math.max(marcas.length, modelos.length)
  for (let i = 0; i < max; i++) {
    out.push({
      marca: marcas[i] ?? marcas[0] ?? "Veículo",
      modelo: modelos[i] ?? modelos[0] ?? "",
      years,
    })
  }
  return out
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
