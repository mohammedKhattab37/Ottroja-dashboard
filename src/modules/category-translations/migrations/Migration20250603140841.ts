import { Migration } from '@mikro-orm/migrations';

export class Migration20250603140841 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "category_translation" ("id" text not null, "category_id" text not null, "language_code" text check ("language_code" in ('AR', 'RU')) not null, "name" text not null, "description" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "category_translation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_category_translation_deleted_at" ON "category_translation" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "category_translation_lookup_idx" ON "category_translation" (category_id, language_code) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "category_translation" cascade;`);
  }

}
