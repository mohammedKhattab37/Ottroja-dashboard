import { Migration } from '@mikro-orm/migrations';

export class Migration20250622140316 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "cms_item" drop column if exists "eng_content", drop column if exists "ar_content";`);

    this.addSql(`alter table if exists "cms_item" add column if not exists "language" text check ("language" in ('AR', 'EN', 'RU')) not null, add column if not exists "content" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "cms_item" drop column if exists "language";`);

    this.addSql(`alter table if exists "cms_item" add column if not exists "ar_content" text null;`);
    this.addSql(`alter table if exists "cms_item" rename column "content" to "eng_content";`);
  }

}
