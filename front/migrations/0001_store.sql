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
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
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

CREATE TABLE IF NOT EXISTS product_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_hash TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS products_active_idx ON products(active, created_at);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id, position);
CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants(product_id);

INSERT OR IGNORE INTO product_meta (id, revision) VALUES (1, 0);
