import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260505185811 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "atacado_lead" ("id" text not null, "name" text not null, "company" text null, "cnpj" text null, "email" text not null, "phone" text not null, "city" text null, "province" text null, "segment" text null, "monthly_volume" text null, "message" text null, "status" text check ("status" in ('new', 'contacted', 'quoted', 'won', 'lost', 'spam')) not null default 'new', "source" text not null default 'website', "internal_notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "atacado_lead_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_atacado_lead_deleted_at" ON "atacado_lead" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "atacado_lead" cascade;`);
  }

}
