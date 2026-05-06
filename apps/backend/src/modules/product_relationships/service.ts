import { MedusaService } from "@medusajs/framework/utils"
import { ProductRelationship } from "./models/product-relationship"

class ProductRelationshipsModuleService extends MedusaService({
  ProductRelationship,
}) {}

export default ProductRelationshipsModuleService
