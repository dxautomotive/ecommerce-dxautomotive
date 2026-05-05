import { Module } from "@medusajs/framework/utils"
import AtacadoLeadsModuleService from "./service"

export const ATACADO_LEADS_MODULE = "atacado_leads"

export default Module(ATACADO_LEADS_MODULE, {
  service: AtacadoLeadsModuleService,
})
