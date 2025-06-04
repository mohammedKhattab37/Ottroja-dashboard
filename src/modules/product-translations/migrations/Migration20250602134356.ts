import { Migration } from '@mikro-orm/migrations';

export class Migration20250602134356 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_translation" add constraint "product_translation_language_code_check" check("language_code" in ('EN', 'ES', 'FR', 'DE', 'IT', 'AR', 'RU'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_translation" drop constraint if exists "product_translation_language_code_check";`);

    this.addSql(`alter table if exists "product_translation" alter column "language_code" type text using ("language_code"::text);`);
  }

}
