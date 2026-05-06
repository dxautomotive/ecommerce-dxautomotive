import { MedusaService } from "@medusajs/framework/utils"
import { Review } from "./models/review"

class ProductReviewsModuleService extends MedusaService({
  Review,
}) {}

export default ProductReviewsModuleService
