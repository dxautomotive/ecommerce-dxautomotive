import type { PageTemplate } from "@modules/page-builder/types"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * Busca o rascunho do template diretamente via fetch — sem SDK, sem "use server".
 *
 * Precisa ser um módulo normal (não server action) para o cache: 'no-store'
 * funcionar corretamente no contexto do preview page do editor visual.
 */
export async function getPageTemplateDraft(
  templateName: "home"
): Promise<PageTemplate | null> {
  return await fetch(
    `${BACKEND_URL}/store/page-builder/${templateName}?draft=1`,
    {
      headers: { "x-publishable-api-key": PUB_KEY },
      cache: "no-store",
    }
  )
    .then((r) => (r.ok ? r.json() : null))
    .then((j: { template?: PageTemplate } | null) => j?.template ?? null)
    .catch(() => null)
}
