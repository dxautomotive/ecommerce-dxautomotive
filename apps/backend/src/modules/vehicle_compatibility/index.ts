import { Module } from "@medusajs/framework/utils"
import VehicleCompatibilityModuleService from "./service"

export const VEHICLE_COMPATIBILITY_MODULE = "vehicle_compatibility"

export default Module(VEHICLE_COMPATIBILITY_MODULE, {
  service: VehicleCompatibilityModuleService,
})
