import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { VEHICLE_COMPATIBILITY_MODULE } from "../modules/vehicle_compatibility"
import VehicleCompatibilityModuleService from "../modules/vehicle_compatibility/service"

/**
 * Bootstrap idempotente do dev local DX Automotive.
 *
 * Cria (se ainda não existir):
 *  - Sales Channel "DX Automotive"
 *  - Store BR (BRL como única moeda default)
 *  - Region BR
 *  - Tax region BR
 *  - Stock Location "Toledo - PR"
 *  - Fulfillment set BR + Shipping Options PAC (R$ 28) e SEDEX (R$ 48)
 *  - Publishable API Key linkada ao Sales Channel
 *  - 4 categorias DX (Multimídia / Molduras / Câmera de ré / Sensor)
 *  - 1 produto teste (Central Multimídia Toyota Corolla 2018-2022) com
 *    preço R$ 1.899 e estoque 50 unidades
 *  - 8 veículos demo (Toyota / Honda / VW / Hyundai populares 2017-2024)
 *  - Link entre o produto teste e 4 dos veículos
 *
 * Rodar: `npx medusa exec ./src/scripts/dx-bootstrap.ts`
 *
 * Imprime ao final a publishable key para atualizar
 * `apps/storefront/.env.local` (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY).
 */
