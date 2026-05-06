import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ProductCardDX from "@modules/products/components/product-card-dx"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

/**
 * RelatedProducts — produtos da mesma coleção (e tags) do produto atual.
 *
 * **Decisão de produto:** abandonamos a curadoria manual (que existia em
 * `product_relationships` com `relationship_type='related'`). Para catálogos
 * que crescem além de algumas dezenas de SKUs, escolher manualmente quais
 * produtos aparecem em cada PDP é inviável. A coleção/tags já carrega essa
 * semântica de "produtos similares".
 *
 * Curadoria manual continua disponível só pra **bundle "Compre junto"**, que
 * tem natureza diferente (combo intencional pequeno, máx 3 produtos).
 *
 * Ordem de fallback:
 *  1. Mesma coleção (collection_id)
 *  2. Mesmas tags (tag_id) se a coleção retornar pouco
 *  3. Nada — não renderiza
 */
export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)
  if (!region) return null

  const queryParams: HttpTypes.StoreProductListParams = {
    region_id: region.id,
    is_giftcard: false,
  }
  if (product.collection_id) queryParams.collection_id = [product.collection_id]
  if (product.tags) {
    const tagIds = product.tags.map((t) => t.id).filter(Boolean) as string[]
    if (tagIds.length > 0) queryParams.tag_id = tagIds
  }

  const products = await listProducts({ queryParams, countryCode }).then(
    ({ response }) =>
      response.products.filter((p) => p.id !== product.id).slice(0, 8)
  )

  if (!products.length) return null

  return (
    <div>
      <h2 className="text-[20px] small:text-[24px] font-extrabold text-brand-text mb-5">
        Produtos relacionados
      </h2>
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-3 small:gap-4">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCardDX product={p} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
