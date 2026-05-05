import { model } from "@medusajs/framework/utils"

/**
 * Lead capturado pela página /atacado da loja DX Automotive.
 *
 * Status workflow:
 *  - `new`        → recém capturado, ainda não atendido
 *  - `contacted`  → atendente já entrou em contato
 *  - `quoted`     → cotação enviada
 *  - `won`        → fechou pedido (manual ou via /atacado)
 *  - `lost`       → desistiu / não compatível
 *  - `spam`       → marcado como spam/teste
 */
export const AtacadoLead = model.define("atacado_lead", {
  id: model.id({ prefix: "alead" }).primaryKey(),
  name: model.text(),
  company: model.text().nullable(),
  cnpj: model.text().nullable(),
  email: model.text(),
  phone: model.text(),
  city: model.text().nullable(),
  province: model.text().nullable(),
  segment: model.text().nullable(),
  monthly_volume: model.text().nullable(),
  message: model.text().nullable(),
  status: model
    .enum(["new", "contacted", "quoted", "won", "lost", "spam"])
    .default("new"),
  source: model.text().default("website"),
  internal_notes: model.text().nullable(),
})
