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
  images: { id: string; url: string; alt: string }[];
  variants: ProductVariant[];
  badge: string | null;
  active: boolean;
  createdAt: string;
};

export type ProductInput = Omit<Product, "id" | "images" | "variants" | "createdAt"> & {
  images: { url: string; alt: string }[];
  variants: Omit<ProductVariant, "id">[];
};

const image = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1000&q=85`;

export const demoProducts: ProductInput[] = [
  {
    name: "Комплект «Облачко»",
    description:
      "Мягкий комплект на каждый день: свободный крой и приятный к телу хлопок.",
    category: "Одежда",
    age: "6–24 мес.",
    price: 3290,
    originalPrice: null,
    images: [
      {
        url: image("photo-1519238263530-99bdd11df2ea"),
        alt: "Детская одежда из мягкого хлопка",
      },
    ],
    variants: [
      { size: "68", color: "Молочный", sku: "CLOUD-68-IV", stock: 5 },
      { size: "74", color: "Молочный", sku: "CLOUD-74-IV", stock: 8 },
      { size: "80", color: "Молочный", sku: "CLOUD-80-IV", stock: 4 },
    ],
    badge: "Бестселлер",
    active: true,
  },
  {
    name: "Платье из мягкого льна",
    description: "Лёгкое платье свободного силуэта для прогулок и праздников.",
    category: "Одежда",
    age: "1–5 лет",
    price: 2890,
    originalPrice: null,
    images: [
      {
        url: image("photo-1503919005314-30d93d07d823"),
        alt: "Лёгкая детская одежда для прогулок",
      },
    ],
    variants: [
      { size: "86", color: "Песочный", sku: "LINEN-86-SD", stock: 2 },
      { size: "92", color: "Песочный", sku: "LINEN-92-SD", stock: 6 },
      { size: "98", color: "Песочный", sku: "LINEN-98-SD", stock: 3 },
    ],
    badge: "Новинка",
    active: true,
  },
  {
    name: "Первые мягкие кеды",
    description: "Лёгкие кеды для первых уверенных шагов и больших открытий.",
    category: "Обувь",
    age: "18–36 мес.",
    price: 2450,
    originalPrice: null,
    images: [
      {
        url: image("photo-1516627145497-ae6968895b74"),
        alt: "Удобные вещи для активного детства",
      },
    ],
    variants: [
      { size: "22", color: "Пудровый", sku: "STEP-22-RO", stock: 4 },
      { size: "23", color: "Пудровый", sku: "STEP-23-RO", stock: 3 },
      { size: "24", color: "Пудровый", sku: "STEP-24-RO", stock: 1 },
    ],
    badge: null,
    active: true,
  },
  {
    name: "Кардиган «Тёплый день»",
    description: "Уютный мягкий кардиган, который легко сочетать с любимыми вещами.",
    category: "Одежда",
    age: "1–4 года",
    price: 3790,
    originalPrice: null,
    images: [
      {
        url: image("photo-1519689680058-324335c77eba"),
        alt: "Мягкий вязаный кардиган для ребёнка",
      },
    ],
    variants: [
      { size: "86", color: "Овсяный", sku: "KNIT-86-OT", stock: 3 },
      { size: "92", color: "Овсяный", sku: "KNIT-92-OT", stock: 5 },
      { size: "98", color: "Овсяный", sku: "KNIT-98-OT", stock: 2 },
    ],
    badge: null,
    active: true,
  },
  {
    name: "Шапочка «Росток»",
    description: "Мягкая шапочка из хлопка для прохладных прогулок.",
    category: "Аксессуары",
    age: "0–18 мес.",
    price: 990,
    originalPrice: null,
    images: [
      {
        url: image("photo-1514090458221-65bb69cf63e6"),
        alt: "Детский аксессуар из натуральной ткани",
      },
    ],
    variants: [{ size: "Единый", color: "Молочный", sku: "HAT-ONE-IV", stock: 9 }],
    badge: null,
    active: true,
  },
  {
    name: "Плед «Тихий час»",
    description: "Нежный плед для сна, прогулок и спокойных домашних вечеров.",
    category: "Для дома",
    age: "100 × 80 см",
    price: 3190,
    originalPrice: null,
    images: [
      {
        url: image("photo-1518837695005-2083093ee35b"),
        alt: "Уютный плед в спокойных оттенках",
      },
    ],
    variants: [{ size: "100 × 80", color: "Травяной", sku: "BLANKET-100-GR", stock: 4 }],
    badge: null,
    active: true,
  },
  {
    name: "Комбинезон «На прогулку»",
    description: "Практичный комбинезон с удобными застёжками для прогулок.",
    category: "Одежда",
    age: "3–18 мес.",
    price: 3490,
    originalPrice: null,
    images: [
      {
        url: image("photo-1516627145497-ae6968895b74"),
        alt: "Комфортный комбинезон для прогулки",
      },
    ],
    variants: [
      { size: "62", color: "Шалфей", sku: "WALK-62-SA", stock: 2 },
      { size: "68", color: "Шалфей", sku: "WALK-68-SA", stock: 4 },
      { size: "74", color: "Шалфей", sku: "WALK-74-SA", stock: 3 },
    ],
    badge: null,
    active: true,
  },
  {
    name: "Сумка для маленьких находок",
    description: "Небольшая сумка для прогулок, игрушек и важных сокровищ.",
    category: "Аксессуары",
    age: "Один размер",
    price: 1290,
    originalPrice: null,
    images: [
      {
        url: image("photo-1519689680058-324335c77eba"),
        alt: "Небольшой детский аксессуар для прогулок",
      },
    ],
    variants: [{ size: "Единый", color: "Кремовый", sku: "BAG-ONE-CR", stock: 6 }],
    badge: null,
    active: true,
  },
];
