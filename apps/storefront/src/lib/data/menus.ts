"use server"

import { sdk } from "@lib/config"

export type StoreMenuItem = {
  id: string
  label: string
  type:
    | "link"
    | "external"
    | "home"
    | "search"
    | "catalog"
    | "category"
    | "collection"
    | "product"
    | "policy"
  href: string
  target_id: string | null
  target_url: string | null
  open_in_new_tab: boolean
  position: number
  children: StoreMenuItem[]
}

export type StoreMenu = {
  id: string
  handle: string
  label: string
  items: StoreMenuItem[]
}

/**
 * Busca um menu por handle via `/store/menus/:handle`.
 *
 * Retorna null se o menu não existir — o consumidor decide o fallback (ex.:
 * lista hardcoded). URLs já vêm resolvidas (categoria/coleção → /handle).
 *
 * Cache: `revalidate: 30s`. Edições admin refletem rápido sem webhook;
 * subimos depois quando tivermos tráfego real.
 */
export const getMenu = async (handle: string): Promise<StoreMenu | null> => {
  try {
    const { menu } = await sdk.client.fetch<{ menu: StoreMenu }>(
      `/store/menus/${handle}`,
      { next: { revalidate: 30, tags: [`menu:${handle}`] } }
    )
    return menu ?? null
  } catch {
    // Backend offline, módulo não carregado ou menu inexistente —
    // o consumidor cai no fallback hardcoded.
    return null
  }
}
