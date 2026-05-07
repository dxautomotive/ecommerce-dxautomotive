import { Module } from "@medusajs/framework/utils"
import NavigationMenusModuleService from "./service"

export const NAVIGATION_MENUS_MODULE = "navigation_menus"

export default Module(NAVIGATION_MENUS_MODULE, {
  service: NavigationMenusModuleService,
})
