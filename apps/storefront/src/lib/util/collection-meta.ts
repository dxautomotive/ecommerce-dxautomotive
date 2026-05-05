import { HttpTypes } from "@medusajs/types"

/**
 * Schema do `metadata` (jsonb) do `product_collection` do Medusa,
 * editado pelo widget admin DX e consumido pelo storefront.
 *
 * Mantido em util (sync) separado dos data fetchers (que são
 * "use server" async).
 */
export type DXCollectionMeta = {
  subtitle?: string
  image_url?: string
  gradient_from?: string
  gradient_to?: string
  gradient_deg?: number
  cta_label?: string
  cta_url?: string
  layout?: "vertical" | "horizontal"
  is_featured?: boolean
  display_order?: number
}

export const getDXMeta = (
  c: HttpTypes.StoreCollection | null | undefined
): DXCollectionMeta => {
  return ((c?.metadata ?? {}) as DXCollectionMeta) ?? {}
}
