import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"
import { PRODUCT_REVIEWS_MODULE } from "../../../../../modules/product_reviews"
import ProductReviewsModuleService from "../../../../../modules/product_reviews/service"

type CreateReviewBody = {
  rating?: number
  title?: string
  body?: string
  author_name?: string
  author_email?: string
  /**
   * Imagens em formato dataURL (`data:image/jpeg;base64,...`). Máx 4 arquivos,
   * 5MB cada antes da decodificação. Server processa com sharp:
   * resize até 1280px (preservando proporção) + WebP quality 82.
   */
  images?: string[]
}

const sanitize = (s: unknown, max = 2000): string | null => {
  if (typeof s !== "string") return null
  const trimmed = s.trim().slice(0, max)
  return trimmed.length > 0 ? trimmed : null
}

const MAX_IMAGES = 4
const MAX_IMAGE_BYTES_RAW = 5 * 1024 * 1024 // 5MB cada antes da conversão
const TARGET_DIM = 1280
const WEBP_QUALITY = 82

const UPLOADS_DIR = path.join(process.cwd(), "static", "uploads", "reviews")

/**
 * Decodifica dataURL `data:image/...;base64,XXXX` → Buffer.
 * Aceita JPEG/PNG/HEIC/WebP. Rejeita o resto.
 */
function decodeDataUrl(s: string): Buffer | null {
  const m = /^data:image\/(jpeg|jpg|png|webp|heic|heif);base64,(.+)$/i.exec(
    s.trim()
  )
  if (!m) return null
  try {
    return Buffer.from(m[2], "base64")
  } catch {
    return null
  }
}

