import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260505185812 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vehicle" drop constraint if exists "vehicle_slug_unique";`);
    this.addSql(`create table if not exists "vehicle" ("id" text not null, "make" text not null, "model" text not null, "year" integer not null, "slug" text not null, "trim" text null, "body_type" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vehicle_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vehicle_deleted_at" ON "vehicle" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vehicle_slug_unique" ON "vehicle" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vehicle_make_model_year" ON "vehicle" ("make", "model", "year") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vehicle" cascade;`);
  }

}
