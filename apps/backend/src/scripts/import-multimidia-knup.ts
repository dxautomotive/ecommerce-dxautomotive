import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Importa o produto Central Multimídia KNUP RA-948 (universal 9" CarPlay/Android Auto).
 *
 * Origem: scrape do concorrente reidasmultimidias.com.br
 * (https://reidasmultimidias.com.br/produtos/central-multimidia-universal-9pol-mp5-android-auto-carplay/)
 *
 * Apenas dados públicos (título, descrição, imagens, preço de prateleira) — fica como
 * produto de teste pra validar o template DX 2.1 com conteúdo real (em vez do
 * placeholder Toyota Corolla do bootstrap).
 *
 * Idempotente: se já existir um produto com este `handle`, não cria de novo.
 *
 * Rodar: `npx medusa exec ./src/scripts/import-multimidia-knup.ts`
 */
const HANDLE = "central-multimidia-universal-9-knup-ra-948"
const SKU = "DX-MM-UNI-9P-KNUP-RA948"

const TITLE =
  'Central Multimídia Universal 9" KNUP RA-948 — CarPlay e Android Auto sem fio (2DIN Slim)'

const SUBTITLE =
  "Tela IPS 9″ · CarPlay & Android Auto com e sem fio · 4×60W · Câmera de ré inclusa"

// Markdown leve — o storefront renderiza a descrição como texto/Markdown nas tabs.
const DESCRIPTION = `🎵🚗 CENTRAL MULTIMÍDIA KNUP RA-948 — 9" IPS COM CARPLAY E ANDROID AUTO (COM E SEM FIO)

Tecnologia, praticidade e estilo em um só produto. A Central Multimídia Knup RA-948 foi desenvolvida pra quem busca conectividade moderna e visual sofisticado no carro. Compatível com CarPlay e Android Auto — com e sem fio — ela garante integração total com seu smartphone, permitindo navegar por apps, ouvir música, atender chamadas e usar GPS com toda segurança.

A tela IPS de 9 polegadas proporciona imagens nítidas e cores vibrantes, enquanto o chassi 2DIN Slim se adapta perfeitamente a diferentes painéis automotivos.

CARACTERÍSTICAS PRINCIPAIS
- CarPlay com e sem fio — conecte seu iPhone via cabo ou Wi-Fi
- Android Auto com e sem fio — integração total com smartphones Android
- Tela de 9″ IPS HD 1024×600 — imagem nítida e ângulo de visão amplo
- Chassi 2DIN Slim — design moderno e fácil instalação
- Potência sonora 4×60W RMS — som limpo e potente
- Botões RGB com 7 cores ajustáveis — personalização da iluminação
- Bluetooth integrado — chamadas e áudio estéreo sem fio

ENTRADAS E SAÍDAS
- 2× USB (4 e 6 pinos)
- 1× Entrada de vídeo (AV)
- 1× Entrada para câmera de ré
- 1× Entrada para microfone externo
- 2× Saídas de áudio e vídeo
- 1× Saída dedicada para subwoofer

ESPECIFICAÇÕES TÉCNICAS
- Modelo: RA-948
- Marca: KNUP
- Tela: 9″ IPS (1024×600)
- Potência: 4×60W RMS
- Bluetooth: chamadas e áudio estéreo
- Tensão: 12V
- Compatibilidade: Universal (2DIN Slim)

ITENS INCLUSOS
- 1× Central Multimídia MP5 KNUP RA-948
- 1× Manual de instruções
- 1× Chicote de alimentação ISO 16 vias
- 1× Cabo USB 4 pinos
- 1× Cabo USB 6 pinos
- 1× Chicote RCA
- 1× Câmera de ré (BRINDE)`

const IMAGE_URLS = [
  "https://acdn-us.mitiendanube.com/stores/006/653/356/products/1-04775e915b9344b25117626102754727-640-0.webp",
  "https://acdn-us.mitiendanube.com/stores/006/653/356/products/4-67ca4065e4fd7d75d417772881288995-640-0.webp",
  "https://acdn-us.mitiendanube.com/stores/006/653/356/products/3-d98ef078d0a9dd113617772881289371-640-0.webp",
] as const

const PRICE_BRL_REAIS = 879.0

// Bullets pré-processados pro AiSummary do template (`metadata.ai_summary`).
const AI_SUMMARY = [
  "Tela IPS 9″ HD com <strong>CarPlay e Android Auto sem fio</strong> — pareamento direto pelo Wi-Fi",
  "Som 4×60W RMS com saída dedicada pra <strong>subwoofer</strong> e botões RGB ajustáveis em 7 cores",
  "<strong>Câmera de ré inclusa</strong> + chicote ISO 16 vias e cabos USB no kit",
  "Chassi 2DIN Slim — instalação universal em painéis padrão (12V)",
] as const

export default async function importMultimidiaKnup({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // 1) Verifica se já existe
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: HANDLE },
  })
  if (existing.length > 0) {
    logger.info(`[KNUP] Produto já existe (${existing[0].id}). Nada a fazer.`)
    return
  }

  // 2) Busca categoria multimídia
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { handle: "multimidia" },
  })
  if (categories.length === 0) {
    logger.error(
      "[KNUP] Categoria 'multimidia' não encontrada. Rode dx-bootstrap antes."
    )
    return
  }
  const multimidiaCategory = categories[0]

  // 3) Busca coleção "lancamentos"
  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
    filters: { handle: "lancamentos" },
  })
  const lancamentos = collections[0]

  // 4) Busca sales channel "DX Automotive"
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  const dxChannel =
    salesChannels.find((s) => s.name === "DX Automotive") ?? salesChannels[0]
  if (!dxChannel) {
    logger.error("[KNUP] Nenhum sales channel encontrado.")
    return
  }

  // 5) Busca shipping profile default (necessário pro produto)
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "type"],
  })
  const defaultProfile =
    shippingProfiles.find((p) => p.type === "default") ?? shippingProfiles[0]
  if (!defaultProfile) {
    logger.error(
      "[KNUP] Nenhum shipping profile encontrado. Rode dx-bootstrap antes."
    )
    return
  }

  // 6) Cria produto
  const { result } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: TITLE,
          subtitle: SUBTITLE,
          handle: HANDLE,
          description: DESCRIPTION,
          status: ProductStatus.PUBLISHED,
          thumbnail: IMAGE_URLS[0],
          images: IMAGE_URLS.map((url) => ({ url })),
          weight: 2200,
          category_ids: [multimidiaCategory.id],
          collection_id: lancamentos?.id,
          shipping_profile_id: defaultProfile.id,
          sales_channels: [{ id: dxChannel.id }],
          metadata: {
            ai_summary: AI_SUMMARY,
            origem: "import scrape concorrente (rei-das-multimidias)",
            tipo: "universal-2din-slim",
          },
          options: [{ title: "Padrão", values: ["Único"] }],
          variants: [
            {
              title: "Único",
              sku: SKU,
              manage_inventory: false,
              options: { Padrão: "Único" },
              prices: [{ amount: PRICE_BRL_REAIS, currency_code: "brl" }],
            },
          ],
        },
      ],
    },
  })

  const product = result[0]
  logger.info(
    `[KNUP] Produto importado: ${product.id} (${product.handle}) — preço R$ ${PRICE_BRL_REAIS.toFixed(2)}`
  )
  logger.info(
    `[KNUP] URL: http://localhost:8001/br/products/${HANDLE}`
  )
}
