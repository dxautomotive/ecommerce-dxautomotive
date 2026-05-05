import { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  getCollectionByHandle,
  listCollections,
} from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { getDXMeta } from "@lib/util/collection-meta"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCardDX from "@modules/products/components/product-card-dx"
import { StoreRegion } from "@medusajs/types"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
}

export async function generateStaticParams() {
  const { collections } = await listCollections({ limit: "100" }).catch(() => ({
    collections: [],
    count: 0,
  }))

  const countryCodes = await listRegions()
    .then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )
    .catch(() => [])

  if (!collections.length || !countryCodes?.length) return []

  return countryCodes
    .filter(Boolean)
    .flatMap((countryCode) =>
      collections.map((c) => ({
        countryCode: countryCode!,
        handle: c.handle!,
      }))
    )
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params
  const collection = await getCollectionByHandle(handle).catch(() => null)
  if (!collection) notFound()

  const meta = getDXMeta(collection)
  return {
    title: collection.title,
    description:
      meta.subtitle ??
      `${collection.title} — DX Automotive. Pix com 10% off, parcelamento em até 12x e frete para todo o Brasil.`,
    openGraph: {
      title: `${collection.title} | DX Automotive`,
      description: meta.subtitle ?? "",
      locale: "pt_BR",
      type: "website",
    },
  }
}

export default async function CollectionPage(props: Props) {
  const { handle, countryCode } = await props.params

  const [collection, region] = await Promise.all([
    getCollectionByHandle(handle).catch(() => null),
    getRegion(countryCode),
  ])

  if (!collection || !region) notFound()

  const meta = getDXMeta(collection)

  const { response } = await listProducts({
    countryCode,
    queryParams: {
      collection_id: [collection.id],
      limit: 48,
      fields: "*variants.calculated_price",
    },
  })
  const products = response.products

  const gradient = `linear-gradient(${meta.gradient_deg ?? 135}deg, ${
    meta.gradient_from ?? "#1e40af"
  }, ${meta.gradient_to ?? "#0ea5e9"})`

  return (
    <div className="min-h-screen">
      {/* Hero da coleção com gradient + breadcrumb */}
      <header
        className="border-b border-brand-border"
        style={{ background: gradient }}
      >
        <div className="content-container py-10 small:py-16">
          <nav
            aria-label="Caminho"
            className="text-xs text-white/70 mb-4"
          >
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <LocalizedClientLink href="/" className="hover:text-white">
                  Início
                </LocalizedClientLink>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <LocalizedClientLink
                  href="/colecoes"
                  className="hover:text-white"
                >
                  Coleções
                </LocalizedClientLink>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white font-semibold">{collection.title}</li>
            </ol>
          </nav>

          <span className="text-white/80 text-[10px] uppercase tracking-[0.25em] font-bold">
            Coleção
          </span>
          <h1 className="text-3xl small:text-5xl font-extrabold text-white mt-2 leading-tight">
            {collection.title}
          </h1>
          {meta.subtitle && (
            <p className="text-white/85 text-base small:text-lg mt-3 max-w-3xl">
              {meta.subtitle}
            </p>
          )}
          <p className="text-white/70 text-sm mt-4">
            {products.length}{" "}
            {products.length === 1 ? "produto" : "produtos"}
          </p>
        </div>
      </header>

      {/* Grade de produtos */}
      <section className="content-container py-8 small:py-12">
        {products.length === 0 ? (
          <div className="bg-brand-surface border border-brand-border rounded-xl p-12 text-center">
            <p className="text-brand-text font-semibold text-lg">
              Nenhum produto nesta coleção ainda
            </p>
            <p className="text-brand-muted text-sm mt-2">
              Estamos preparando novidades. Volte em breve.
            </p>
            <LocalizedClientLink
              href="/store"
              className="inline-block mt-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              Ver todos os produtos
            </LocalizedClientLink>
          </div>
        ) : (
          <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-4 small:gap-6">
            {products.map((p) => (
              <ProductCardDX key={p.id} product={p} region={region} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
