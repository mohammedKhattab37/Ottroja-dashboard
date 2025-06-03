import { Migration } from '@mikro-orm/migrations';

export class Migration20250603122519 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_translation" drop constraint if exists "product_translation_language_code_check";`);

    this.addSql(`drop index if exists "variant_translation_lookup_idx";`);

    this.addSql(`alter table if exists "product_translation" add column if not exists "sub_title" text null;`);
    this.addSql(`alter table if exists "product_translation" alter column "title" type text using ("title"::text);`);
    this.addSql(`alter table if exists "product_translation" alter column "title" set not null;`);
    this.addSql(`alter table if exists "product_translation" alter column "description" type text using ("description"::text);`);
    this.addSql(`alter table if exists "product_translation" alter column "description" set not null;`);
    this.addSql(`alter table if exists "product_translation" add constraint "product_translation_language_code_check" check("language_code" in ('AR', 'RU'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_translation" drop constraint if exists "product_translation_language_code_check";`);

    this.addSql(`alter table if exists "product_translation" drop column if exists "sub_title";`);

    this.addSql(`alter table if exists "product_translation" alter column "title" type text using ("title"::text);`);
    this.addSql(`alter table if exists "product_translation" alter column "title" drop not null;`);
    this.addSql(`alter table if exists "product_translation" alter column "description" type text using ("description"::text);`);
    this.addSql(`alter table if exists "product_translation" alter column "description" drop not null;`);
    this.addSql(`alter table if exists "product_translation" add constraint "product_translation_language_code_check" check("language_code" in ('EN', 'ES', 'FR', 'DE', 'IT', 'AR', 'RU'));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "variant_translation_lookup_idx" ON "product_translation" (product_id, language_code) WHERE deleted_at IS NULL;`);
  }

}
