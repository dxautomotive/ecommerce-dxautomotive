import { model } from "@medusajs/framework/utils"

/**
 * Veículo compatível com produtos da DX Automotive.
 *
 * Granularidade: marca + modelo + ano. A combinação dos 3 é o que
 * define um "veículo" único no domínio (uma multimídia pode ser
 * compatível com vários veículos via link N:N).
 *
 * `slug` é gerado a partir de marca-modelo-ano para URLs e lookups.
 */
export const Vehicle = model
  .define("vehicle", {
    id: model.id({ prefix: "veh" }).primaryKey(),
    make: model.text(), // ex: "Toyota"
    model: model.text(), // ex: "Corolla"
    year: model.number(), // ex: 2020
    slug: model.text(), // ex: "toyota-corolla-2020"
    trim: model.text().nullable(), // ex: "Altis", "XEi" — opcional
    body_type: model.text().nullable(), // sedan, hatch, suv, picape...
    notes: model.text().nullable(), // observações internas (ex: chicote específico)
  })
  .indexes([
    { on: ["slug"], unique: true },
    { on: ["make", "model", "year"] },
  ])
