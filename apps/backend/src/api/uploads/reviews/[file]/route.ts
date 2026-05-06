import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { promises as fs } from "fs"
import path from "path"

/**
 * GET /uploads/reviews/:file
 *
 * Serve arquivos WebP processados pelo POST `/store/products/:id/reviews`.
 *
 * Em dev, armazena em `apps/backend/static/uploads/reviews/`. Em produção
 * (Sessão 10 cliente), trocar por R2 (Cloudflare) — basta substituir esta
 * rota por redirect 302 para a URL R2 + signed token, ou bypass via DNS.
 *
 * Path traversal é prevenido com `path.basename()` antes de juntar.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const file = path.basename(req.params.file ?? "")
  if (!file || !/^[\w.-]+\.(webp|jpg|jpeg|png)$/i.test(file)) {
    return res.status(404).json({ error: "not_found" })
  }

  const filepath = path.join(
    process.cwd(),
    "static",
    "uploads",
    "reviews",
    file
  )

  try {
    const buf = await fs.readFile(filepath)
    const ext = path.extname(file).toLowerCase()
    const ct =
      ext === ".webp"
        ? "image/webp"
        : ext === ".png"
          ? "image/png"
          : "image/jpeg"
    res.setHeader("Content-Type", ct)
    // Cache 30 dias (imagens de review são imutáveis após criação — o filename
    // inclui hash do conteúdo, então qualquer mudança gera URL nova)
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable")
    return res.end(buf)
  } catch {
    return res.status(404).json({ error: "not_found" })
  }
}
