import { Migration } from '@mikro-orm/migrations';

export class Migration20250622133825 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "cms_item" add column if not exists "position" text check ("position" in ('NAV_LINKS', 'HERO', 'SPECIAL_OFFERS', 'OFFER_BANNER1', 'SUB_OFFERS', 'IMAGES_GALLERY', 'OFFER_BANNER2', 'FOOTER')) not null, add column if not exists "sub_title" text null, add column if not exists "region" text check ("region" in ('EG', 'SA')) not null, add column if not exists "button_destination" text null, add column if not exists "button_text" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "cms_item" drop column if exists "position", drop column if exists "sub_title", drop column if exists "region", drop column if exists "button_destination", drop column if exists "button_text";`);
  }

}
