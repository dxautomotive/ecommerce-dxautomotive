import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { Container, Heading, Text, Badge, Button, Input } from "@medusajs/ui"
import { useEffect, useMemo, useRef, useState } from "react"

const BUNDLE_MAX = 3

type Relationship = {
  id: string
  source_product_id: string
  target_product_id: string
  relationship_type: "related" | "bundle"
  position: number
  target_product: {
    id: string
    title: string | null
    thumbnail: string | null
    handle: string | null
    status: string | null
  } | null
}

type ProductLite = {
  id: string
  title: string | null
  thumbnail: string | null
  handle: string | null
}

type Product = { id: string }

/**
 * Widget pra gerenciar "Compre junto" (bundle) entre produtos.
 *
 * "Produtos relacionados" foi descontinuado nesta UI — agora a section
 * "Produtos Relacionados" do storefront é automática (mesma coleção). Decisão
 * baseada na realidade de catálogos grandes: curar manualmente 3000+
 * produtos é inviável. O tipo `related` continua no schema pra dados
 * antigos, mas novos POST são bloqueados (server retorna `type_disabled`).
 *
 * Bundle:
 *  - Máximo {@link BUNDLE_MAX} produtos vinculados (limite no server e na UI)
 *  - Click no input mostra TODOS os produtos disponíveis (sem precisar digitar)
 *  - Texto filtra a lista incrementalmente
 */
const ProductRelationshipsWidget = ({
  data,
}: DetailWidgetProps<Product>) => {
  const productId = data.id

  const [items, setItems] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [allProducts, setAllProducts] = useState<ProductLite[]>([])
  const [productsLoaded, setProductsLoaded] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch(
      `/admin/products/${productId}/relationships?type=bundle`,
      { credentials: "include" }
    )
    if (res.ok) {
      const data = await res.json()
      setItems(data.relationships ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  // Lazy-load: só busca todos os produtos na primeira vez que o input ganha foco
  const loadAllProducts = async () => {
    if (productsLoaded) return
    const params = new URLSearchParams({
      limit: "200",
      fields: "id,title,thumbnail,handle",
      order: "title",
    })
    const res = await fetch(`/admin/products?${params.toString()}`, {
      credentials: "include",
    })
    if (!res.ok) return
    const data = await res.json()
    setAllProducts(data.products ?? [])
    setProductsLoaded(true)
  }

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    if (!searchOpen) return
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [searchOpen])

  const linkedIds = useMemo(
    () => new Set(items.map((r) => r.target_product_id)),
    [items]
  )

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allProducts
    return allProducts.filter((p) => {
      const title = (p.title ?? "").toLowerCase()
      const handle = (p.handle ?? "").toLowerCase()
      return title.includes(q) || handle.includes(q)
    })
  }, [allProducts, search])

  const limitReached = items.length >= BUNDLE_MAX

  const add = async (target: ProductLite) => {
    if (target.id === productId || linkedIds.has(target.id) || limitReached)
      return
    const res = await fetch(
      `/admin/products/${productId}/relationships`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_product_id: target.id,
          relationship_type: "bundle",
          position: items.length,
        }),
      }
    )
    if (res.ok) {
      load()
      setSearch("")
      // Mantém aberto pra escolher mais — só fecha se atingiu limite
      if (items.length + 1 >= BUNDLE_MAX) setSearchOpen(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Remover este produto do bundle?")) return
    await fetch(`/admin/relationships/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setItems((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <Container className="p-6">
      <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
        <div>
          <Heading level="h2">Compre junto</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1 max-w-2xl">
            Aparecem na PDP como combo com checkboxes ('Compre junto e leve
            também'). Cliente vê o total e adiciona tudo de uma vez. Máximo{" "}
            <strong>{BUNDLE_MAX} produtos</strong> além do produto-base.
          </Text>
        </div>
        <Badge color={limitReached ? "orange" : "blue"} size="2xsmall">
          {items.length} / {BUNDLE_MAX}
        </Badge>
      </div>

      <Text size="xsmall" className="text-ui-fg-muted mt-2 mb-3">
        💡 Produtos relacionados (mesma coleção) agora aparecem automáticos no
        storefront — não precisa configurar aqui.
      </Text>

      <div ref={wrapperRef} className="relative mb-3">
        <Input
          type="search"
          placeholder={
            limitReached
              ? `Limite de ${BUNDLE_MAX} atingido — remova um produto pra trocar`
              : "Clique aqui pra ver os produtos disponíveis..."
          }
          value={search}
          disabled={limitReached}
          onFocus={() => {
            setSearchOpen(true)
            loadAllProducts()
          }}
          onChange={(e) => setSearch(e.target.value)}
        />
        {searchOpen && !limitReached && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-ui-bg-base border border-ui-border-base rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
            {!productsLoaded ? (
              <div className="p-3 text-sm text-ui-fg-subtle">Carregando produtos…</div>
            ) : visibleProducts.length === 0 ? (
              <div className="p-3 text-sm text-ui-fg-subtle">
                {search ? "Nenhum produto encontrado." : "Nenhum produto cadastrado."}
              </div>
            ) : (
              visibleProducts.map((p) => {
                const isSelf = p.id === productId
                const isLinked = linkedIds.has(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => add(p)}
                    disabled={isSelf || isLinked}
                    className="w-full text-left flex items-center gap-3 p-2 hover:bg-ui-bg-base-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 flex-shrink-0 rounded-md bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center overflow-hidden">
                      {p.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-ui-fg-muted text-base">📦</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{p.title}</p>
                      <p className="text-xs text-ui-fg-subtle truncate">
                        {p.handle}
                      </p>
                    </div>
                    {isSelf ? (
                      <Badge color="grey" size="2xsmall">
                        este produto
                      </Badge>
                    ) : isLinked ? (
                      <Badge color="green" size="2xsmall">
                        já vinculado
                      </Badge>
                    ) : (
                      <Badge color="blue" size="2xsmall">
                        adicionar
                      </Badge>
                    )}
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-6 text-center text-ui-fg-subtle text-sm">
          Carregando…
        </div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center text-ui-fg-subtle text-sm border border-dashed border-ui-border-base rounded-lg">
          Nenhum produto vinculado ainda. Clique no campo de busca acima pra
          escolher.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {items.map((rel) => {
            const p = rel.target_product
            return (
              <div
                key={rel.id}
                className="border border-ui-border-base rounded-lg p-2.5 flex items-center gap-3 bg-ui-bg-base"
              >
                <div className="w-12 h-12 flex-shrink-0 rounded-md bg-ui-bg-subtle border border-ui-border-base overflow-hidden flex items-center justify-center">
                  {p?.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-ui-fg-muted text-lg">📦</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={`/app/products/${rel.target_product_id}`}
                    className="text-sm font-semibold text-ui-fg-interactive hover:underline truncate block"
                  >
                    {p?.title ?? rel.target_product_id}
                  </a>
                  <div className="text-xs text-ui-fg-subtle flex items-center gap-2 mt-0.5">
                    <span>posição {rel.position}</span>
                    {p?.status && p.status !== "published" && (
                      <Badge color="orange" size="2xsmall">
                        {p.status}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => remove(rel.id)}
                >
                  Remover
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductRelationshipsWidget
