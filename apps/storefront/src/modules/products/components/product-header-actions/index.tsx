"use client"

import { useEffect, useState } from "react"
import RatingSummary from "@modules/products/components/rating-summary"

type Props = {
  productId: string
  productTitle: string
}

const FAV_KEY = "dx:favorites"

const readFavs = (): string[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(FAV_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * ProductHeaderActions — linha superior da info center na PDP (KaBuM-style).
 *
 * Layout: rating à esquerda · botões compartilhar + favoritar à direita,
 * tudo numa única flex row alinhada à direita pra encostar no título.
 *
 * - Compartilhar: usa `navigator.share()` (Web Share API, mobile-friendly).
 *   Fallback: copia URL pro clipboard + mensagem "Link copiado!" inline 2s.
 * - Favoritar: persiste em `localStorage["dx:favorites"] = string[]`. Toggle.
 *   Quando o módulo de wishlist server-side existir, virar API real.
 */
export default function ProductHeaderActions({
  productId,
  productTitle,
}: Props) {
  const [fav, setFav] = useState(false)
  const [shared, setShared] = useState<"copied" | null>(null)

  useEffect(() => {
    setFav(readFavs().includes(productId))
  }, [productId])

  const toggleFav = () => {
    const cur = readFavs()
    const next = cur.includes(productId)
      ? cur.filter((id) => id !== productId)
      : [...cur, productId]
    window.localStorage.setItem(FAV_KEY, JSON.stringify(next))
    setFav(next.includes(productId))
  }

  const handleShare = async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : ""
    const data = { title: productTitle, url }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data)
        return
      } catch {
        // user cancelou ou erro — fallback abaixo
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShared("copied")
      setTimeout(() => setShared(null), 2000)
    } catch {
      // sem clipboard, ignora silenciosamente
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      <RatingSummary productId={productId} />

      <div className="flex items-center gap-1.5 ml-1 relative">
        <button
          type="button"
          onClick={handleShare}
          aria-label="Compartilhar produto"
          className="w-8 h-8 rounded-full border border-brand-border bg-brand-surface-2 text-brand-text-2 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors"
        >
          <ShareIcon />
        </button>

        <button
          type="button"
          onClick={toggleFav}
          aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={fav}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
            fav
              ? "border-brand-danger/50 bg-brand-danger/10 text-brand-danger"
              : "border-brand-border bg-brand-surface-2 text-brand-text-2 hover:border-brand-primary hover:text-brand-primary"
          }`}
        >
          <HeartIcon filled={fav} />
        </button>

        {shared === "copied" && (
          <span
            role="status"
            className="absolute -bottom-7 right-0 text-[11px] bg-brand-success text-white px-2 py-1 rounded-md whitespace-nowrap"
          >
            Link copiado!
          </span>
        )}
      </div>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
