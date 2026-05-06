import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260506142410 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "review" ("id" text not null, "product_id" text not null, "rating" integer not null, "title" text not null, "body" text not null, "author_name" text not null, "author_email" text null, "status" text check ("status" in ('pending', 'approved', 'rejected', 'spam')) not null default 'pending', "verified_purchase" boolean not null default false, "helpful_count" integer not null default 0, "internal_notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "review" cascade;`);
  }

}
