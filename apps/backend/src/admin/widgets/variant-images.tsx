import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

type ProductImage = {
  id: string
  url: string
}

type Variant = {
  id: string
  title: string | null
  sku: string | null
  metadata: Record<string, unknown> | null
}

type Product = {
  id: string
  images?: ProductImage[]
  variants?: Variant[]
}

/**
 * VariantImagesPicker — feature Shopify-style: associar 1 imagem do produto
 * a cada variante.
 *
 * Por que: a drawer "Editar variante" do Medusa v2 nativo não tem campo de
 * imagem. Precisamos curar qual imagem aparece na galeria quando o cliente
 * seleciona aquela variante na PDP (ex.: variante preta mostra foto preta).
 *
 * Onde salvamos: `variant.metadata.image_id` (jsonb da variante).
 *  - Não precisa migration nova.
 *  - Storefront `<ProductGalleryDX>` lê `selectedVariant.metadata.image_id`
 *    e ativa a imagem correspondente quando o cliente troca a opção.
 *
 * UI:
 *  - Lista cada variante numa linha
 *  - Em cada linha: row de thumbnails das imagens do produto (clique = associa)
 *  - "Sem imagem" desmarcado no início; click numa thumb seleciona; click na
 *    mesma thumb seleciona/deseleciona
 */
const VariantImagesPicker = ({ data }: DetailWidgetProps<Product>) => {
  const productId = data.id
  const [variants, setVariants] = useState<Variant[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch(
      `/admin/products/${productId}?fields=id,images.id,images.url,variants.id,variants.title,variants.sku,variants.metadata`,
      { credentials: "include" }
    )
    if (res.ok) {
      const d = await res.json()
      setImages(d.product?.images ?? [])
      setVariants(d.product?.variants ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const setVariantImage = async (variantId: string, imageId: string | null) => {
    setSavingId(variantId)
    try {
      const v = variants.find((x) => x.id === variantId)
      const meta = { ...(v?.metadata ?? {}), image_id: imageId }
      // Se está desmarcando (imageId=null), remove a chave em vez de salvar null
      if (imageId === null) delete (meta as Record<string, unknown>).image_id

      const res = await fetch(
        `/admin/products/${productId}/variants/${variantId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: meta }),
        }
      )
      if (res.ok) {
        setVariants((prev) =>
          prev.map((x) =>
            x.id === variantId ? { ...x, metadata: meta } : x
          )
        )
      }
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <Container className="p-6">
        <div className="text-ui-fg-subtle text-sm">Carregando…</div>
      </Container>
    )
  }

  // Não renderiza se o produto não tem imagens nem variantes
  if (variants.length === 0 || images.length === 0) {
    return (
      <Container className="p-6">
        <Heading level="h2">Imagem por variante</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          {images.length === 0
            ? "Adicione imagens em Mídia para associá-las a variantes específicas."
            : "Este produto não tem variantes pra associar imagens."}
        </Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <Heading level="h2">Imagem por variante</Heading>
      <Text size="small" className="text-ui-fg-subtle mt-1 max-w-2xl">
        Selecione qual imagem aparece em destaque na PDP quando o cliente
        escolher cada variante. Clique numa miniatura pra associar à variante;
        clique de novo na mesma miniatura pra desassociar.
      </Text>

      <div className="flex flex-col gap-4 mt-5">
        {variants.map((v) => {
          const meta = (v.metadata ?? {}) as { image_id?: string }
          const selectedImageId = meta.image_id ?? null
          const isSaving = savingId === v.id
          return (
            <div
              key={v.id}
              className="border border-ui-border-base rounded-lg p-3 bg-ui-bg-base"
            >
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="font-semibold text-sm">
                  {v.title ?? v.id}
                </span>
                {v.sku && (
                  <span className="text-xs text-ui-fg-subtle font-mono">
                    {v.sku}
                  </span>
                )}
                {isSaving && (
                  <span className="text-xs text-ui-fg-muted ml-auto">
                    Salvando…
                  </span>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {images.map((img) => {
                  const isSelected = img.id === selectedImageId
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() =>
                        setVariantImage(v.id, isSelected ? null : img.id)
                      }
                      disabled={isSaving}
                      aria-pressed={isSelected}
                      title={
                        isSelected
                          ? "Clique pra desassociar"
                          : "Clique pra associar à variante"
                      }
                      className={`relative w-16 h-16 rounded-md overflow-hidden border-2 bg-ui-bg-subtle transition-all disabled:opacity-50 ${
                        isSelected
                          ? "border-ui-tag-blue-text shadow-md"
                          : "border-ui-border-base hover:border-ui-border-strong"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-ui-tag-blue-text text-white flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default VariantImagesPicker
