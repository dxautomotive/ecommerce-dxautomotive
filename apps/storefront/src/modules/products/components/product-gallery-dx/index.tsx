"use client"

import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { useRef, useState } from "react"

type Props = {
  images: HttpTypes.StoreProductImage[]
  alt: string
}

/**
 * Galeria de imagens estilo DX/Vision:
 * - Imagem principal grande com zoom on hover (CSS transform-origin)
 * - Thumbnails na lateral em desktop / abaixo em mobile
 * - Indicador "1/8" no canto da imagem principal
 * - Sem deps externas — pure React + CSS
 */
export default function ProductGalleryDX({ images, alt }: Props) {
  const safe = images?.filter(Boolean) ?? []
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  if (!safe.length) {
    return (
      <div className="aspect-square w-full bg-brand-surface border border-brand-border rounded-lg flex items-center justify-center text-7xl text-brand-border" aria-hidden="true">
        📦
      </div>
    )
  }

  const onMove = (e: React.MouseEvent) => {
    if (!mainRef.current) return
    const rect = mainRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoom({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  const current = safe[active]

  return (
    <div className="flex flex-col-reverse small:flex-row gap-3 small:gap-4">
      <div className="flex small:flex-col gap-2 overflow-x-auto small:overflow-y-auto small:max-h-[560px] no-scrollbar">
        {safe.map((img, i) => (
          <button
            key={img.id ?? i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ver imagem ${i + 1} de ${safe.length}`}
            aria-pressed={i === active}
            className={`relative flex-shrink-0 w-16 h-16 small:w-20 small:h-20 rounded border-2 overflow-hidden bg-brand-surface transition-colors ${
              i === active
                ? "border-brand-primary"
                : "border-brand-border hover:border-brand-muted"
            }`}
          >
            <Image
              src={img.url}
              alt={`${alt} — imagem ${i + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <div
        ref={mainRef}
        className="relative flex-1 aspect-square small:aspect-[4/5] bg-brand-surface border border-brand-border rounded-lg overflow-hidden cursor-zoom-in"
        onMouseEnter={(e) => onMove(e)}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          src={current.url}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
          className="object-cover transition-transform duration-200"
          style={
            zoom
              ? {
                  transform: "scale(2)",
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                }
              : undefined
          }
        />
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded">
          {active + 1} / {safe.length}
        </div>
      </div>
    </div>
  )
}
