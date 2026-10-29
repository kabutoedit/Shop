import { getCloudflareContext } from "@opennextjs/cloudflare";
import { demoProducts } from "../../../../back/src/data/products";
import type { Product, ProductInput } from "@/shared/types/product";

export type StoreEnv = CloudflareEnv & {
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  ADMIN_SESSION_SECRET: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  age: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  active: number;
  created_at: string;
};

type ImageRow = { id: string; product_id: string; url: string; alt: string };
type VariantRow = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
};

export async function getStoreEnv() {
  return (await getCloudflareContext({ async: true })).env as StoreEnv;
}

function mapProducts(
  rows: ProductRow[],
  images: ImageRow[],
  variants: VariantRow[],
): Product[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    age: row.age,
    price: row.price,
    originalPrice: row.original_price,
    images: images
      .filter((image) => image.product_id === row.id)
      .map(({ id, url, alt }) => ({ id, url, alt })),
    variants: variants
      .filter((variant) => variant.product_id === row.id)
      .map(({ id, size, color, sku, stock }) => ({
        id,
        size,
        color,
        sku,
        stock,
      })),
    badge: row.badge,
    active: Boolean(row.active),
    createdAt: row.created_at,
  }));
}

async function seedDemoProducts(env: StoreEnv) {
  const { results } = await env.DB.prepare("SELECT COUNT(*) AS count FROM products").all<{
    count: number;
  }>();
  if (Number(results[0]?.count ?? 0) > 0) return;

  const createdAt = new Date().toISOString();
  const statements = demoProducts.flatMap((product, productIndex) => {
    const productId = `demo-product-${productIndex + 1}`;
    const queries = [
      env.DB.prepare(
        `INSERT OR IGNORE INTO products
         (id, name, description, category, age, price, original_price, badge, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        productId,
        product.name,
        product.description,
        product.category,
        product.age,
        product.price,
        product.originalPrice,
        product.badge,
        product.active ? 1 : 0,
        createdAt,
        createdAt,
      ),
      ...product.images.map((image, imageIndex) =>
        env.DB.prepare(
          "INSERT OR IGNORE INTO product_images (id, product_id, url, alt, position) VALUES (?, ?, ?, ?, ?)",
        ).bind(
          `demo-image-${productIndex + 1}-${imageIndex + 1}`,
          productId,
          image.url,
          image.alt,
          imageIndex,
        ),
      ),
      ...product.variants.map((variant, variantIndex) =>
        env.DB.prepare(
          "INSERT OR IGNORE INTO product_variants (id, product_id, size, color, sku, stock) VALUES (?, ?, ?, ?, ?, ?)",
        ).bind(
          `demo-variant-${productIndex + 1}-${variantIndex + 1}`,
          productId,
          variant.size,
          variant.color,
          variant.sku,
          variant.stock,
        ),
      ),
    ];
    return queries;
  });

  await env.DB.batch(statements);
}

export async function listProducts(options: {
  includeInactive?: boolean;
  category?: string;
  search?: string;
} = {}): Promise<Product[]> {
  const env = await getStoreEnv();
  await seedDemoProducts(env);

  const clauses: string[] = [];
  const values: string[] = [];
  if (!options.includeInactive) clauses.push("active = 1");
  if (options.category) {
    clauses.push("category = ?");
    values.push(options.category);
  }
  if (options.search) {
    clauses.push("(name LIKE ? OR description LIKE ? OR category LIKE ?)");
    const term = `%${options.search}%`;
    values.push(term, term, term);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const { results: rows } = await env.DB
    .prepare(`SELECT * FROM products ${where} ORDER BY created_at DESC`)
    .bind(...values)
    .all<ProductRow>();
  if (!rows.length) return [];

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(", ");
  const [{ results: images }, { results: variants }] = await Promise.all([
    env.DB
      .prepare(`SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY position`)
      .bind(...ids)
      .all<ImageRow>(),
    env.DB
      .prepare(`SELECT * FROM product_variants WHERE product_id IN (${placeholders}) ORDER BY rowid`)
      .bind(...ids)
      .all<VariantRow>(),
  ]);
  return mapProducts(rows, images, variants);
}

export async function listCategories() {
  const env = await getStoreEnv();
  const { results } = await env.DB
    .prepare("SELECT DISTINCT category FROM products WHERE active = 1 ORDER BY category")
    .all<{ category: string }>();
  return results.map((row) => row.category);
}

export async function getProduct(id: string, includeInactive = false) {
  const env = await getStoreEnv();
  const product = await env.DB
    .prepare(`SELECT * FROM products WHERE id = ? ${includeInactive ? "" : "AND active = 1"}`)
    .bind(id)
    .first<ProductRow>();
  if (!product) return null;

  const [{ results: images }, { results: variants }] = await Promise.all([
    env.DB.prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY position").bind(id).all<ImageRow>(),
    env.DB.prepare("SELECT * FROM product_variants WHERE product_id = ? ORDER BY rowid").bind(id).all<VariantRow>(),
  ]);
  return mapProducts([product], images, variants)[0];
}

export async function saveProduct(input: ProductInput, id?: string) {
  const env = await getStoreEnv();
  const existing = id ? await getProduct(id, true) : null;
  if (id && !existing) return null;
  const productId = id ?? crypto.randomUUID();
  const createdAt = existing?.createdAt ?? new Date().toISOString();
  const statements = [
    env.DB.prepare(
      `INSERT INTO products
       (id, name, description, category, age, price, original_price, badge, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, description = excluded.description,
       category = excluded.category, age = excluded.age, price = excluded.price,
       original_price = excluded.original_price, badge = excluded.badge,
       active = excluded.active, updated_at = excluded.updated_at`,
    ).bind(
      productId,
      input.name,
      input.description,
      input.category,
      input.age,
      input.price,
      input.originalPrice,
      input.badge,
      input.active ? 1 : 0,
      createdAt,
      new Date().toISOString(),
    ),
    env.DB.prepare("DELETE FROM product_images WHERE product_id = ?").bind(productId),
    env.DB.prepare("DELETE FROM product_variants WHERE product_id = ?").bind(productId),
    ...input.images.map((image, index) =>
      env.DB.prepare(
        "INSERT INTO product_images (id, product_id, url, alt, position) VALUES (?, ?, ?, ?, ?)",
      ).bind(crypto.randomUUID(), productId, image.url, image.alt, index),
    ),
    ...input.variants.map((variant) =>
      env.DB.prepare(
        "INSERT INTO product_variants (id, product_id, size, color, sku, stock) VALUES (?, ?, ?, ?, ?, ?)",
      ).bind(
        crypto.randomUUID(),
        productId,
        variant.size,
        variant.color,
        variant.sku,
        variant.stock,
      ),
    ),
    env.DB.prepare("UPDATE product_meta SET revision = revision + 1 WHERE id = 1"),
  ];
  await env.DB.batch(statements);
  return getProduct(productId, true);
}

export async function deleteProduct(id: string) {
  const env = await getStoreEnv();
  const result = await env.DB.batch([
    env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id),
    env.DB.prepare("UPDATE product_meta SET revision = revision + 1 WHERE id = 1"),
  ]);
  return (result[0]?.meta.changes ?? 0) > 0;
}

export async function getProductRevision() {
  const env = await getStoreEnv();
  const row = await env.DB
    .prepare("SELECT revision FROM product_meta WHERE id = 1")
    .first<{ revision: number }>();
  return row?.revision ?? 0;
}
