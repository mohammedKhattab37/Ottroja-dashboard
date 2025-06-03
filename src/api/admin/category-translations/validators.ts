import * as zod from "zod";

export const categoryTranslationSchema = zod.object({
  category_id: zod.string(),
  language_code: zod.string(),
  name: zod.string(),
  description: zod.string(),
});
