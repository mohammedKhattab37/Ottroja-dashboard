import { Migration } from '@mikro-orm/migrations';

export class Migration20250611151830 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "cms_item" drop constraint if exists "cms_item_name_unique";`);
    this.addSql(`create table if not exists "cms_item" ("id" text not null, "name" text not null, "title" text null, "content" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "cms_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_cms_item_name_unique" ON "cms_item" (name) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cms_item_deleted_at" ON "cms_item" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "cms_item" cascade;`);
  }

}
