import { z } from "zod";

export const productSchema = z.object({
  photo: z.string({
    required_error: "필수값",
  }),
  title: z.string({
    required_error: "필수값",
  }),
  description: z.string({
    required_error: "필수값",
  }),
  price: z.coerce.number({
    required_error: "필수값",
  }),
});

export type ProductType = z.infer<typeof productSchema>;
