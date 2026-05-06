import { getPageTemplate } from "@lib/data/page-builder"
import { SECTION_MAP } from "../section-map"

/**
 * Renderiza a home a partir do template configurado no admin DX
 * (via /app/page-builder). Cada section do `template.order` é resolvida
 * em um componente React via `SECTION_MAP`.
 *
 * O endpoint `/store/page-builder/home` já filtra apenas sections
 * `enabled=true` antes de chegar aqui — a gente só itera e renderiza.
 *
 * Se o template falhar ao carregar (backend offline, etc.), o
 * componente fica silenciosamente vazio. O fallback "default builtin"
 * acontece no backend, não aqui.
 */
export default async function DynamicHomepage({
  countryCode,
}: {
  countryCode: string
}) {
  const template = await getPageTemplate("home")
  if (!template) return null

  // Resolve cada section em paralelo (cada uma pode fazer fetch próprio)
  const rendered = await Promise.all(
    template.order.map(async (id) => {
      const section = template.sections[id]
      if (!section) return null
      const renderer = SECTION_MAP[section.type]
      if (!renderer) {
        // Type desconhecido (ex: section antiga removida do código).
        // Ignora silenciosamente em produção; em dev, console.warn ajuda.
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn(
            `[page-builder] Type "${section.type}" não está em SECTION_MAP. Ignorando.`
          )
        }
        return null
      }
      try {
        return await Promise.resolve(renderer(section, { countryCode }))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(
          `[page-builder] Erro renderizando section "${section.id}" (${section.type}):`,
          e
        )
        return null
      }
    })
  )

  return (
    <>
      {rendered.map((node, i) => (
        <div key={template.order[i]}>{node}</div>
      ))}
    </>
  )
}