async function processAndSaveImage(
  dataUrl: string,
  reviewId: string,
  idx: number
): Promise<string | null> {
  const raw = decodeDataUrl(dataUrl)
  if (!raw) return null
  if (raw.length > MAX_IMAGE_BYTES_RAW) return null

  // Garante que o diretório existe
  await fs.mkdir(UPLOADS_DIR, { recursive: true })

  // Hash do conteúdo pra dedupe + nome estável
  const hash = crypto
    .createHash("sha1")
    .update(raw)
    .digest("hex")
    .slice(0, 10)

  const filename = `${reviewId}-${idx}-${hash}.webp`
  const filepath = path.join(UPLOADS_DIR, filename)

  await sharp(raw)
    .rotate() // respeita EXIF orientation, depois remove EXIF
    .resize({
      width: TARGET_DIM,
      height: TARGET_DIM,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(filepath)

  return `/uploads/reviews/${filename}`
}

/**
 * GET /store/products/:id/reviews
 *
 * Lista reviews **aprovadas** do produto (status=approved). Ordenadas por
 * `created_at DESC`. Inclui um pequeno agregado `summary` (count + média +
 * distribuição por estrela + with_media_count).
 *
 * Filtros:
 *  - ?with_media=true  → só reviews que têm pelo menos 1 imagem/vídeo
 *  - ?with_media=false → só reviews sem mídia
 *  - ?rating=5         → filtra por nota exata (1-5)
 *  - ?limit/?offset
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )

  const limit = Math.min(parseInt((req.query.limit as string) ?? "20", 10), 50)
  const offset = parseInt((req.query.offset as string) ?? "0", 10)
  const withMedia = req.query.with_media as string | undefined
  const ratingFilter =
    typeof req.query.rating === "string" && /^[1-5]$/.test(req.query.rating)
      ? Number(req.query.rating)
      : null

  // Pega TODAS aprovadas (até 5000) — usa pra summary, distribution, with_media_count
  // e como base do filtro client-style. Em escala maior, virar query SQL com filtros.
  const allApproved = await service.listReviews(
    { product_id: req.params.id, status: "approved" },
    { take: 5000, order: { created_at: "DESC" } as never }
  )

  const total = allApproved.length
  const avg =
    total === 0
      ? 0
      : Math.round(
          (allApproved.reduce((s, r) => s + (r.rating ?? 0), 0) / total) * 10
        ) / 10
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }
  let withMediaCount = 0
  for (const r of allApproved) {
    const k = Math.max(1, Math.min(5, Math.round(r.rating ?? 0))) as 1 | 2 | 3 | 4 | 5
    distribution[k]++
    const imgs = (r as unknown as { images?: unknown }).images
    if (Array.isArray(imgs) && imgs.length > 0) withMediaCount++
  }

  // Aplica filtros e paginação
  let filtered = allApproved
  if (ratingFilter !== null) {
    filtered = filtered.filter(
      (r) => Math.round(r.rating ?? 0) === ratingFilter
    )
  }
  if (withMedia === "true") {
    filtered = filtered.filter((r) => {
      const imgs = (r as unknown as { images?: unknown }).images
      return Array.isArray(imgs) && imgs.length > 0
    })
  } else if (withMedia === "false") {
    filtered = filtered.filter((r) => {
      const imgs = (r as unknown as { images?: unknown }).images
      return !Array.isArray(imgs) || imgs.length === 0
    })
  }

  const count = filtered.length
  const paged = filtered.slice(offset, offset + limit)

  return res.json({
    reviews: paged.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      author_name: r.author_name,
      verified_purchase: r.verified_purchase,
      helpful_count: r.helpful_count,
      images: Array.isArray((r as unknown as { images?: unknown }).images)
        ? ((r as unknown as { images: string[] }).images)
        : [],
      created_at: (r as unknown as { created_at?: Date }).created_at,
    })),
    count,
    summary: {
      total,
      average: avg,
      distribution,
      with_media: withMediaCount,
      without_media: total - withMediaCount,
    },
    limit,
    offset,
  })
}

/**
 * POST /store/products/:id/reviews
 *
 * Endpoint público pra cliente postar review. Sempre cai com status `pending`
 * (admin modera depois). Aceita até 4 imagens em base64 dataURL no campo
 * `images[]` — server processa com sharp e salva como WebP. Vídeos virão
 * quando a infra (R2 + ffmpeg) estiver disponível.
 *
 * Cria também o link Product↔Review pra que `query.graph` consiga retornar.
 */
export async function POST(
  req: MedusaRequest<CreateReviewBody>,
  res: MedusaResponse
) {
  const service = req.scope.resolve<ProductReviewsModuleService>(
    PRODUCT_REVIEWS_MODULE
  )
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Verifica que o produto existe
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { id: req.params.id },
  })
  if (products.length === 0) {
    return res.status(404).json({ error: "product_not_found" })
  }

  const b = req.body ?? {}
  const rating = typeof b.rating === "number" ? Math.round(b.rating) : NaN
  const title = sanitize(b.title, 120)
  const body = sanitize(b.body, 4000)
  const authorName = sanitize(b.author_name, 80)

  if (!rating || rating < 1 || rating > 5 || !title || !body || !authorName) {
    return res.status(400).json({
      error: "validation_error",
      message:
        "rating (1-5), title, body e author_name são obrigatórios",
    })
  }

  // Cria review primeiro pra ter um id estável que vira parte do filename
  const [review] = await service.createReviews([
    {
      product_id: req.params.id,
      rating,
      title,
      body,
      author_name: authorName,
      author_email: sanitize(b.author_email, 200),
      status: "pending",
      verified_purchase: false,
    },
  ])

  await link.create({
    [Modules.PRODUCT]: { product_id: req.params.id },
    [PRODUCT_REVIEWS_MODULE]: { review_id: review.id },
  })

  // Processa imagens (best-effort: se uma falhar, ignora)
  const incomingImages = Array.isArray(b.images)
    ? b.images.slice(0, MAX_IMAGES).filter((s) => typeof s === "string")
    : []
  const savedUrls: string[] = []
  for (let i = 0; i < incomingImages.length; i++) {
    const url = await processAndSaveImage(incomingImages[i], review.id, i).catch(
      () => null
    )
    if (url) savedUrls.push(url)
  }

  if (savedUrls.length > 0) {
    await service.updateReviews({ id: review.id, images: savedUrls })
  }

  return res.status(201).json({
    id: review.id,
    status: review.status,
    images_processed: savedUrls.length,
    message: "Avaliação enviada para moderação",
  })
}
