import * as zod from "zod";

export const cmsItemSchema = zod.object({
  name: zod.string().min(1, "Enter a name"),
  title: zod.string().nullable(),
  eng_content: zod.string().nullable(),
  ar_content: zod.string().nullable(),
  items: zod
    .record(
      zod.string(),
      zod.object({
        title: zod.string(),
        url: zod.string().optional(),
      })
    )
    .optional(),
  images: zod.array(zod.string()).optional(),
});
