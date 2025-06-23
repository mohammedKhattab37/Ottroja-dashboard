import { Migration } from '@mikro-orm/migrations';

export class Migration20250623000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "cms_item" add column if not exists "images" text[] null, add column if not exists "items" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "cms_item" drop column if exists "images", drop column if exists "items";`);
  }

} 