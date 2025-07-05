import { z } from "zod";

export const genderSchema = z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);

export const customerSchema = z.object({
  customerId: z.number().int().positive().optional(),
  userId: z.string().min(1, "User ID is required"),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 13 && age <= 120; // Age validation
    }, {
      message: "Age must be between 13 and 120 years",
    }),
  gender: genderSchema.optional(),
  lastLogin: z.string().datetime().optional(),
  totalOrders: z.number().int().min(0).default(0),
  totalSpent: z.number().min(0).default(0),
});

export const createCustomerSchema = customerSchema.omit({ 
  customerId: true,
  totalOrders: true,
  totalSpent: true,
});

export const updateCustomerSchema = customerSchema
  .partial()
  .required({ customerId: true })
  .omit({ userId: true, totalOrders: true, totalSpent: true });

// Schema for updating calculated fields (used internally)
export const updateCustomerMetricsSchema = z.object({
  customerId: z.number().int().positive(),
  totalOrders: z.number().int().min(0),
  totalSpent: z.number().min(0),
});

export type Customer = z.infer<typeof customerSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type UpdateCustomerMetricsInput = z.infer<typeof updateCustomerMetricsSchema>;
export type Gender = z.infer<typeof genderSchema>;