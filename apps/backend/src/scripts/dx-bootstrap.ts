import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
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
  updateCollectionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { VEHICLE_COMPATIBILITY_MODULE } from "../modules/vehicle_compatibility"
import VehicleCompatibilityModuleService from "../modules/vehicle_compatibility/service"
import { NAVIGATION_MENUS_MODULE } from "../modules/navigation_menus"
import NavigationMenusModuleService from "../modules/navigation_menus/service"
import { buildDefaultHomeTemplate } from "../page-builder/default-templates"

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
    fields: ["id", "name", "type"],
  })
  const shippingProfile = shippingProfiles[0] as {
    id: string
    name?: string
    type?: string
  }

  // Renomeia o shipping profile default pra pt-BR (Medusa cria como "Default Shipping Profile").
  // Usamos SQL direto porque `fulfillmentSvc.updateShippingProfiles({ id, name })`
  // retorna OK mas não persistiu na nossa testagem (provavelmente bug de signature
  // do MedusaService factory para ShippingProfile). Knex bypass é seguro pra essa
  // operação simples e idempotente.
  if (
    shippingProfile.name === "Default Shipping Profile" ||
    !shippingProfile.name
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const knex: any = container.resolve("__pg_connection__" as never)
    await knex.raw(
      `UPDATE shipping_profile SET name = 'Padrão', updated_at = NOW() WHERE id = ?`,
      [shippingProfile.id]
    )
    logger.info("[DX] Shipping profile renomeado pra 'Padrão' (via SQL)")
  }

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

  // 8b) Coleções DX -----------------------------------------------------
  // Coleções são agrupamentos transversais por critério de marketing
  // (não confundir com categorias hierárquicas). Os custom fields ficam
  // em `metadata` (jsonb) — admin edita via widget; storefront lê via
  // /store/collections.
  type DXCollectionSeed = {
    title: string
    handle: string
    metadata: {
      subtitle: string
      gradient_from: string
      gradient_to: string
      gradient_deg: number
      cta_label: string
      cta_url: string | null
      layout: "vertical" | "horizontal"
      is_featured: boolean
      display_order: number
      image_url: string | null
    }
  }

  const dxCollections: DXCollectionSeed[] = [
    {
      title: "Mais vendidos",
      handle: "mais-vendidos",
      metadata: {
        subtitle: "O que mais sai da prateleira",
        gradient_from: "#1e40af",
        gradient_to: "#0ea5e9",
        gradient_deg: 135,
        cta_label: "Ver todos →",
        cta_url: null,
        layout: "vertical",
        is_featured: true,
        display_order: 1,
        image_url: null,
      },
    },
    {
      title: "Lançamentos",
      handle: "lancamentos",
      metadata: {
        subtitle: "Acabou de chegar no estoque",
        gradient_from: "#7c3aed",
        gradient_to: "#ec4899",
        gradient_deg: 120,
        cta_label: "Conferir →",
        cta_url: null,
        layout: "vertical",
        is_featured: true,
        display_order: 2,
        image_url: null,
      },
    },
    {
      title: "Linha Premium DX",
      handle: "linha-premium",
      metadata: {
        subtitle: "Audi · BMW · Mercedes · Toyota Original Look",
        gradient_from: "#0f172a",
        gradient_to: "#475569",
        gradient_deg: 145,
        cta_label: "Explorar →",
        cta_url: null,
        layout: "horizontal",
        is_featured: true,
        display_order: 3,
        image_url: null,
      },
    },
    {
      title: "Frete grátis",
      handle: "frete-gratis",
      metadata: {
        subtitle: "Compre acima de R$ 499 e receba sem custo de frete",
        gradient_from: "#16a34a",
        gradient_to: "#84cc16",
        gradient_deg: 120,
        cta_label: "Ver promoções →",
        cta_url: null,
        layout: "vertical",
        is_featured: false,
        display_order: 4,
        image_url: null,
      },
    },
  ]

  const { data: existingCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "title", "handle", "metadata"],
  })

  const collectionsToCreate = dxCollections.filter(
    (c) => !existingCollections.some((e) => e.handle === c.handle)
  )
  const allCollections: Array<{ id: string; handle: string }> = [
    ...existingCollections.filter((e) =>
      dxCollections.some((c) => c.handle === e.handle)
    ),
  ]

  if (collectionsToCreate.length > 0) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: {
        collections: collectionsToCreate.map((c) => ({
          title: c.title,
          handle: c.handle,
          metadata: c.metadata,
        })),
      },
    })
    allCollections.push(...result.map((r) => ({ id: r.id, handle: r.handle! })))
    logger.info(
      `[DX] Coleções criadas: ${result.map((c) => c.handle).join(", ")}`
    )
  } else {
    logger.info("[DX] Todas as coleções DX já existem")
  }

  // Atualiza metadata das que já existiam (idempotente: garante que
  // mudanças no seed sobrescrevam o que está no banco)
  for (const seed of dxCollections) {
    const existing = existingCollections.find((e) => e.handle === seed.handle)
    if (!existing) continue

    const currentMeta = (existing.metadata ?? {}) as Record<string, unknown>
    const needsUpdate = Object.entries(seed.metadata).some(
      ([k, v]) => currentMeta[k] !== v
    )
    if (!needsUpdate) continue

    await updateCollectionsWorkflow(container).run({
      input: {
        selector: { id: existing.id },
        update: { metadata: seed.metadata },
      },
    })
    logger.info(`[DX] Metadata atualizada para coleção ${seed.handle}`)
  }

  // 9) Produto de teste -------------------------------------------------
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })
  let product = products.find(
    (p) => p.handle === "multimidia-android-toyota-corolla-2018-2022-tela-9"
  )
  const maisVendidos = allCollections.find((c) => c.handle === "mais-vendidos")
  const lancamentos = allCollections.find((c) => c.handle === "lancamentos")
  const linhaPremium = allCollections.find((c) => c.handle === "linha-premium")

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
            collection_id: maisVendidos?.id,
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
    void lancamentos
    void linhaPremium
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

  // 11b) Template inicial da home no page-builder ---------------------
  // Só cria se ainda não existir — não sobrescreve edições do lojista.
  const currentMeta = (store?.metadata ?? {}) as Record<string, unknown>
  if (!currentMeta.page_template_home) {
    const defaultHome = buildDefaultHomeTemplate()
    const newMeta: Record<string, unknown> = {
      ...currentMeta,
      page_template_home: defaultHome,
    }
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { metadata: newMeta },
      },
    })
    logger.info(
      `[DX] Template inicial da home criado em store.metadata (${defaultHome.order.length} blocos)`
    )
  } else {
    logger.info("[DX] Template da home já existe — preservando edições do lojista")
  }

  // 11c) Menus padrão (header / footer-categorias / footer-atendimento) ──
  // Idempotente: cria menu+items só se não existirem (lookup por label dentro
  // do menu). Não sobrescreve edições do lojista.
  const menuSvc = container.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const catByHandle = new Map(
    (categories as Array<{ id: string; handle: string }>).map((c) => [
      c.handle,
      c.id,
    ])
  )

  type SeedItem = {
    label: string
    type: "link" | "category" | "collection" | "external"
    target_handle?: string // categoria/coleção
    target_url?: string
    open_in_new_tab?: boolean
  }
  type SeedMenu = {
    handle: string
    label: string
    position: number
    items: SeedItem[]
  }

  const seedMenus: SeedMenu[] = [
    {
      handle: "header",
      label: "Menu principal",
      position: 0,
      items: [
        { label: "Multimídia", type: "category", target_handle: "multimidia" },
        { label: "Molduras", type: "category", target_handle: "molduras" },
        { label: "Câmera de Ré", type: "category", target_handle: "camera-de-re" },
        {
          label: "Sensor",
          type: "category",
          target_handle: "sensor-de-estacionamento",
        },
        { label: "Coleções", type: "link", target_url: "/colecoes" },
        { label: "Atacado", type: "link", target_url: "/atacado" },
      ],
    },
    {
      handle: "footer-categorias",
      label: "Footer · Categorias",
      position: 1,
      items: [
        { label: "Multimídia", type: "category", target_handle: "multimidia" },
        { label: "Molduras", type: "category", target_handle: "molduras" },
        { label: "Câmera de Ré", type: "category", target_handle: "camera-de-re" },
        {
          label: "Sensor",
          type: "category",
          target_handle: "sensor-de-estacionamento",
        },
      ],
    },
    {
      handle: "footer-atendimento",
      label: "Footer · Atendimento",
      position: 2,
      items: [
        { label: "Atacado / Revenda", type: "link", target_url: "/atacado" },
        { label: "Política de privacidade", type: "link", target_url: "/politicas/privacidade" },
        { label: "Política de trocas", type: "link", target_url: "/politicas/trocas" },
        { label: "Termos de uso", type: "link", target_url: "/politicas/termos" },
      ],
    },
  ]

  // Resolver collection ids por handle pra eventuais items de coleção
  const colByHandle = new Map(
    allCollections.map((c) => [c.handle, c.id])
  )

  const existingMenus = await menuSvc.listMenus({}, { take: 100 })
  const menuByHandle = new Map(existingMenus.map((m) => [m.handle, m]))

  for (const seed of seedMenus) {
    let menu = menuByHandle.get(seed.handle)
    if (!menu) {
      const [created] = await menuSvc.createMenus([
        {
          handle: seed.handle,
          label: seed.label,
          position: seed.position,
          is_default: true,
        },
      ])
      menu = created
      logger.info(`[DX] Menu '${seed.handle}' criado (is_default)`)
    } else if (!(menu as { is_default?: boolean }).is_default) {
      // Idempotência: marca menus seedados antigos como default na próxima rodada
      await menuSvc.updateMenus({ id: menu.id, is_default: true })
      logger.info(`[DX] Menu '${seed.handle}' marcado como is_default=true`)
    }

    const existingItems = await menuSvc.listMenuItems(
      { menu_id: menu.id },
      { take: 200 }
    )
    const existingLabels = new Set(existingItems.map((i) => i.label))

    const itemsToCreate = seed.items
      .filter((it) => !existingLabels.has(it.label))
      .map((it, idx) => {
        const target_id =
          it.type === "category"
            ? catByHandle.get(it.target_handle ?? "") ?? null
            : it.type === "collection"
            ? colByHandle.get(it.target_handle ?? "") ?? null
            : null
        return {
          menu_id: menu!.id,
          parent_item_id: null,
          label: it.label,
          type: it.type,
          target_id,
          target_url: it.target_url ?? null,
          position: existingItems.length + idx,
          open_in_new_tab: it.open_in_new_tab === true,
        }
      })
      .filter((it) => {
        // descarta items de category/collection cujo handle não existe
        if (it.type === "category" || it.type === "collection") {
          if (!it.target_id) {
            logger.warn(
              `[DX] Menu '${seed.handle}': item '${it.label}' ignorado — target não encontrado`
            )
            return false
          }
        }
        return true
      })

    if (itemsToCreate.length > 0) {
      await menuSvc.createMenuItems(itemsToCreate)
      logger.info(
        `[DX] Menu '${seed.handle}': ${itemsToCreate.length} items criados`
      )
    } else {
      logger.info(`[DX] Menu '${seed.handle}': items já existem`)
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
