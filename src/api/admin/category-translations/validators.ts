import * as zod from "zod";

export const categoryTranslationSchema = zod.object({
  language_code: zod.string(),
  name: zod.string(),
  description: zod.string(),
});
