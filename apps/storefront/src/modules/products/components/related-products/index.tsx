import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductCardDX from "@modules/products/components/product-card-dx"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * Busca os ids dos produtos relacionados curados manualmente pelo admin
 * via `GET /store/products/:id/relationships?type=related`. Retorna na ordem
 * definida pelo admin (por position).
 */
async function fetchManualRelatedIds(productId: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/products/${productId}/relationships?type=related`,
      {
        headers: PUBLISHABLE_KEY
          ? { "x-publishable-api-key": PUBLISHABLE_KEY }
          : undefined,
        cache: "no-store",
      }
    )
    if (!res.ok) return []
    const data = (await res.json()) as { products?: Array<{ id?: string }> }
    return (data.products ?? [])
      .map((p) => p?.id)
      .filter((s): s is string => typeof s === "string")
  } catch {
    return []
  }
}

/**
 * RelatedProducts v2.1 — agora respeita curadoria manual do admin (módulo
 * `product_relationships`). Pegamos só os IDs ordenados via endpoint custom
 * e re-buscamos via `listProducts` do SDK pra obter o formato canônico
 * (`calculated_price.price_list_type` etc) que `<ProductCardDX>` espera.
 *
 * Se o admin não selecionou nada, fallback automático pela coleção/tags.
 */
export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)
  if (!region) return null

  // 1) Tenta curadoria manual primeiro
  const manualIds = await fetchManualRelatedIds(product.id)
  let products: HttpTypes.StoreProduct[] = []

  if (manualIds.length > 0) {
    const manual = await listProducts({
      queryParams: { id: manualIds, region_id: region.id, is_giftcard: false },
      countryCode,
    }).then(({ response }) => response.products)

    // Preserva a ordem definida pelo admin
    const byId = new Map(manual.map((p) => [p.id, p]))
    products = manualIds.map((id) => byId.get(id)).filter(Boolean) as HttpTypes.StoreProduct[]
  }

  // 2) Fallback automático se não houver curadoria
  if (products.length === 0) {
    const queryParams: HttpTypes.StoreProductListParams = {
      region_id: region.id,
      is_giftcard: false,
    }
    if (product.collection_id) queryParams.collection_id = [product.collection_id]
    if (product.tags) {
      const tagIds = product.tags.map((t) => t.id).filter(Boolean) as string[]
      if (tagIds.length > 0) queryParams.tag_id = tagIds
    }

    const auto = await listProducts({ queryParams, countryCode }).then(
      ({ response }) =>
        response.products.filter((p) => p.id !== product.id).slice(0, 8)
    )
    products = auto
  }

  if (!products.length) return null

  return (
    <div>
      <h2 className="text-[20px] small:text-[24px] font-extrabold text-brand-text mb-5">
        Produtos relacionados
      </h2>
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-3 small:gap-4">
        {products.slice(0, 8).map((p) => (
          <li key={p.id}>
            <ProductCardDX product={p} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