export default async function dxBootstrap({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("[DX Bootstrap] Iniciando setup do dev local…")

  // 1) Sales Channel ----------------------------------------------------
  let { data: scs } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  let salesChannel = scs.find((s) => s.name === "DX Automotive") ?? scs[0]
  if (!salesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          { name: "DX Automotive", description: "Loja DX Automotive" },
        ],
      },
    })
    salesChannel = result[0]
    logger.info(`[DX] Sales Channel criado: ${salesChannel.id}`)
  } else {
    logger.info(`[DX] Sales Channel já existe: ${salesChannel.id}`)
  }

  // 2) Store ------------------------------------------------------------
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name", "supported_currencies.*"],
  })
  let store = stores[0]
  if (!store) {
    const { result } = await createStoresWorkflow(container).run({
      input: {
        stores: [
          {
            name: "DX Automotive",
            supported_currencies: [{ currency_code: "brl", is_default: true }],
            default_sales_channel_id: salesChannel.id,
          },
        ],
      },
    })
    store = result[0]
    logger.info(`[DX] Store criada: ${store.id}`)
  } else {
    // Garantir que BRL está como currency default
    const hasBrl = store.supported_currencies?.some(
      (c: { currency_code: string }) => c.currency_code === "brl"
    )
    if (!hasBrl) {
      await updateStoresWorkflow(container).run({
        input: {
          selector: { id: store.id },
          update: {
            supported_currencies: [{ currency_code: "brl", is_default: true }],
            default_sales_channel_id: salesChannel.id,
          },
        },
      })
      logger.info("[DX] Store atualizada para BRL")
    } else {
      logger.info("[DX] Store já configurada com BRL")
    }
  }

  // 3) Region BR --------------------------------------------------------
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "countries.iso_2"],
  })
  let region = regions.find(
    (r) =>
      r.name === "Brasil" ||
      (r as { countries?: Array<{ iso_2?: string }> }).countries?.some(
        (c) => c.iso_2 === "br"
      )
  )
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Brasil",
            currency_code: "brl",
            countries: ["br"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    region = result[0]
    logger.info(`[DX] Region BR criada: ${region.id}`)
  } else {
    logger.info(`[DX] Region BR já existe: ${region.id}`)
  }

  // 4) Tax region BR ----------------------------------------------------
  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  })
  if (!taxRegions.find((t) => t.country_code === "br")) {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "br", provider_id: "tp_system" }],
    })
    logger.info("[DX] Tax region BR criada")
  } else {
    logger.info("[DX] Tax region BR já existe")
  }

  // 5) Stock location Toledo --------------------------------------------
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })
  let stockLocation = stockLocations.find((s) =>
    s.name?.toLowerCase().includes("toledo")
  )
  if (!stockLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Toledo - PR",
            address: {
              city: "Toledo",
              country_code: "BR",
              address_1: "Endereço a definir",
              postal_code: "85900-000",
              province: "PR",
            },
          },
        ],
      },
    })
    stockLocation = result[0]
    logger.info(`[DX] Stock location Toledo criada: ${stockLocation.id}`)

    // Link com o fulfillment provider manual
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })
    // Link com sales channel
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [salesChannel.id] },
    })
  } else {
    logger.info(`[DX] Stock location Toledo já existe: ${stockLocation.id}`)
  }

  // 6) Fulfillment set BR + Shipping Options ----------------------------
  const fulfillmentSvc = container.resolve(Modules.FULFILLMENT)

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfiles[0]

  const existingSets = await fulfillmentSvc.listFulfillmentSets({
    name: "DX Automotive - Brasil",
  })
  let fulfillmentSet = existingSets[0]
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentSvc.createFulfillmentSets({
      name: "DX Automotive - Brasil",
      type: "shipping",
      service_zones: [
        {
          name: "Brasil - Todo território",
          geo_zones: [{ country_code: "br", type: "country" }],
        },
      ],
    })
    logger.info(`[DX] Fulfillment set BR criado: ${fulfillmentSet.id}`)

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "PAC (Correios)",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: { label: "PAC", description: "5 a 9 dias úteis", code: "pac" },
          prices: [{ region_id: region.id, amount: 28 }],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
        {
          name: "SEDEX (Correios)",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "SEDEX",
            description: "2 a 4 dias úteis",
            code: "sedex",
          },
          prices: [{ region_id: region.id, amount: 48 }],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })
    logger.info("[DX] Shipping options PAC + SEDEX criados")
  } else {
    logger.info(`[DX] Fulfillment set BR já existe: ${fulfillmentSet.id}`)
  }

  // 7) Publishable API Key ----------------------------------------------
  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "token", "type"],
  })
  let publishableKey = keys.find(
    (k) => k.type === "publishable" && k.title === "DX Storefront"
  )
  if (!publishableKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "DX Storefront",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    })
    publishableKey = result[0]
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: publishableKey.id, add: [salesChannel.id] },
    })
    logger.info(`[DX] Publishable key criada: ${publishableKey.token}`)
  } else {
    logger.info(`[DX] Publishable key já existe: ${publishableKey.token}`)
  }

  // 8) Categorias -------------------------------------------------------
  const dxCategories = [
    { name: "Multimídia", handle: "multimidia" },
    { name: "Molduras", handle: "molduras" },
    { name: "Câmera de ré", handle: "camera-de-re" },
    { name: "Sensor de estacionamento", handle: "sensor-de-estacionamento" },
  ]

  const { data: existingCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  })

  const toCreate = dxCategories.filter(
    (c) => !existingCats.some((e) => e.handle === c.handle)
  )

  let categories = existingCats.filter((e) =>
    dxCategories.some((c) => c.handle === e.handle)
  )

  if (toCreate.length > 0) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: toCreate.map((c) => ({
          name: c.name,
          handle: c.handle,
          is_active: true,
        })),
      },
    })
    categories = [...categories, ...result]
    logger.info(`[DX] Categorias criadas: ${result.map((c) => c.name).join(", ")}`)
  } else {
    logger.info("[DX] Todas as categorias DX já existem")
  }

  const multimidiaCategory = categories.find((c) => c.handle === "multimidia")

  // 9) Produto de teste -------------------------------------------------
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })
  let product = products.find(
    (p) => p.handle === "multimidia-android-toyota-corolla-2018-2022-tela-9"
  )
  if (!product && multimidiaCategory) {
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title:
              "Central Multimídia Android Toyota Corolla 2018-2022 Tela 9 Polegadas",
            handle: "multimidia-android-toyota-corolla-2018-2022-tela-9",
            description:
              "Central multimídia Android com tela de 9 polegadas, compatível com CarPlay e Android Auto sem fio. Câmera de ré inclusa, 2GB RAM + 32GB ROM, GPS embarcado, Bluetooth 5.0 e WiFi. Plug & play — não corta nenhum chicote original do Corolla 2018 a 2022.",
            category_ids: [multimidiaCategory.id],
            weight: 4500,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            sales_channels: [{ id: salesChannel.id }],
            options: [{ title: "Padrão", values: ["Único"] }],
            variants: [
              {
                title: "Único",
                sku: "DX-MM-TOY-COR-9P",
                manage_inventory: true,
                options: { Padrão: "Único" },
                prices: [{ amount: 1899, currency_code: "brl" }],
              },
            ],
          },
        ],
      },
    })
    product = result[0]
    logger.info(`[DX] Produto teste criado: ${product.id}`)
  } else if (product) {
    logger.info(`[DX] Produto teste já existe: ${product.id}`)
  }

  // 10) Veículos demo ---------------------------------------------------
  const vehicleSvc = container.resolve<VehicleCompatibilityModuleService>(
    VEHICLE_COMPATIBILITY_MODULE
  )

  const demoVehicles = [
    { make: "Toyota", model: "Corolla", year: 2018, body_type: "sedan" },
    { make: "Toyota", model: "Corolla", year: 2019, body_type: "sedan" },
    { make: "Toyota", model: "Corolla", year: 2020, body_type: "sedan" },
    { make: "Toyota", model: "Corolla", year: 2021, body_type: "sedan" },
    { make: "Toyota", model: "Corolla", year: 2022, body_type: "sedan" },
    { make: "Honda", model: "Civic", year: 2018, body_type: "sedan" },
    { make: "Honda", model: "Civic", year: 2019, body_type: "sedan" },
    { make: "Volkswagen", model: "Polo", year: 2020, body_type: "hatch" },
    { make: "Volkswagen", model: "Polo", year: 2021, body_type: "hatch" },
    { make: "Hyundai", model: "HB20", year: 2020, body_type: "hatch" },
  ]

  const allVehicles = await vehicleSvc.listVehicles({}, { take: 1000 })
  const existingSlugs = new Set(allVehicles.map((v) => v.slug))

  const newVehiclesData = demoVehicles
    .map((v) => ({
      ...v,
      slug: VehicleCompatibilityModuleService.slugify(v.make, v.model, v.year),
      trim: null,
      notes: null,
    }))
    .filter((v) => !existingSlugs.has(v.slug))

  let createdVehicles: Array<{ id: string; slug: string }> = []
  if (newVehiclesData.length > 0) {
    createdVehicles = await vehicleSvc.createVehicles(newVehiclesData)
    logger.info(`[DX] ${createdVehicles.length} veículos demo criados`)
  } else {
    logger.info("[DX] Veículos demo já existem")
  }

  // 11) Link produto ↔ veículos compatíveis -----------------------------
  if (product) {
    const corollaVehicles = allVehicles
      .concat(createdVehicles as never)
      .filter(
        (v: { make?: string; model?: string }) =>
          v.make === "Toyota" && v.model === "Corolla"
      )

    // Verifica quais já estão linkados
    const { data: productWithVehicles } = await query.graph({
      entity: "product",
      fields: ["id", "vehicles.id"],
      filters: { id: product.id },
    })
    const linkedIds = new Set(
      ((productWithVehicles[0] as { vehicles?: Array<{ id: string }> })
        ?.vehicles ?? []).map((v) => v.id)
    )

    const toLink = corollaVehicles
      .map((v: { id: string }) => v.id)
      .filter((id: string) => !linkedIds.has(id))

    if (toLink.length > 0) {
      await link.create(
        toLink.map((vid) => ({
          [Modules.PRODUCT]: { product_id: product.id },
          [VEHICLE_COMPATIBILITY_MODULE]: { vehicle_id: vid },
        }))
      )
      logger.info(`[DX] ${toLink.length} veículos linkados ao produto teste`)
    } else {
      logger.info("[DX] Produto teste já tem links de veículos")
    }
  }

  // 12) Resumo final ----------------------------------------------------
  logger.info("")
  logger.info("✅ Bootstrap concluído!")
  logger.info("")
  logger.info("Atualize o storefront em apps/storefront/.env.local:")
  logger.info(`  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey.token}`)
  logger.info("")
  logger.info("Reinicie o storefront (porta 8001) para a key entrar em vigor.")
  logger.info("")
  logger.info(`Storefront: http://localhost:8001/br`)
  logger.info(`Admin:      http://localhost:9001/app/login`)
}
