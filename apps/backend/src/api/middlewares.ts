import { defineMiddlewares } from "@medusajs/framework/http"

/**
 * Define middlewares custom para rotas adicionais do backend DX.
 *
 * - `/store/atacado-leads` (POST): rota pública sem necessidade de
 *   publishable API key. É um formulário público de captação de B2B.
 *
 * - `/store/vehicles` (GET): rota pública para listar marcas/modelos/anos
 *   compatíveis. Usado pelo filtro do storefront.
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/atacado-leads",
      method: ["POST"],
      bodyParser: { sizeLimit: "10kb" },
    },
    {
      matcher: "/store/vehicles*",
      method: ["GET"],
    },
    {
      matcher: "/store/products/:id/vehicles",
      method: ["GET"],
    },
    {
      matcher: "/store/products/by-vehicle",
      method: ["GET"],
    },
    {
      matcher: "/store/page-builder/:template",
      method: ["GET"],
    },
    {
      // POST de review aceita até 4 imagens base64 dataURL no body —
      // ~5MB cada após base64 = ~6.7MB; multiplica por 4 = ~27MB. 32MB de folga.
      matcher: "/store/products/:id/reviews",
      method: ["POST"],
      bodyParser: { sizeLimit: "32mb" },
    },
  ],
})
