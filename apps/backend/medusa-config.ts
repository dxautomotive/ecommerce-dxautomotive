import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  // Admin UI continua em /app (default Medusa). O nginx na frente
  // faz rewrite de /login, /orders, /products etc pra /app/* — assim o
  // usuário vê URL limpa (app.dxautomotive.com.br/login) mas a API REST
  // /admin/users/me continua respondendo JSON, não HTML do admin UI.
  modules: [
    {
      resolve: "./src/modules/atacado_leads",
    },
    {
      resolve: "./src/modules/vehicle_compatibility",
    },
    {
      resolve: "./src/modules/product_reviews",
    },
    {
      resolve: "./src/modules/product_relationships",
    },
    {
      resolve: "./src/modules/navigation_menus",
    },
  ],
})
