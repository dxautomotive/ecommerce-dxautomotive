"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return await sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"
  // Garante que metadata venha no payload — usado pelo storefront DX
  // pra render do <FeaturedCollection> (gradient, CTA, layout, etc).
  queryParams.fields = queryParams.fields || "id,title,handle,metadata"

  return await sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        next,
        cache: "force-cache",
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection | null> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "id,title,handle,metadata,*products" },
      next,
      cache: "force-cache",
    })
    .then(({ collections }) => collections[0] || null)
}

/**
 * Lista as coleções marcadas como `is_featured=true` nos metadados,
 * ordenadas por `display_order` ascendente. Usado pela home pra
 * decidir quais blocos `<FeaturedCollection>` renderizar.
 *
 * Tipo `DXCollectionMeta` e helper `getDXMeta` ficam em
 * `lib/util/collection-meta.ts` (sync) — não podem morar aqui porque
 * este arquivo é "use server" e exige tudo async.
 */
export const listFeaturedCollections = async (): Promise<
  HttpTypes.StoreCollection[]
> => {
  const { getDXMeta } = await import("@lib/util/collection-meta")
  const { collections } = await listCollections({ limit: "100" })
  return collections
    .filter((c) => getDXMeta(c).is_featured === true)
    .sort(
      (a, b) =>
        (getDXMeta(a).display_order ?? 999) -
        (getDXMeta(b).display_order ?? 999)
    )
}
