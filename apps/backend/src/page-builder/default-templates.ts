import { SECTION_MANIFESTS } from "./manifests"
import {
  generateSectionId,
  instantiateSection,
  PageTemplate,
} from "./types"

/**
 * Template inicial da home — replica o que está hoje hardcoded em
 * `app/[countryCode]/(main)/page.tsx`. Usado pelo bootstrap script
 * para popular `store.metadata.page_templates.home` na primeira vez.
 */
export function buildDefaultHomeTemplate(): PageTemplate {
  const find = (type: string) => SECTION_MANIFESTS.find((m) => m.type === type)!

  const ids = {
    hero: generateSectionId(),
    benefits: generateSectionId(),
    categoryShowcase: generateSectionId(),
    flashSale: generateSectionId(),
    featured1: generateSectionId(),
    featuredCollection1: generateSectionId(),
    promotionBlocks: generateSectionId(),
    testimonials: generateSectionId(),
    featured2: generateSectionId(),
  }

  const sections: PageTemplate["sections"] = {
    [ids.hero]: instantiateSection(find("hero-carousel"), ids.hero),
    [ids.benefits]: instantiateSection(find("benefits-bar"), ids.benefits),
    [ids.categoryShowcase]: instantiateSection(
      find("category-showcase"),
      ids.categoryShowcase
    ),
    [ids.flashSale]: instantiateSection(
      find("flash-sale-banner"),
      ids.flashSale
    ),
    [ids.featured1]: instantiateSection(
      find("featured-products"),
      ids.featured1
    ),
    [ids.featuredCollection1]: {
      ...instantiateSection(
        find("featured-collection-block"),
        ids.featuredCollection1
      ),
      settings: { collection_handle: "mais-vendidos", limit: 8 },
    },
    [ids.promotionBlocks]: instantiateSection(
      find("promotion-blocks"),
      ids.promotionBlocks
    ),
    [ids.testimonials]: instantiateSection(
      find("testimonials"),
      ids.testimonials
    ),
    [ids.featured2]: {
      ...instantiateSection(find("featured-products"), ids.featured2),
      settings: {
        eyebrow: "Acabaram de chegar",
        title: "Novidades",
        description: "Lançamentos recentes do nosso catálogo.",
        limit: 4,
        see_all_href: "/store?sortBy=created_at",
        category_handle: "",
      },
    },
  }

  return {
    sections,
    order: [
      ids.hero,
      ids.benefits,
      ids.categoryShowcase,
      ids.flashSale,
      ids.featured1,
      ids.featuredCollection1,
      ids.promotionBlocks,
      ids.testimonials,
      ids.featured2,
    ],
    updated_at: new Date().toISOString(),
  }
}
