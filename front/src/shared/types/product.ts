export type ProductImage = {
  id: string;
  url: string;
  alt: string;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  age: string;
  price: number;
  originalPrice: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
  badge: string | null;
  active: boolean;
  createdAt: string;
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "images" | "variants"> & {
  images: Omit<ProductImage, "id">[];
  variants: Omit<ProductVariant, "id">[];
};
