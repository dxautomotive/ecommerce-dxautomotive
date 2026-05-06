import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_RELATIONSHIPS_MODULE } from "../../../../../modules/product_relationships"
import ProductRelationshipsModuleService from "../../../../../modules/product_relationships/service"

const ALLOWED_TYPES = ["related", "bundle"] as const
type RelType = (typeof ALLOWED_TYPES)[number]

// Limites por tipo. Produtos Relacionados foi descontinuado — o storefront
// agora puxa automático pela coleção. O tipo continua no banco pra não quebrar
// dados existentes, mas novos POST são bloqueados.
const TYPE_MAX: Record<RelType, number> = {
  related: 0, // descontinuado pra novos POST
  bundle: 3, // máximo 3 produtos vinculados além do produto-base
}

/**
 * GET /admin/products/:id/relationships?type=related|bundle
 *
 * Lista as relações daquele produto. Sem `?type` retorna todas.
 * Enriquece com `target_product` (id, title, thumbnail, handle) num único hit.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductRelationshipsModuleService>(
    PRODUCT_RELATIONSHIPS_MODULE
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const filters: Record<string, unknown> = {
    source_product_id: req.params.id,
  }
  const type = req.query.type as string | undefined
  if (type && (ALLOWED_TYPES as readonly string[]).includes(type)) {
    filters.relationship_type = type
  }

  const rels = await service.listProductRelationships(filters, {
    take: 200,
    order: { position: "ASC", created_at: "ASC" } as never,
  })

  // Enriquece com produto target em batch
  const targetIds = Array.from(new Set(rels.map((r) => r.target_product_id)))
  const productById = new Map<
    string,
    {
      id: string
      title: string | null
      thumbnail: string | null
      handle: string | null
      status: string | null
    }
  >()
  if (targetIds.length > 0) {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "thumbnail", "handle", "status"],
      filters: { id: targetIds },
    })
    for (const p of products) {
      productById.set(p.id as string, p as never)
    }
  }

  const enriched = rels.map((r) => ({
    ...r,
    target_product: productById.get(r.target_product_id) ?? null,
  }))

  return res.json({ relationships: enriched, count: enriched.length })
}

type PostBody = {
  target_product_id?: string
  relationship_type?: RelType
  position?: number
}

/**
 * POST /admin/products/:id/relationships
 *
 * Adiciona uma relação. Idempotente: se já existir uma linha com o mesmo
 * (source, target, type), retorna a existente em vez de duplicar.
 */
export async function POST(req: MedusaRequest<PostBody>, res: MedusaResponse) {
  const service = req.scope.resolve<ProductRelationshipsModuleService>(
    PRODUCT_RELATIONSHIPS_MODULE
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const b = req.body ?? {}
  const targetId = b.target_product_id?.trim()
  const type = b.relationship_type ?? "related"
  const position = typeof b.position === "number" ? b.position : 0

  if (!targetId) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "target_product_id é obrigatório" })
  }
  if (!(ALLOWED_TYPES as readonly string[]).includes(type)) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "relationship_type inválido" })
  }
  if (TYPE_MAX[type] === 0) {
    return res.status(400).json({
      error: "type_disabled",
      message:
        "Produtos relacionados agora são automáticos pela coleção do produto. Use 'bundle' para Compre Junto.",
    })
  }
  if (targetId === req.params.id) {
    return res.status(400).json({
      error: "validation_error",
      message: "Produto não pode se relacionar consigo mesmo",
    })
  }

  // Limite por tipo (ex.: bundle máx 3)
  const currentCount = await service.listProductRelationships(
    {
      source_product_id: req.params.id,
      relationship_type: type,
    },
    { take: 100 }
  )
  if (currentCount.length >= TYPE_MAX[type]) {
    return res.status(400).json({
      error: "limit_reached",
      message: `Máximo de ${TYPE_MAX[type]} produtos vinculados como '${type}'`,
    })
  }

  // Verifica que o produto target existe
  const { data: targets } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { id: targetId },
  })
  if (targets.length === 0) {
    return res.status(404).json({ error: "target_not_found" })
  }

  // Idempotência
  const existing = await service.listProductRelationships(
    {
      source_product_id: req.params.id,
      target_product_id: targetId,
      relationship_type: type,
    },
    { take: 1 }
  )
  if (existing.length > 0) {
    return res.status(200).json({ relationship: existing[0], created: false })
  }

  const [rel] = await service.createProductRelationships([
    {
      source_product_id: req.params.id,
      target_product_id: targetId,
      relationship_type: type,
      position,
    },
  ])
  return res.status(201).json({ relationship: rel, created: true })
}
