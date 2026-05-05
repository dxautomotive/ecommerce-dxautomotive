import { headers } from "next/headers"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

type Vehicle = {
  id: string
  make: string
  model: string
  year: number
  trim: string | null
  body_type: string | null
  slug: string
}

type Props = {
  productId: string
}

/**
 * Bloco "Veículos compatíveis" da página de produto.
 *
 * Server component que busca em `/store/products/:id/vehicles` e
 * renderiza a lista agrupada por marca. Se não houver veículos
 * cadastrados, retorna null (não renderiza nada — não faz sentido
 * mostrar um card vazio).
 */
export default async function VehicleCompatibility({ productId }: Props) {
  // headers() para ativar dynamic rendering
  await headers()

  let vehicles: Vehicle[] = []
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/products/${productId}/vehicles`,
      {
        headers: PUBLISHABLE_KEY
          ? { "x-publishable-api-key": PUBLISHABLE_KEY }
          : undefined,
        next: { revalidate: 300 },
      }
    )
    if (res.ok) {
      const j = await res.json()
      vehicles = j.vehicles ?? []
    }
  } catch {
    // silently ignore — bloco apenas não aparece se backend offline
  }

  if (vehicles.length === 0) return null

  // Agrupar por marca
  const byMake = vehicles.reduce<Record<string, Vehicle[]>>((acc, v) => {
    if (!acc[v.make]) acc[v.make] = []
    acc[v.make].push(v)
    return acc
  }, {})
  const makes = Object.keys(byMake).sort()

  return (
    <section className="bg-brand-surface border border-brand-border rounded-xl p-5 small:p-6">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-brand-primary text-[10px] uppercase tracking-[0.2em] font-bold block">
            Compatibilidade confirmada
          </span>
          <h2 className="text-lg small:text-xl font-extrabold text-brand-text mt-1">
            Veículos compatíveis
          </h2>
          <p className="text-sm text-brand-muted mt-1">
            Este produto foi homologado para os {vehicles.length}{" "}
            {vehicles.length === 1 ? "veículo" : "veículos"} abaixo. Não
            achou o seu? Fale com a gente pelo WhatsApp.
          </p>
        </div>
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-success/10 text-brand-success flex-shrink-0">
          <CheckIcon />
        </span>
      </header>

      <div className="flex flex-col gap-4">
        {makes.map((make) => (
          <div key={make}>
            <h3 className="text-brand-text font-bold text-sm uppercase tracking-wider mb-2">
              {make}
            </h3>
            <div className="flex flex-wrap gap-2">
              {byMake[make].map((v) => (
                <span
                  key={v.id}
                  className="inline-flex items-center gap-1.5 bg-brand-bg border border-brand-border rounded px-3 py-1.5 text-sm text-brand-text"
                >
                  <span className="font-semibold">{v.model}</span>
                  <span className="text-brand-muted">{v.year}</span>
                  {v.trim && (
                    <span className="text-xs text-brand-muted">
                      · {v.trim}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
