import * as zod from "zod";

export const cmsItemSchema = zod.object({
  name: zod.string().min(1, "Enter a name"),
  title: zod.string().optional(),
  eng_content: zod.string().optional(),
  ar_content: zod.string().optional(),
  items: zod
    .record(
      zod.string(),
      zod.object({
        title: zod.string(),
        url: zod.string().optional(),
      })
    )
    .optional(),
});

export const cmsImageSchema = zod.object({
  file: zod.any().optional(),
});
