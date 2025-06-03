import * as zod from "zod";

export const productTranslationSchema = zod.object({
  language_code: zod.string(),
  title: zod.string(),
  sub_title: zod.string().nullable(),
  description: zod.string(),
});
