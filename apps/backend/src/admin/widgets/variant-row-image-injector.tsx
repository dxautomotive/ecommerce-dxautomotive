import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { useEffect, useRef, useState } from "react"

type ProductImage = { id: string; url: string }
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
 * VariantRowImageInjector — modifica a tabela nativa de variantes pra ter
 * UX estilo Shopify (sem visual próprio):
 *
 *  1. **Click na linha** (em qualquer lugar exceto o "..." no canto direito)
 *     fica **silenciado** — não abre mais a drawer "Editar variante" nativa.
 *  2. **Click no ícone-placeholder da imagem** (primeira célula) abre nosso
 *     **modal próprio** com as imagens do produto pra associar à variante.
 *  3. **Click no "..." → "Editar"** (último td) continua abrindo a drawer
 *     nativa — único caminho pra editar título/SKU/etc.
 *
 * Estratégia: listener **capture-phase global** que detecta clicks em rows
 * de tabela cujo cabeçalho contém "SKU" + descobre a variante pelo índice
 * da linha (mapa product.variants ordenado).
 *
 * O modal é renderizado dentro deste widget (zone product.details.after);
 * não estilizado — usa Tailwind nativo do admin pra combinar.
 */
const VariantRowImageInjector = ({ data }: DetailWidgetProps<Product>) => {
  const productId = data.id
  const [variants, setVariants] = useState<Variant[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [openVariant, setOpenVariant] = useState<Variant | null>(null)
  const [saving, setSaving] = useState(false)
  // Ref pra mantermos o último mapa atual sem precisar reanexar listener
  const stateRef = useRef<{ variants: Variant[]; images: ProductImage[] }>({
    variants: [],
    images: [],
  })

  const load = async () => {
    const res = await fetch(
      `/admin/products/${productId}?fields=id,images.id,images.url,variants.id,variants.title,variants.sku,variants.metadata`,
      { credentials: "include" }
    )
    if (!res.ok) return
    const d = await res.json()
    const imgs = d.product?.images ?? []
    const vars = d.product?.variants ?? []
    setImages(imgs)
    setVariants(vars)
    stateRef.current = { variants: vars, images: imgs }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  // Listener global capture-phase: silencia clicks na linha + abre modal no ícone
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const row = target.closest("tr") as HTMLTableRowElement | null
      if (!row) return
      const table = row.closest("table") as HTMLTableElement | null
      if (!table) return
      // Confirma que é a tabela de variantes
      const headers = Array.from(table.querySelectorAll("thead th")).map((h) =>
        (h.textContent ?? "").trim()
      )
      if (!headers.some((h) => h.includes("SKU"))) return

      const cells = Array.from(row.children) as HTMLElement[]
      if (cells.length === 0) return

      // Último td = menu de ações (...) — deixa passar pra abrir o "Editar"
      const lastCell = cells[cells.length - 1]
      if (lastCell.contains(target)) return

      // Bloqueia o click default da linha (que abre a drawer nativa)
      e.stopPropagation()
      e.stopImmediatePropagation()
      e.preventDefault()

      // Primeira célula = ícone-placeholder da imagem → abre nosso modal
      const firstCell = cells[0]
      if (firstCell.contains(target)) {
        // Descobre qual variante está nessa linha pelo índice na tbody
        const tbody = row.parentElement
        if (!tbody) return
        const idx = Array.from(tbody.children).indexOf(row)
        const v = stateRef.current.variants[idx]
        if (v) setOpenVariant(v)
      }
      // Click em outras células: silenciado, nada acontece (cliente pediu)
    }

    // Capture true pra interceptar antes do React handler da linha
    document.addEventListener("click", handler, true)
    return () => document.removeEventListener("click", handler, true)
  }, [])

  const setVariantImage = async (
    variantId: string,
    imageId: string | null
  ) => {
    setSaving(true)
    try {
      const v = stateRef.current.variants.find((x) => x.id === variantId)
      const meta = { ...(v?.metadata ?? {}), image_id: imageId }
      if (imageId === null)
        delete (meta as Record<string, unknown>).image_id

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
        const next = stateRef.current.variants.map((x) =>
          x.id === variantId ? { ...x, metadata: meta } : x
        )
        setVariants(next)
        stateRef.current.variants = next
        setOpenVariant({ ...v!, metadata: meta })
      }
    } finally {
      setSaving(false)
    }
  }

  // ESC fecha o modal
  useEffect(() => {
    if (!openVariant) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenVariant(null)
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [openVariant])

  if (!openVariant) return null

  const currentImageId =
    (openVariant.metadata as { image_id?: string } | null)?.image_id ?? null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Selecionar imagem da variante"
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setOpenVariant(null)}
    >
      <div
        className="bg-ui-bg-base border border-ui-border-base rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-ui-border-base px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ui-fg-base">
              Imagem da variante
            </h2>
            <p className="text-sm text-ui-fg-subtle mt-0.5 truncate">
              {openVariant.title ?? openVariant.id}
              {openVariant.sku && ` · ${openVariant.sku}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpenVariant(null)}
            aria-label="Fechar"
            className="text-ui-fg-subtle hover:text-ui-fg-base text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {images.length === 0 ? (
            <p className="text-sm text-ui-fg-subtle">
              Nenhuma imagem cadastrada em Mídia. Adicione imagens no produto
              primeiro pra associá-las às variantes.
            </p>
          ) : (
            <>
              <p className="text-xs text-ui-fg-subtle mb-3">
                Clique numa imagem pra associá-la a esta variante. Click de
                novo na mesma imagem pra desassociar.
              </p>
              <div className="grid grid-cols-3 small:grid-cols-4 gap-3">
                {images.map((img) => {
                  const isSelected = img.id === currentImageId
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() =>
                        setVariantImage(
                          openVariant.id,
                          isSelected ? null : img.id
                        )
                      }
                      disabled={saving}
                      aria-pressed={isSelected}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 bg-ui-bg-subtle transition-all disabled:opacity-50 ${
                        isSelected
                          ? "border-ui-tag-blue-text ring-2 ring-ui-tag-blue-text/30"
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
                        <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ui-tag-blue-text text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-ui-border-base px-5 py-3 flex justify-end gap-2">
          {currentImageId && (
            <button
              type="button"
              onClick={() => setVariantImage(openVariant.id, null)}
              disabled={saving}
              className="text-sm text-ui-fg-subtle hover:text-ui-fg-base px-3 py-1.5"
            >
              Remover associação
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpenVariant(null)}
            className="text-sm font-semibold bg-ui-bg-base-hover hover:bg-ui-bg-subtle border border-ui-border-base px-3 py-1.5 rounded-md"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default VariantRowImageInjector
