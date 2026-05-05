import { Metadata } from "next"

import BenefitsBar from "@modules/home/components/benefits-bar"
import CategoryShowcase from "@modules/home/components/category-showcase"
import FeaturedProductsDX from "@modules/home/components/featured-products-dx"
import FlashSaleBanner from "@modules/home/components/flash-sale-banner"
import HeroCarousel from "@modules/home/components/hero-carousel"
import PromotionBlocks from "@modules/home/components/promotion-blocks"
import Testimonials from "@modules/home/components/testimonials"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "DX Automotive — Tecnologia que transforma seu carro",
  description:
    "Loja oficial DX Automotive: centrais multimídia, molduras, câmera de ré e sensor de estacionamento. Frete para todo o Brasil, Pix com desconto e parcelamento em 12x.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  if (!region) return null

  return (
    <>
      <HeroCarousel />
      <BenefitsBar />
      <CategoryShowcase />
      <FlashSaleBanner />
      <FeaturedProductsDX
        region={region}
        eyebrow="Mais procurados"
        title="Produtos em destaque"
        description="Os equipamentos mais vendidos da loja, prontos para envio imediato."
        limit={8}
      />
      <PromotionBlocks />
      <Testimonials />
      <FeaturedProductsDX
        region={region}
        eyebrow="Acabaram de chegar"
        title="Novidades"
        description="Lançamentos recentes do nosso catálogo."
        limit={4}
        seeAllHref="/store?sortBy=created_at"
      />
    </>
  )
}
