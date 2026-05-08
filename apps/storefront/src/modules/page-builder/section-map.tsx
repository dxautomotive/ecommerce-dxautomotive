import { listFeaturedCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import FeaturedCollection from "@modules/collections/components/featured-collection"
import BenefitsBar from "@modules/home/components/benefits-bar"
import CategoryShowcase, { type CategoryBlock } from "@modules/home/components/category-showcase"
import FeaturedProductsDX from "@modules/home/components/featured-products-dx"
import FlashSaleBanner from "@modules/home/components/flash-sale-banner"
import HeroCarousel from "@modules/home/components/hero-carousel"
import PromotionBlocks from "@modules/home/components/promotion-blocks"
import Testimonials from "@modules/home/components/testimonials"
import type { SectionInstance } from "./types"

type Ctx = {
  countryCode: string
}

/**
 * Mapeia `SectionInstance.type` → componente React + adapter de settings.
 *
 * Cada entry recebe `settings` (jsonb opaco vindo do admin) e os
 * mapeia para os props do componente concreto. Se um type vier do
 * banco e não estiver mapeado aqui, é ignorado silenciosamente.
 */
type SectionRenderer = (
  section: SectionInstance,
  ctx: Ctx
) => React.ReactNode | Promise<React.ReactNode>

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback

const num = (v: unknown, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback

export const SECTION_MAP: Record<string, SectionRenderer> = {
  "hero-carousel": () => <HeroCarousel />,

  "benefits-bar": () => <BenefitsBar />,

  "category-showcase": (sec) => {
    const rawBlocks = sec.settings.blocks
    const blocks = Array.isArray(rawBlocks)
      ? (rawBlocks as CategoryBlock[])
      : undefined
    return (
      <CategoryShowcase
        eyebrow={str(sec.settings.eyebrow, "Para o seu carro")}
        title={str(sec.settings.title, "Encontre o que precisa")}
        description={str(
          sec.settings.description,
          "Equipamentos selecionados para os principais modelos do mercado brasileiro. Compatibilidade verificada por veículo."
        )}
        blocks={blocks}
      />
    )
  },

  "flash-sale-banner": (sec) => (
    <FlashSaleBanner
      title={str(sec.settings.title)}
      subtitle={str(sec.settings.subtitle)}
      ctaLabel={str(sec.settings.cta_label)}
      ctaUrl={str(sec.settings.cta_url)}
      endsAtIso={str(sec.settings.ends_at_iso)}
    />
  ),

  "featured-products": async (sec, ctx) => {
    const region = await getRegion(ctx.countryCode)
    if (!region) return null
    return (
      <FeaturedProductsDX
        region={region}
        eyebrow={str(sec.settings.eyebrow, "Mais procurados")}
        title={str(sec.settings.title, "Produtos em destaque")}
        description={str(sec.settings.description)}
        limit={num(sec.settings.limit, 8)}
        seeAllHref={str(sec.settings.see_all_href, "/store") || "/store"}
        categoryHandle={str(sec.settings.category_handle) || undefined}
      />
    )
  },

  "featured-collection-block": async (sec, ctx) => {
    const handle = str(sec.settings.collection_handle)
    if (!handle) return null
    // Reusa a `listFeaturedCollections` pra cachear; depois acha pelo handle
    const allFeatured = await listFeaturedCollections().catch(() => [])
    let collection = allFeatured.find((c) => c.handle === handle)
    // Fallback: busca todas
    if (!collection) {
      const { listCollections } = await import("@lib/data/collections")
      const { collections } = await listCollections({ handle })
      collection = collections.find((c) => c.handle === handle) ?? collections[0]
    }
    if (!collection) return null
    return (
      <FeaturedCollection
        collection={collection}
        countryCode={ctx.countryCode}
        limit={num(sec.settings.limit, 8)}
      />
    )
  },

  "promotion-blocks": () => <PromotionBlocks />,

  testimonials: () => <Testimonials />,
}
