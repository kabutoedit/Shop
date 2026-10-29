import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import initSqlJs from "sql.js";
import type { Database as SqlDatabase } from "sql.js";
import { demoProducts, type Product, type ProductInput } from "./products.js";

const databasePath = resolve(process.env.DATABASE_PATH ?? "data/store.sqlite");
mkdirSync(dirname(databasePath), { recursive: true });

const SQL = await initSqlJs();
const database: SqlDatabase = existsSync(databasePath)
  ? new SQL.Database(new Uint8Array(readFileSync(databasePath)))
  : new SQL.Database();

database.run("PRAGMA foreign_keys = ON");
database.run(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    age TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL CHECK (price >= 0),
    original_price INTEGER CHECK (original_price IS NULL OR original_price >= 0),
    badge TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT NOT NULL DEFAULT '',
    position INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '',
    sku TEXT NOT NULL DEFAULT '',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
  );
  CREATE INDEX IF NOT EXISTS products_active_idx ON products(active, created_at);
  CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
  CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id, position);
  CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants(product_id);
`);

function allRows(query: string, values: (string | number | null)[] = []) {
  const statement = database.prepare(query);
  const rows: Record<string, unknown>[] = [];
  try {
    statement.bind(values);
    while (statement.step()) {
      rows.push(statement.getAsObject());
    }
  } finally {
    statement.free();
  }
  return rows;
}

function oneRow(query: string, values: (string | number | null)[] = []) {
  return allRows(query, values)[0];
}

function saveDatabase() {
  const temporaryPath = `${databasePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, database.export());
  renameSync(temporaryPath, databasePath);
}

function mapProduct(row: Record<string, unknown>): Product {
  const id = String(row.id);
  const images = allRows(
    "SELECT id, url, alt FROM product_images WHERE product_id = ? ORDER BY position",
    [id],
  ) as Product["images"];
  const variants = allRows(
    "SELECT id, size, color, sku, stock FROM product_variants WHERE product_id = ? ORDER BY rowid",
    [id],
  ).map((variant) => ({
    id: String(variant.id),
    size: String(variant.size),
    color: String(variant.color),
    sku: String(variant.sku),
    stock: Number(variant.stock),
  }));

  return {
    id,
    name: String(row.name),
    description: String(row.description),
    category: String(row.category),
    age: String(row.age),
    price: Number(row.price),
    originalPrice:
      row.original_price === null ? null : Number(row.original_price),
    images,
    variants,
    badge: row.badge === null ? null : String(row.badge),
    active: Boolean(row.active),
    createdAt: String(row.created_at),
  };
}

export function listProducts(options: {
  includeInactive?: boolean;
  category?: string;
  search?: string;
} = {}): Product[] {
  const clauses: string[] = [];
  const values: (string | number | null)[] = [];

  if (!options.includeInactive) {
    clauses.push("active = 1");
  }
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
  return allRows(
    `SELECT * FROM products ${where} ORDER BY created_at DESC`,
    values,
  ).map(mapProduct);
}

export function getProduct(id: string, includeInactive = false): Product | null {
  const row = oneRow(
    `SELECT * FROM products WHERE id = ? ${includeInactive ? "" : "AND active = 1"}`,
    [id],
  );
  return row ? mapProduct(row) : null;
}

function persistProduct(input: ProductInput, id: string, createdAt?: string) {
  const now = new Date().toISOString();
  database.run(
    `INSERT INTO products
      (id, name, description, category, age, price, original_price, badge, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, description = excluded.description,
       category = excluded.category, age = excluded.age, price = excluded.price,
       original_price = excluded.original_price, badge = excluded.badge,
       active = excluded.active, updated_at = excluded.updated_at`,
    [
      id,
      input.name,
      input.description,
      input.category,
      input.age,
      input.price,
      input.originalPrice,
      input.badge,
      input.active ? 1 : 0,
      createdAt ?? now,
      now,
    ],
  );

  database.run("DELETE FROM product_images WHERE product_id = ?", [id]);
  database.run("DELETE FROM product_variants WHERE product_id = ?", [id]);

  input.images.forEach((image, index) => {
    database.run(
      "INSERT INTO product_images (id, product_id, url, alt, position) VALUES (?, ?, ?, ?, ?)",
      [randomUUID(), id, image.url, image.alt, index],
    );
  });

  input.variants.forEach((variant) => {
    database.run(
      "INSERT INTO product_variants (id, product_id, size, color, sku, stock) VALUES (?, ?, ?, ?, ?, ?)",
      [randomUUID(), id, variant.size, variant.color, variant.sku, variant.stock],
    );
  });
}

function transaction<T>(callback: () => T): T {
  database.run("BEGIN IMMEDIATE");
  let result: T;
  try {
    result = callback();
    database.run("COMMIT");
  } catch (error) {
    database.run("ROLLBACK");
    throw error;
  }
  saveDatabase();
  return result;
}

export function createProduct(input: ProductInput): Product {
  return transaction(() => {
    const id = randomUUID();
    persistProduct(input, id);
    const product = getProduct(id, true);
    if (!product) {
      throw new Error("Созданный товар не найден в базе данных.");
    }
    return product;
  });
}

export function updateProduct(id: string, input: ProductInput): Product | null {
  return transaction(() => {
    const existing = getProduct(id, true);
    if (!existing) {
      return null;
    }
    persistProduct(input, id, existing.createdAt);
    return getProduct(id, true);
  });
}

export function deleteProduct(id: string): boolean {
  return transaction(() => {
    database.run("DELETE FROM products WHERE id = ?", [id]);
    const deleted = database.getRowsModified() > 0;
    return deleted;
  });
}

const productCount = Number(
  oneRow("SELECT COUNT(*) AS count FROM products")?.count ?? 0,
);

if (productCount === 0) {
  transaction(() => {
    for (const product of demoProducts) {
      persistProduct(product, randomUUID());
    }
  });
} else {
  saveDatabase();
}

export function listCategories(): string[] {
  return allRows(
    "SELECT DISTINCT category FROM products WHERE active = 1 ORDER BY category",
  ).map((row) => String(row.category));
}
