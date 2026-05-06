import { Module } from "@medusajs/framework/utils"
import ProductRelationshipsModuleService from "./service"

export const PRODUCT_RELATIONSHIPS_MODULE = "product_relationships"

export default Module(PRODUCT_RELATIONSHIPS_MODULE, {
  service: ProductRelationshipsModuleService,
})
