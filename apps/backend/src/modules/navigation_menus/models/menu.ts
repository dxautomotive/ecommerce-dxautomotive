import { model } from "@medusajs/framework/utils"

/**
 * Menu de navegação da loja.
 *
 * Há vários menus possíveis identificados por `handle` único:
 *  - `header`              → barra principal de navegação (Multimídia, Molduras, etc)
 *  - `footer-categorias`   → coluna "Categorias" do footer
 *  - `footer-atendimento`  → coluna "Atendimento" do footer
 *  - `mobile-side`         → menu lateral em mobile (off-canvas)
 *
 * O storefront fetcha `GET /store/menus/:handle` pra renderizar.
 */
export const Menu = model.define("menu", {
  id: model.id({ prefix: "menu" }).primaryKey(),
  handle: model.text().unique(),
  label: model.text(),
  /** Posição entre menus do mesmo escopo (informativo, raramente usado) */
  position: model.number().default(0),
  /**
   * Menus seedados pelo bootstrap (header, footer-categorias, footer-atendimento)
   * ganham `is_default = true` pra impedir exclusão acidental no admin.
   * Items do menu seguem editáveis livremente.
   */
  is_default: model.boolean().default(false),
})
