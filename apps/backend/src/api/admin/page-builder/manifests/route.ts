import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SECTION_MANIFESTS } from "../../../../page-builder/manifests"

/**
 * GET /admin/page-builder/manifests
 *
 * Retorna o catálogo de tipos de section disponíveis para instanciar
 * em qualquer template. O admin usa essa lista pra:
 *   - dropdown "Adicionar bloco"
 *   - gerar o form de settings de cada section
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  return res.json({ manifests: SECTION_MANIFESTS })
}
