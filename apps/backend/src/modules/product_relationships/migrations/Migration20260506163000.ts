import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * Cria tabela `product_relationship`.
 *
 * Manualmente escrita — `medusa db:generate` regenera schema completo
 * (vide `feedback_medusa_db_generate.md` na memory persistente).
 *
 * Índices:
 *  - source_product_id   → lookup rápido na PDP do produto X
 *  - target_product_id   → "quais produtos sugerem este?"
 *  - composto (source, type) → filtra "produtos relacionados de X" vs "compre junto de X"
 */
export class Migration20260506163000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "product_relationship" (
        "id" text not null,
        "source_product_id" text not null,
        "target_product_id" text not null,
        "relationship_type" text check ("relationship_type" in ('related', 'bundle')) not null default 'related',
        "position" integer not null default 0,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "product_relationship_pkey" primary key ("id")
      );
    `)
    this.addSql(
      `create index if not exists "IDX_product_relationship_source_id" on "product_relationship" ("source_product_id");`
    )
    this.addSql(
      `create index if not exists "IDX_product_relationship_target_id" on "product_relationship" ("target_product_id");`
    )
    this.addSql(
      `create index if not exists "IDX_product_relationship_source_type" on "product_relationship" ("source_product_id", "relationship_type");`
    )
    this.addSql(
      `create index if not exists "IDX_product_relationship_deleted_at" on "product_relationship" ("deleted_at") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_relationship" cascade;`)
  }
}
