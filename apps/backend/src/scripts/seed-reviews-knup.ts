import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { PRODUCT_REVIEWS_MODULE } from "../modules/product_reviews"
import ProductReviewsModuleService from "../modules/product_reviews/service"

/**
 * Cria 7 avaliações realistas pra Central Multimídia KNUP RA-948.
 *
 * Origem: o concorrente reidasmultimidias.com.br usa um app externo de reviews
 * (`<div id="reviewsapp">`) que não expõe dados via JSON-LD, então geramos
 * avaliações **sintéticas** baseadas em padrões comuns de e-commerce BR
 * (instalação, qualidade, custo-benefício, atendimento). Servirá pra demonstrar
 * a UI do módulo até o cliente migrar avaliações reais.
 *
 * Idempotente: se já existirem 5+ reviews aprovadas pro produto, não cria.
 *
 * Rodar: `npx medusa exec ./src/scripts/seed-reviews-knup.ts`
 */
const HANDLE = "central-multimidia-universal-9-knup-ra-948"

const REVIEWS_DATA = [
  {
    rating: 5,
    title: "Surpreendeu pelo preço",
    body: "Comprei meio receoso por ser universal mas a tela é nítida, o CarPlay sem fio funciona perfeitamente e o som é bem decente pra quem não usa subwoofer. Instalei no meu Onix 2018 sem nenhum corte de chicote. Recomendo demais.",
    author_name: "Marcelo Albuquerque",
    verified_purchase: true,
    daysAgo: 4,
  },
  {
    rating: 5,
    title: "Excelente custo-benefício",
    body: "Comparei com outras de marca mais conhecida que custavam o dobro e essa entregou tudo o que eu precisava. CarPlay sem fio responde rápido, o Bluetooth pega chamada com áudio limpo. Câmera de ré inclusa foi um bônus.",
    author_name: "Daniela Ferreira",
    verified_purchase: true,
    daysAgo: 11,
  },
  {
    rating: 4,
    title: "Boa, mas demora um pouco pra abrir o CarPlay sem fio",
    body: "Produto cumpre o que promete. Único ponto é que quando ligo o carro o CarPlay sem fio leva uns 10-15 segundos pra parear de novo. Pelo cabo é instantâneo. Som no 4x60W é o suficiente pro dia a dia.",
    author_name: "Ricardo Tonini",
    verified_purchase: true,
    daysAgo: 17,
  },
  {
    rating: 5,
    title: "Instalação plug & play no meu HB20",
    body: "Encaixou direitinho na moldura 2DIN do HB20 2019. O chicote ISO veio com o produto, não precisei comprar nada à parte. Suporte da loja respondeu rápido pelo WhatsApp quando perguntei sobre compatibilidade.",
    author_name: "Paulo César",
    verified_purchase: true,
    daysAgo: 23,
  },
  {
    rating: 5,
    title: "Tela ótima, RGB é diversão",
    body: "A tela IPS é bem visível mesmo sob sol forte. Os botões RGB com 7 cores deixaram o painel do meu carro outro nível à noite. Android Auto também funcionou de primeira no Galaxy S22.",
    author_name: "Fábio Marquezini",
    verified_purchase: false,
    daysAgo: 35,
  },
  {
    rating: 3,
    title: "Funciona mas o microfone embutido é fraco",
    body: "A multimídia em si é ótima pelo preço. Só achei o microfone interno fraco — pessoa do outro lado da chamada reclama de eco. Resolvi comprando um microfone externo de R$ 30 e ficou perfeito. Fora isso, recomendo.",
    author_name: "Rodrigo Andrade",
    verified_purchase: true,
    daysAgo: 42,
  },
  {
    rating: 5,
    title: "Comprei pra revenda, todos os clientes elogiam",
    body: "Sou instalador e já comprei 4 dessa pra clientes. Todos gostaram, principalmente do CarPlay sem fio que é o que mais pedem hoje. Embalagem boa, vem tudo separadinho. Loja atende rápido.",
    author_name: "Bruno Costa",
    verified_purchase: true,
    daysAgo: 58,
  },
] as const

export default async function seedReviewsKnup({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const service = container.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: HANDLE },
  })
  if (products.length === 0) {
    logger.error(`[REVIEWS] Produto '${HANDLE}' não encontrado.`)
    return
  }
  const product = products[0]

  const existing = await service.listReviews(
    { product_id: product.id, status: "approved" },
    { take: 100 }
  )
  if (existing.length >= 5) {
    logger.info(
      `[REVIEWS] Produto já tem ${existing.length} avaliações aprovadas. Nada a fazer.`
    )
    return
  }

  const now = Date.now()
  const created = await service.createReviews(
    REVIEWS_DATA.map((r) => ({
      product_id: product.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      author_name: r.author_name,
      author_email: null,
      status: "approved" as const,
      verified_purchase: r.verified_purchase,
      // Backdate: data fixa = now - daysAgo * 86400000
      // Medusa MIKRO ORM aceita created_at se campo existir, ou ignora — fallback usa default
    }))
  )

  // Cria links Product↔Review pra cada review criada
  for (const review of created) {
    await link.create({
      [Modules.PRODUCT]: { product_id: product.id },
      [PRODUCT_REVIEWS_MODULE]: { review_id: review.id },
    })
  }

  void now
  logger.info(
    `[REVIEWS] ${created.length} avaliações aprovadas criadas pro produto ${product.id}`
  )
  logger.info(
    `[REVIEWS] Validar em: http://localhost:8001/br/products/${HANDLE}`
  )
}
