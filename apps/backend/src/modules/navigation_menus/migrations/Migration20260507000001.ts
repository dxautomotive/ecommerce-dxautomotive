import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * Onda 1 dos menus: expande o enum de `menu_item.type` pra incluir
 * `home`, `search`, `catalog`, `product`, `policy` (Shopify-parity).
 *
 * Mantém os 4 tipos originais (`link`, `category`, `collection`, `external`)
 * intactos pra que items existentes continuem válidos.
 *
 * Manualmente escrita conforme `feedback_medusa_db_generate.md` — não regenerar.
 */
export class Migration20260507000001 extends Migration {
  override async up(): Promise<void> {
    // Postgres não permite ALTER CHECK in-place — drop + add
    this.addSql(`alter table "menu_item" drop constraint if exists "menu_item_type_check";`)
    this.addSql(`
      alter table "menu_item" add constraint "menu_item_type_check"
        check ("type" in (
          'link', 'external',
          'home', 'search', 'catalog',
          'category', 'collection', 'product', 'policy'
        ));
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "menu_item" drop constraint if exists "menu_item_type_check";`)
    this.addSql(`
      alter table "menu_item" add constraint "menu_item_type_check"
        check ("type" in ('link', 'category', 'collection', 'external'));
    `)
  }
}
