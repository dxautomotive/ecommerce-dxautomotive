import { MedusaService } from "@medusajs/framework/utils"
import { AtacadoLead } from "./models/atacado-lead"

class AtacadoLeadsModuleService extends MedusaService({
  AtacadoLead,
}) {}

export default AtacadoLeadsModuleService
