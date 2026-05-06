import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * Adiciona campo `images` (jsonb) à tabela `review`.
 *
 * Manualmente criada — `medusa db:generate` regenerou o schema completo,
 * que poderia dropar tabelas de outros módulos (vide
 * `feedback_medusa_db_generate.md` na memory persistente). Aqui só o diff.
 */
export class Migration20260506161041 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "review" add column if not exists "images" jsonb null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "review" drop column if exists "images";`)
  }
}
