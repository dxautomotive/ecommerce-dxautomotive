import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { NAVIGATION_MENUS_MODULE } from "../modules/navigation_menus"
import NavigationMenusModuleService from "../modules/navigation_menus/service"

/**
 * Cascade delete: quando uma product_collection é deletada, remove qualquer
 * menu_item com type=collection e target_id correspondente.
 */
export default async function cleanupCollectionMenuItemsHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<NavigationMenusModuleService>(
    NAVIGATION_MENUS_MODULE
  )

  const orphans = await service.listMenuItems(
    { type: "collection", target_id: event.data.id },
    { take: 1000 }
  )

  if (orphans.length === 0) return

  await service.deleteMenuItems(orphans.map((o) => o.id))
  logger.info(
    `[menu-items.cleanup] product_collection ${event.data.id} deletada → ${orphans.length} menu item(s) removido(s)`
  )
}

export const config: SubscriberConfig = {
  event: "product.product-collection.deleted",
}
