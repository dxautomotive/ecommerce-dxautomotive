"use client"

import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"

type Props = {
  images: HttpTypes.StoreProductImage[]
  alt: string
}

/**
 * Galeria de imagens da PDP v2.1 (KaBuM-inspired).
 *
 * Comportamento:
 *  - Imagem principal **1:1** (aspect-square) com `object-contain` pra preservar
 *    a proporção da foto sem corte.
 *  - Thumbnails verticais à esquerda em desktop / row scroll-x abaixo em mobile.
 *  - **Click na imagem abre lightbox** full-screen com:
 *      • coluna de thumbnails à esquerda (120px)
 *      • imagem grande 1:1 contida ao centro
 *      • fecha com X, click no backdrop, ou ESC
 *  - Indicador "N / total" no canto inferior direito.
 *
 * O hover-zoom anterior foi removido em favor do lightbox — comportamento
 * mais alinhado com KaBuM/Mercado Livre/grandes e-commerces brasileiros.
 */
export default function ProductGalleryDX({ images, alt }: Props) {
  const safe = images?.filter(Boolean) ?? []
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  // ESC fecha o lightbox
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false)
      if (e.key === "ArrowRight")
        setActive((i) => (i + 1) % Math.max(1, safe.length))
      if (e.key === "ArrowLeft")
        setActive((i) => (i - 1 + safe.length) % Math.max(1, safe.length))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightbox, safe.length])

  // Trava scroll do body quando lightbox aberto
  useEffect(() => {
    if (!lightbox) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [lightbox])

  if (!safe.length) {
    return (
      <div
        className="aspect-square w-full bg-brand-surface-2 border border-brand-border rounded-lg flex items-center justify-center text-7xl text-brand-border-2"
        aria-hidden="true"
      >
        📦
      </div>
    )
  }

  const current = safe[active]

  return (
    <>
      <div className="flex flex-col-reverse small:flex-row gap-3 small:gap-4">
        <div className="flex small:flex-col gap-2 overflow-x-auto small:overflow-y-auto small:max-h-[560px] no-scrollbar">
          {safe.map((img, i) => (
            <button
              key={img.id ?? i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagem ${i + 1} de ${safe.length}`}
              aria-pressed={i === active}
              className={`relative flex-shrink-0 w-16 h-16 small:w-20 small:h-20 rounded-md border-2 overflow-hidden bg-brand-surface-2 transition-colors ${
                i === active
                  ? "border-brand-primary"
                  : "border-brand-border hover:border-brand-border-2"
              }`}
            >
              <Image
                src={img.url}
                alt={`${alt} — imagem ${i + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Ampliar imagem"
          className="relative flex-1 aspect-square bg-brand-surface-2 border border-brand-border rounded-lg overflow-hidden cursor-zoom-in group"
        >
          <Image
            src={current.url}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-contain p-4 transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded">
            {active + 1} / {safe.length}
          </div>
          <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIcon />
          </div>
        </button>
      </div>

      {lightbox && (
        <Lightbox
          images={safe}
          active={active}
          alt={alt}
          onClose={() => setLightbox(false)}
          onSelect={setActive}
        />
      )}
    </>
  )
}

function Lightbox({
  images,
  active,
  alt,
  onClose,
  onSelect,
}: {
  images: HttpTypes.StoreProductImage[]
  active: number
  alt: string
  onClose: () => void
  onSelect: (i: number) => void
}) {
  const current = images[active]
  if (!current) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria ampliada de ${alt}`}
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar galeria"
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
      >
        <CloseIcon />
      </button>

      <div
        className="grid grid-cols-1 small:grid-cols-[120px_1fr] gap-4 small:gap-6 w-full max-w-[1200px] h-full max-h-[90vh] p-4 small:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex small:flex-col gap-2 overflow-x-auto small:overflow-y-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={img.id ?? i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-pressed={i === active}
              className={`relative flex-shrink-0 w-20 h-20 small:w-full small:aspect-square rounded-md border-2 overflow-hidden bg-brand-surface-2 transition-all ${
                i === active
                  ? "border-brand-primary shadow-glow-sm"
                  : "border-white/20 hover:border-white/50"
              }`}
            >
              <Image
                src={img.url}
                alt={`${alt} — imagem ${i + 1}`}
                fill
                sizes="120px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>

        <div className="relative bg-brand-surface-2 rounded-lg overflow-hidden border border-white/10">
          <Image
            src={current.url}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 90vw, 1080px"
            priority
            className="object-contain p-4 small:p-8"
          />
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white text-sm font-semibold px-3 py-1.5 rounded">
            {active + 1} / {images.length}
          </div>
        </div>
      </div>
    </div>
  )
}

function ZoomIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
