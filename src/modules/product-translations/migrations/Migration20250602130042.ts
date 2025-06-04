import { Migration } from '@mikro-orm/migrations';

export class Migration20250602130042 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_translation" ("id" text not null, "product_id" text not null, "language_code" text not null, "title" text null, "description" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_translation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_translation_deleted_at" ON "product_translation" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "product_translation_lookup_idx" ON "product_translation" (product_id, language_code) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "variant_translation_lookup_idx" ON "product_translation" (product_id, language_code) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_translation" cascade;`);
  }

}
