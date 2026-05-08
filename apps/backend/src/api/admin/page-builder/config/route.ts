import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /admin/page-builder/config
 *
 * Retorna configurações do editor visual usadas pelo admin UI client-side.
 * STOREFRONT_URL define onde o iframe de preview aponta.
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  return res.json({
    storefrontUrl: process.env.STOREFRONT_URL ?? "http://localhost:8001",
  })
}
