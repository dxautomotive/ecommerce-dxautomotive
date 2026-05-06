import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { Container, Heading, Text, Badge, Button, Input } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

type RelType = "related" | "bundle"

type Relationship = {
  id: string
  source_product_id: string
  target_product_id: string
  relationship_type: RelType
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

const TYPE_LABEL: Record<RelType, string> = {
  related: "Produtos relacionados",
  bundle: "Compre junto",
}

const TYPE_HELP: Record<RelType, string> = {
  related:
    "Aparecem na PDP em uma lista horizontal ('Produtos relacionados'). Curadoria manual.",
  bundle:
    "Aparecem na PDP como combo com checkboxes ('Compre junto e leve também'). Cliente vê o total e adiciona tudo de uma vez.",
}

/**
 * Widget pra gerenciar relações entre produtos.
 *
 * Mostra duas seções no `product.details.after`:
 *  - Produtos relacionados (lista horizontal de sugestões na PDP)
 *  - Compre junto (combo com soma do total)
 *
 * Cada seção tem:
 *  - Lista atual com botão remover
 *  - Campo de busca que pesquisa produtos publicados via /admin/products
 *  - Botão "Adicionar" em cada resultado
 */
const ProductRelationshipsWidget = ({
  data,
}: DetailWidgetProps<Product>) => {
  const productId = data.id
  return (
    <Container className="p-6 flex flex-col gap-7">
      <Section type="related" productId={productId} />
      <hr className="border-ui-border-base" />
      <Section type="bundle" productId={productId} />
    </Container>
  )
}

function Section({
  type,
  productId,
}: {
  type: RelType
  productId: string
}) {
  const [items, setItems] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<ProductLite[]>([])
  const [searching, setSearching] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(
      `/admin/products/${productId}/relationships?type=${type}`,
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
  }, [productId, type])

  // Busca debounced
  useEffect(() => {
    const q = search.trim()
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    const t = setTimeout(async () => {
      setSearching(true)
      const params = new URLSearchParams({
        q,
        limit: "10",
        fields: "id,title,thumbnail,handle",
      })
      const res = await fetch(`/admin/products?${params.toString()}`, {
        credentials: "include",
      })
      setSearching(false)
      if (!res.ok) return
      const data = await res.json()
      setSearchResults(data.products ?? [])
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const linkedIds = useMemo(
    () => new Set(items.map((r) => r.target_product_id)),
    [items]
  )

  const add = async (target: ProductLite) => {
    if (target.id === productId || linkedIds.has(target.id)) return
    const res = await fetch(
      `/admin/products/${productId}/relationships`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_product_id: target.id,
          relationship_type: type,
          position: items.length,
        }),
      }
    )
    if (res.ok) {
      load()
      setSearch("")
      setSearchResults([])
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Remover esta relação?")) return
    await fetch(`/admin/relationships/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setItems((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div>
          <Heading level="h2">{TYPE_LABEL[type]}</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1 max-w-2xl">
            {TYPE_HELP[type]}
            {items.length > 0 && (
              <>
                {" "}
                <strong>
                  {items.length} item{items.length === 1 ? "" : "s"}
                </strong>{" "}
                vinculado{items.length === 1 ? "" : "s"}.
              </>
            )}
          </Text>
        </div>
      </div>

      <div className="relative mb-3">
        <Input
          type="search"
          placeholder="Buscar produto pra adicionar (mín. 2 letras)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-ui-bg-base border border-ui-border-base rounded-lg shadow-lg z-10 max-h-72 overflow-y-auto">
            {searching ? (
              <div className="p-3 text-sm text-ui-fg-subtle">Buscando…</div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-sm text-ui-fg-subtle">
                Nenhum produto encontrado.
              </div>
            ) : (
              searchResults.map((p) => {
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
          Nenhum produto vinculado ainda.
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
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductRelationshipsWidget
