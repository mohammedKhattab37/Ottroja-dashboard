import { z } from "zod";

export const userRoleSchema = z.enum(["ADMIN", "DESIGNER", "MARKETER", "CUSTOMER"]);

export const userSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  emailVerified: z.boolean().default(false),
  image: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Invalid image URL",
    }),
  role: userRoleSchema.default("CUSTOMER"),
});

export const createUserSchema = userSchema.omit({ id: true });

export const updateUserSchema = userSchema
  .partial()
  .required({ id: true });

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;