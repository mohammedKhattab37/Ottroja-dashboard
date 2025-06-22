import * as zod from "zod";

export const cmsItemSchema = zod.object({
  name: zod.string().min(1, "Enter a name"),
  position: zod.string().min(1, "Choose a position"),
  region: zod.string().min(1, "Choose a region"),
  language: zod.string().min(1, "Choose a language"),
  title: zod.string().nullable(),
  sub_title: zod.string().nullable(),
  content: zod.string().nullable(),
  button_destination: zod.string().nullable(),
  button_text: zod.string().nullable(),
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
