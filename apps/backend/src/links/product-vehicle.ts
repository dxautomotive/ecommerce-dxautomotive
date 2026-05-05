import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import VehicleCompatibilityModule from "../modules/vehicle_compatibility"

/**
 * Link N:N entre Produto (módulo nativo) e Vehicle (módulo custom).
 *
 * Permite consultar todos os veículos compatíveis com um produto e
 * vice-versa, sem precisar de tabela intermediária explícita — o
 * Medusa cria a tabela de junção automaticamente.
 */
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  {
    linkable: VehicleCompatibilityModule.linkable.vehicle,
    isList: true,
  }
)
