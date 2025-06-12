import * as zod from "zod";

export const cmsItemSchema = zod.object({
  name: zod.string(),
  title: zod.string().nullable(),
  content: zod.string().nullable(),
  items: zod
    .array(
      zod.object({
        title: zod.string(),
        url: zod.string().optional(),
      })
    )
    .nullable(),
});
