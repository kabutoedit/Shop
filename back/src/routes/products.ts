import { Router } from "express";
import { z } from "zod";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listCategories,
  listProducts,
  updateProduct,
} from "../data/database.js";
import { requireAdmin } from "../auth.js";
import { notifyProductsChanged } from "../product-events.js";

export const productRouter = Router();
export const adminProductRouter = Router();

const imageSchema = z.object({
  url: z.url().max(2048),
  alt: z.string().trim().max(250).default(""),
});

const variantSchema = z.object({
  size: z.string().trim().max(60).default(""),
  color: z.string().trim().max(80).default(""),
  sku: z.string().trim().max(100).default(""),
  stock: z.number().int().min(0).max(100000),
});

const productSchema = z.object({
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

productRouter.get("/", (request, response) => {
  const category = typeof request.query.category === "string" ? request.query.category : undefined;
  const search = typeof request.query.search === "string"
    ? request.query.search.trim().slice(0, 100)
    : undefined;
  response.json({ products: listProducts({ category, search }), categories: listCategories() });
});

productRouter.get("/:id", (request, response) => {
  const product = getProduct(request.params.id);
  if (!product) {
    response.status(404).json({ error: "Товар не найден." });
    return;
  }
  response.json({ product });
});

adminProductRouter.use(requireAdmin);

adminProductRouter.get("/", (_request, response) => {
  response.json({ products: listProducts({ includeInactive: true }) });
});

adminProductRouter.post("/", (request, response) => {
  const parsed = productSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Проверьте поля товара.", details: parsed.error.flatten() });
    return;
  }
  const product = createProduct(parsed.data);
  notifyProductsChanged();
  response.status(201).json({ product });
});

adminProductRouter.put("/:id", (request, response) => {
  const parsed = productSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Проверьте поля товара.", details: parsed.error.flatten() });
    return;
  }
  const product = updateProduct(request.params.id, parsed.data);
  if (!product) {
    response.status(404).json({ error: "Товар не найден." });
    return;
  }
  notifyProductsChanged();
  response.json({ product });
});

adminProductRouter.delete("/:id", (request, response) => {
  if (!deleteProduct(request.params.id)) {
    response.status(404).json({ error: "Товар не найден." });
    return;
  }
  notifyProductsChanged();
  response.status(204).end();
});
