import { Migration } from '@mikro-orm/migrations';

export class Migration20250624105658 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "cms_item" drop constraint if exists "cms_item_position_check";`);

    this.addSql(`alter table if exists "cms_item" add column if not exists "page_type" text check ("page_type" in ('RETURN_POLICY', 'USAGE_POLICY', 'TERMS_CONDITIONS')) null;`);
    this.addSql(`alter table if exists "cms_item" add constraint "cms_item_position_check" check("position" in ('NAV_LINKS', 'HERO', 'SPECIAL_OFFERS', 'OFFER_BANNER1', 'SUB_OFFERS', 'IMAGES_GALLERY', 'OFFER_BANNER2', 'FOOTER', 'PAGE'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "cms_item" drop constraint if exists "cms_item_position_check";`);

    this.addSql(`alter table if exists "cms_item" drop column if exists "page_type";`);

    this.addSql(`alter table if exists "cms_item" add constraint "cms_item_position_check" check("position" in ('NAV_LINKS', 'HERO', 'SPECIAL_OFFERS', 'OFFER_BANNER1', 'SUB_OFFERS', 'IMAGES_GALLERY', 'OFFER_BANNER2', 'FOOTER'));`);
  }

}
