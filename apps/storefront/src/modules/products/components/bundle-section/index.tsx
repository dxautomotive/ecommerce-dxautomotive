"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { addToCart } from "@lib/data/cart"
import {
  PAYMENT_CONFIG,
  formatMoney,
} from "@lib/util/payment-display"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9001"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const apiHeaders: HeadersInit | undefined = PUBLISHABLE_KEY
  ? { "x-publishable-api-key": PUBLISHABLE_KEY }
  : undefined

type BundleProduct = {
  id: string
  title: string
  thumbnail: string | null
  handle: string
  variants: Array<{
    id: string
    calculated_price?: {
      calculated_amount?: number
      original_amount?: number
      currency_code?: string
    }
  }>
}

type Props = {
  /** Produto-base (a PDP atual). Sempre selecionado e fixo */
  product: BundleProduct
  /** Currency code da region */
  currencyCode: string
}

const cheapest = (p: BundleProduct): number =>
  p.variants?.[0]?.calculated_price?.calculated_amount ?? 0

const firstVariantId = (p: BundleProduct): string | null =>
  p.variants?.[0]?.id ?? null

/**
 * BundleSection — "Compre junto e leve também" (estilo Mercado Livre / Magalu).
 *
 * Mostra o produto atual + produtos vinculados como `bundle` no admin.
 * Cada item tem checkbox; o produto-base é forçado marcado e não desmarcável.
 * Total recalcula em tempo real conforme seleção. Botão "Adicionar selecionados
 * ao carrinho" adiciona todos os marcados em loop e redireciona pro carrinho.
 *
 * Pix highlight: o subtotal mostra também o valor com Pix 10% off.
 */
export default function BundleSection({ product, currencyCode }: Props) {
  const params = useParams()
  const countryCode = (params.countryCode as string | undefined) ?? "br"
  const router = useRouter()

  const [bundle, setBundle] = useState<BundleProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set([product.id]))
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(
      `${BACKEND_URL}/store/products/${product.id}/relationships?type=bundle`,
      { headers: apiHeaders }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return
        const items: BundleProduct[] = data.products ?? []
        setBundle(items)
        // Pré-seleciona base + todos os bundle (cliente pode desmarcar)
        setSelected(new Set([product.id, ...items.map((b) => b.id)]))
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [product.id])

  const allItems = useMemo(() => [product, ...bundle], [product, bundle])

  const toggle = (id: string) => {
    if (id === product.id) return // base é fixo
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const subtotal = useMemo(() => {
    return allItems
      .filter((p) => selected.has(p.id))
      .reduce((sum, p) => sum + cheapest(p), 0)
  }, [allItems, selected])

  const fmt = (n: number) => formatMoney(n, currencyCode)
  const pixSubtotal = subtotal * (1 - PAYMENT_CONFIG.pixDiscount)
  const selectedCount = selected.size

  const handleBuyAll = async () => {
    setAdding(true)
    try {
      // Adiciona em sequência pra preservar ordem; loops de await pequenos OK
      for (const p of allItems) {
        if (!selected.has(p.id)) continue
        const variantId = firstVariantId(p)
        if (!variantId) continue
        await addToCart({ variantId, quantity: 1, countryCode })
      }
      router.push(`/cart`)
    } catch (e) {
      console.error("[bundle] erro adicionando ao carrinho", e)
    } finally {
      setAdding(false)
    }
  }

  if (loading) return null
  if (bundle.length === 0) return null // sem bundle configurado, não renderiza

  return (
    <section className="bg-brand-surface border border-brand-border rounded-xl p-5 small:p-7">
      <h2 className="text-[18px] small:text-[20px] font-extrabold text-brand-text mb-4">
        Compre junto e leve também
      </h2>

      <div className="flex flex-col medium:flex-row medium:items-stretch gap-5 medium:gap-6">
        <div className="flex-1 min-w-0 flex items-stretch gap-3 small:gap-5 overflow-x-auto pb-2 medium:pb-0">
        {allItems.map((p, i) => {
          const isBase = p.id === product.id
          const isSelected = selected.has(p.id)
          const price = cheapest(p)
          return (
            <div key={p.id} className="flex items-center gap-3 small:gap-5">
              {i > 0 && (
                <span
                  className="text-2xl small:text-3xl text-brand-primary font-light flex-shrink-0"
                  aria-hidden="true"
                >
                  +
                </span>
              )}
              <article
                onClick={() => toggle(p.id)}
                role={isBase ? undefined : "button"}
                aria-pressed={isBase ? undefined : isSelected}
                className={`relative flex flex-col items-center gap-2 w-[150px] flex-shrink-0 p-3 rounded-lg border transition-all ${
                  isBase
                    ? "border-brand-primary bg-brand-primary/5 cursor-default"
                    : isSelected
                      ? "border-brand-primary bg-brand-primary/5 cursor-pointer hover:border-brand-cyan"
                      : "border-brand-border bg-brand-surface-2 cursor-pointer hover:border-brand-border-2 opacity-70"
                }`}
              >
                <span
                  className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-brand-primary border-brand-primary text-white"
                      : "bg-brand-surface border-brand-border-2 text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <CheckIcon />
                </span>
                {isBase && (
                  <span
                    className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-brand-cyan bg-brand-primary/15 px-1.5 py-0.5 rounded-[4px]"
                    aria-label="Este produto"
                  >
                    Este
                  </span>
                )}

                <div className="relative w-[100px] h-[100px] bg-brand-surface-2 rounded-md overflow-hidden flex items-center justify-center mt-2">
                  {p.thumbnail ? (
                    <Image
                      src={p.thumbnail}
                      alt={p.title}
                      fill
                      sizes="100px"
                      className="object-contain p-1.5"
                    />
                  ) : (
                    <span
                      className="text-2xl text-brand-border-2"
                      aria-hidden="true"
                    >
                      📦
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-brand-text leading-tight text-center line-clamp-2 min-h-[2.4em]">
                  {p.title}
                </p>
                <p className="text-[13px] font-black text-grad-electric leading-none">
                  {fmt(price)}
                </p>
              </article>
            </div>
          )
        })}
        </div>

        <div className="medium:w-[260px] flex-shrink-0 flex flex-col gap-3 justify-center medium:border-l medium:border-brand-border medium:pl-6 pt-5 medium:pt-0 border-t medium:border-t-0 border-brand-border">
          <div className="flex flex-col gap-0.5">
            <p className="text-[12px] text-brand-text-3 uppercase tracking-wider font-semibold">
              Total ({selectedCount}{" "}
              {selectedCount === 1 ? "produto" : "produtos"})
            </p>
            <p className="text-[26px] font-black text-grad-electric leading-none">
              {fmt(pixSubtotal)}
            </p>
            <p className="text-[12px] text-brand-text-2">
              no Pix · ou{" "}
              <strong className="text-brand-text">{fmt(subtotal)}</strong> no
              cartão
            </p>
          </div>

          <button
            type="button"
            onClick={handleBuyAll}
            disabled={adding || selectedCount === 0}
            className="bg-grad-primary text-white font-black text-[15px] px-5 py-3 rounded-md shadow-glow-sm hover:shadow-glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding
              ? "Adicionando..."
              : `Adicionar ${selectedCount} ao carrinho →`}
          </button>
        </div>
      </div>
    </section>
  )
}

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
