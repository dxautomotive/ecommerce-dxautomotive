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
