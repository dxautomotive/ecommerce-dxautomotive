import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { NAVIGATION_MENUS_MODULE } from "../modules/navigation_menus"
import NavigationMenusModuleService from "../modules/navigation_menus/service"

/**
 * Cascade delete: quando um produto é deletado, remove qualquer menu_item
 * com type=product e target_id correspondente. Sem isso, o storefront
 * silenciosamente esconde o item, mas ele continua poluindo o admin.
 */
export default async function cleanupProductMenuItemsHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const orphans = await service.listMenuItems(
    { type: "product", target_id: event.data.id },
    { take: 1000 }
  )

  if (orphans.length === 0) return

  await service.deleteMenuItems(orphans.map((o) => o.id))
  logger.info(
    `[menu-items.cleanup] product ${event.data.id} deletado → ${orphans.length} menu item(s) removido(s)`
  )
}

export const config: SubscriberConfig = {
  event: "product.product.deleted",
}
