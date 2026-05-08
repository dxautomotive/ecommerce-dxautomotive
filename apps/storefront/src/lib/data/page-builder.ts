"use server"

import { sdk } from "@lib/config"
import type { PageTemplate } from "@modules/page-builder/types"

/**
 * Busca o template de uma página configurado no admin DX.
 *
 * O endpoint `/store/page-builder/<template>` filtra apenas sections
 * com `enabled: true` antes de retornar — o storefront renderiza
 * direto, sem precisar filtrar.
 *
 * Cache: `revalidate: 10s` em vez de `force-cache` para que edições
 * no admin reflitam rápido sem precisar de webhook de revalidação.
 * Em produção (com tráfego real) podemos subir pra 60s + invalidação
 * por webhook quando o lojista clicar Salvar.
 *
 * Se nada estiver salvo no admin ainda, o backend retorna o default
 * builtin (replica o layout original hardcoded da home).
 */
export const getPageTemplate = async (
  templateName: "home",
  opts?: { draft?: boolean }
): Promise<PageTemplate | null> => {
  const qs = opts?.draft ? "?draft=1" : ""
  const fetchOpts = opts?.draft
    ? { cache: "no-store" as const }
    : { next: { revalidate: 10, tags: ["page-templates"] } }
  return await sdk.client
    .fetch<{ template: PageTemplate }>(
      `/store/page-builder/${templateName}${qs}`,
      fetchOpts
    )
    .then(({ template }) => template ?? null)
    .catch(() => null)
}
