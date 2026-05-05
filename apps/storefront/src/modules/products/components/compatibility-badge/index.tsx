type CompatibilityEntry = {
  marca?: string
  modelo?: string
  ano_inicio?: number | string
  ano_fim?: number | string | null
}

type Metadata = {
  marca_compativel?: string[] | string
  modelo_compativel?: string[] | string
  ano_inicio?: number | string
  ano_fim?: number | string | null
  compatibilidade?: CompatibilityEntry[]
} & Record<string, unknown>

type Props = {
  metadata?: Metadata | null
}

/**
 * Badge de compatibilidade veicular que lê os campos do metadata do produto:
 *   marca_compativel, modelo_compativel, ano_inicio, ano_fim
 *   (ou compatibilidade[] com objetos {marca, modelo, ano_inicio, ano_fim})
 *
 * Renderiza uma "tag" verde resumindo "Compatível com Toyota Corolla 2018-2022".
 * Some quando o produto não tem metadata de compatibilidade.
 */
export default function CompatibilityBadge({ metadata }: Props) {
  const items = parseCompatibility(metadata)
  if (!items.length) return null

  return (
    <div className="bg-brand-success/10 border border-brand-success/30 rounded-lg p-4 flex items-start gap-3">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00C851"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="mt-0.5 flex-shrink-0"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      <div className="flex flex-col gap-1.5 min-w-0">
        <p className="text-brand-success font-semibold text-sm">
          Compatibilidade verificada
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <li
              key={i}
              className="bg-brand-bg border border-brand-border text-brand-text text-xs px-2.5 py-1 rounded font-medium"
            >
              {formatEntry(it)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function parseCompatibility(meta?: Metadata | null): CompatibilityEntry[] {
  if (!meta) return []
  // 1) Estrutura completa em meta.compatibilidade[]
  if (Array.isArray(meta.compatibilidade) && meta.compatibilidade.length) {
    return meta.compatibilidade as CompatibilityEntry[]
  }

  // 2) Campos planos: cruza marcas x modelos com mesmo ano
  const marcas = toArr(meta.marca_compativel)
  const modelos = toArr(meta.modelo_compativel)
  const anoIni = num(meta.ano_inicio)
  const anoFim = num(meta.ano_fim)

  if (!marcas.length && !modelos.length) return []

  const out: CompatibilityEntry[] = []
  // Cartesiano simples (em geral é 1:1)
  const max = Math.max(marcas.length, modelos.length, 1)
  for (let i = 0; i < max; i++) {
    out.push({
      marca: marcas[i] ?? marcas[0],
      modelo: modelos[i] ?? modelos[0],
      ano_inicio: anoIni ?? undefined,
      ano_fim: anoFim ?? undefined,
    })
  }
  return out
}

function toArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String)
  if (typeof v === "string" && v.trim()) {
    try {
      const parsed = JSON.parse(v)
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String)
    } catch {
      // string CSV
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

function formatEntry(it: CompatibilityEntry): string {
  const parts: string[] = []
  if (it.marca) parts.push(String(it.marca))
  if (it.modelo) parts.push(String(it.modelo))
  let s = parts.join(" ") || "Veículo compatível"
  const ini = num(it.ano_inicio)
  const fim = num(it.ano_fim)
  if (ini && fim) s += ` ${ini}–${fim}`
  else if (ini) s += ` ${ini}+`
  return s
}
