import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * Onda 3: adiciona `is_default boolean` em `menu` pra proteger menus core
 * (header, footer-categorias, footer-atendimento) contra exclusão acidental.
 *
 * Default `false` — só os menus seedados pelo bootstrap viram `true` via
 * dx-bootstrap.ts.
 */
export class Migration20260507000002 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "menu" add column if not exists "is_default" boolean not null default false;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "menu" drop column if exists "is_default";`)
  }
}
