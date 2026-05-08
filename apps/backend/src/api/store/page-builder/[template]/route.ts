import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { buildDefaultHomeTemplate } from "../../../../page-builder/default-templates"
import type { PageTemplate } from "../../../../page-builder/types"

const ALLOWED_TEMPLATES = ["home"] as const

/**
 * GET /store/page-builder/:template
 *
 * Endpoint público lido pelo storefront para renderizar a home/template.
 * Retorna o template salvo no `store.metadata`. Fallback: default
 * builtin (replica o layout original hardcoded).
 *
 * Apenas sections com `enabled: true` chegam aqui — o storefront não
 * precisa filtrar.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const tpl = req.params.template
  if (!ALLOWED_TEMPLATES.includes(tpl as (typeof ALLOWED_TEMPLATES)[number])) {
    return res.status(404).json({ error: "template_not_supported" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "metadata"],
  })
  const store = stores[0]

  const meta = (store?.metadata ?? {}) as Record<string, unknown>
  const isDraft = req.query?.draft === "1"
  const draftSaved = isDraft
    ? (meta[`page_template_${tpl}_draft`] as PageTemplate | undefined)
    : undefined
  const liveSaved = meta[`page_template_${tpl}`] as PageTemplate | undefined
  const saved = draftSaved ?? liveSaved

  const template: PageTemplate = saved ?? buildDefaultHomeTemplate()

  // Filtra apenas sections enabled e mantém a ordem
  const enabledSections = Object.fromEntries(
    Object.entries(template.sections).filter(([, sec]) => sec?.enabled !== false)
  )
  const enabledOrder = template.order.filter((id) => enabledSections[id])

  return res.json({
    template: {
      sections: enabledSections,
      order: enabledOrder,
      updated_at: template.updated_at,
    },
  })
}
