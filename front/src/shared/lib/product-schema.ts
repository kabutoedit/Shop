import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url().max(2048),
  alt: z.string().trim().max(250).default(""),
});

const variantSchema = z.object({
  size: z.string().trim().max(60).default(""),
  color: z.string().trim().max(80).default(""),
  sku: z.string().trim().max(100).default(""),
  stock: z.number().int().min(0).max(100000),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).default(""),
  category: z.string().trim().min(2).max(100),
  age: z.string().trim().max(80).default(""),
  price: z.number().int().min(0).max(100000000),
  originalPrice: z.number().int().min(0).max(100000000).nullable().default(null),
  images: z.array(imageSchema).min(1).max(10),
  variants: z.array(variantSchema).min(1).max(100),
  badge: z.string().trim().max(60).nullable().default(null),
  active: z.boolean().default(true),
});
