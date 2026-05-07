import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * Cria tabelas `menu` e `menu_item`.
 *
 * Manualmente escrita conforme aprendizado do `feedback_medusa_db_generate.md` —
 * `medusa db:generate` regenera schema completo.
 *
 * Índices estratégicos:
 *  - menu.handle único (lookup do storefront por handle)
 *  - menu_item (menu_id, parent_item_id) composto pra carregar hierarquia em 1 query
 *  - menu_item position pra ORDER BY estável
 */
export class Migration20260507000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "menu" (
        "id" text not null,
        "handle" text not null,
        "label" text not null,
        "position" integer not null default 0,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "menu_pkey" primary key ("id")
      );
    `)
    this.addSql(
      `create unique index if not exists "IDX_menu_handle_unique" on "menu" ("handle") where deleted_at is null;`
    )
    this.addSql(
      `create index if not exists "IDX_menu_deleted_at" on "menu" ("deleted_at") where deleted_at is null;`
    )

    this.addSql(`
      create table if not exists "menu_item" (
        "id" text not null,
        "menu_id" text not null,
        "parent_item_id" text null,
        "label" text not null,
        "type" text check ("type" in ('link', 'category', 'collection', 'external')) not null default 'link',
        "target_id" text null,
        "target_url" text null,
        "position" integer not null default 0,
        "open_in_new_tab" boolean not null default false,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "menu_item_pkey" primary key ("id")
      );
    `)
    this.addSql(
      `create index if not exists "IDX_menu_item_menu_id" on "menu_item" ("menu_id");`
    )
    this.addSql(
      `create index if not exists "IDX_menu_item_parent" on "menu_item" ("menu_id", "parent_item_id");`
    )
    this.addSql(
      `create index if not exists "IDX_menu_item_deleted_at" on "menu_item" ("deleted_at") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "menu_item" cascade;`)
    this.addSql(`drop table if exists "menu" cascade;`)
  }
}
