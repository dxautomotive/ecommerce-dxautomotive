import { MedusaService } from "@medusajs/framework/utils"
import { Menu } from "./models/menu"
import { MenuItem } from "./models/menu-item"

class NavigationMenusModuleService extends MedusaService({
  Menu,
  MenuItem,
}) {}

export default NavigationMenusModuleService
