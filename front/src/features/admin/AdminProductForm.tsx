"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { adminApi } from "@/shared/api/products";
import { invalidateProductQueries } from "@/shared/lib/product-query-cache";
import type { Product, ProductInput } from "@/shared/types/product";
import { AdminShell } from "./AdminShell";

const blankProduct: ProductInput = {
  name: "",
  description: "",
  category: "",
  age: "",
  price: 0,
  originalPrice: null,
  images: [],
  variants: [{ size: "", color: "", sku: "", stock: 0 }],
  badge: null,
  active: true,
};

const fieldClass =
  "mt-2 w-full border border-[#dedfd5] bg-white px-3 py-3 text-sm outline-none focus:border-[#65755e]";

function toProductInput(existing: Product): ProductInput {
  return {
    name: existing.name,
    description: existing.description,
    category: existing.category,
    age: existing.age,
    price: existing.price,
    originalPrice: existing.originalPrice,
    images: existing.images.map(({ url, alt }) => ({ url, alt })),
    variants: existing.variants.map(({ size, color, sku, stock }) => ({
      size,
      color,
      sku,
      stock,
    })),
    badge: existing.badge,
    active: existing.active,
  };
}

export function AdminProductForm({ id }: { id?: string }) {
  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: adminApi.products,
    enabled: Boolean(id),
  });
  const existing = productsQuery.data?.products.find((item) => item.id === id);

  if (id && productsQuery.isPending) {
    return <AdminShell><p className="py-16 text-center text-sm text-[#777d72]">Загружаем товар…</p></AdminShell>;
  }

  if (id && (productsQuery.isError || !existing)) {
    return (
      <AdminShell>
        <p className="text-sm text-[#a84939]">{productsQuery.error?.message ?? "Товар не найден."}</p>
        <Link className="mt-4 inline-block text-xs underline" href="/admin/products">Вернуться к списку</Link>
      </AdminShell>
    );
  }

  return (
    <AdminProductEditor
      id={id}
      initialProduct={existing ? toProductInput(existing) : blankProduct}
      key={id ?? "new"}
    />
  );
}

function AdminProductEditor({
  id,
  initialProduct,
}: {
  id?: string;
  initialProduct: ProductInput;
}) {
  const [product, setProduct] = useState<ProductInput>(initialProduct);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: () =>
      id ? adminApi.updateProduct(id, product) : adminApi.createProduct(product),
    onSuccess: async () => {
      await invalidateProductQueries(queryClient);
      router.push("/admin/products");
    },
  });

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setProduct((current) => ({ ...current, [key]: value }));
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    if (product.images.length + files.length > 10) {
      setUploadError("Для одного товара можно добавить не более 10 фотографий.");
      return;
    }

    setUploadError("");
    setUploading(true);
    try {
      const result = await adminApi.uploadImages(files);
      setProduct((current) => ({
        ...current,
        images: [...current.images, ...result.images],
      }));
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Не удалось загрузить фотографии.",
      );
    } finally {
      setUploading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <AdminShell>
      <Link className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#777d72]" href="/admin/products">
        <ArrowLeft size={14} /> Все товары
      </Link>
      <div className="mt-5 border-b border-[#e7e5df] pb-6">
        <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#987760]">Каталог</p>
        <h1 className="font-serif text-4xl tracking-[-0.04em]">{id ? "Редактировать товар" : "Новый товар"}</h1>
      </div>
      <form className="mt-7 grid gap-8 lg:grid-cols-[1fr_320px]" onSubmit={submit}>
        <div className="space-y-7">
          <section className="border border-[#e7e5df] bg-white p-5 sm:p-7">
            <h2 className="font-serif text-2xl">Основная информация</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-xs sm:col-span-2">
                Название товара *
                <input className={fieldClass} maxLength={160} onChange={(event) => update("name", event.target.value)} required value={product.name} />
              </label>
              <label className="text-xs">
                Категория *
                <input className={fieldClass} list="product-categories" onChange={(event) => update("category", event.target.value)} required value={product.category} />
                <datalist id="product-categories">
                  {["Одежда", "Обувь", "Аксессуары", "Для дома"].map((item) => <option key={item} value={item} />)}
                </datalist>
              </label>
              <label className="text-xs">
                Возраст или размер изделия
                <input className={fieldClass} onChange={(event) => update("age", event.target.value)} placeholder="Например, 1–3 года" value={product.age} />
              </label>
              <label className="text-xs sm:col-span-2">
                Описание
                <textarea className={`${fieldClass} min-h-32 resize-y`} maxLength={5000} onChange={(event) => update("description", event.target.value)} value={product.description} />
              </label>
            </div>
          </section>

          <section className="border border-[#e7e5df] bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl">Фотографии</h2>
                <p className="mt-1 text-xs text-[#777d72]">До 10 JPG, PNG, WebP, AVIF или GIF, не более 8 МБ каждая.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 border border-[#dedfd5] px-3 py-2 text-[10px] uppercase tracking-[0.1em]">
                <ImagePlus size={15} /> {uploading ? "Загрузка…" : "Загрузить"}
                <input accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" disabled={uploading || product.images.length >= 10} multiple onChange={(event) => void uploadFiles(event)} type="file" />
              </label>
            </div>
            <div className="mt-5 space-y-3">
              {product.images.map((image, index) => (
                <div className="grid gap-3 sm:grid-cols-[72px_1fr_auto]" key={`${image.url}-${index}`}>
                  <div className="h-[72px] bg-[#eeece6] bg-cover bg-center" style={{ backgroundImage: `url("${image.url}")` }} />
                  <div className="space-y-2">
                    <input aria-label={`Ссылка на фотографию ${index + 1}`} className="w-full border border-[#dedfd5] px-3 py-2 text-xs" onChange={(event) => update("images", product.images.map((item, current) => current === index ? { ...item, url: event.target.value } : item))} placeholder="URL фотографии" value={image.url} />
                    <input aria-label={`Описание фотографии ${index + 1}`} className="w-full border border-[#dedfd5] px-3 py-2 text-xs" onChange={(event) => update("images", product.images.map((item, current) => current === index ? { ...item, alt: event.target.value } : item))} placeholder="Описание для доступности" value={image.alt} />
                  </div>
                  <button aria-label={`Удалить фотографию ${index + 1}`} className="h-9 w-9 place-self-end text-[#a84939] sm:place-self-center" onClick={() => update("images", product.images.filter((_, current) => current !== index))} type="button"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            {product.images.length < 10 && (
              <button className="mt-4 inline-flex items-center gap-1 text-xs underline underline-offset-4" onClick={() => update("images", [...product.images, { url: "", alt: "" }])} type="button">
                <Plus size={14} /> Добавить ссылку на фото
              </button>
            )}
            {uploadError && <p className="mt-3 text-xs text-[#a84939]" role="alert">{uploadError}</p>}
          </section>

          <section className="border border-[#e7e5df] bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl">Размеры, цвета и остатки</h2>
                <p className="mt-1 text-xs text-[#777d72]">Каждая строка — отдельный вариант товара.</p>
              </div>
              <button className="inline-flex items-center gap-1 text-xs underline underline-offset-4" onClick={() => update("variants", [...product.variants, { size: "", color: "", sku: "", stock: 0 }])} type="button">
                <Plus size={14} /> Вариант
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {product.variants.map((variant, index) => (
                <div className="grid grid-cols-2 gap-3 border-b border-[#eee] pb-4 sm:grid-cols-[1fr_1fr_1.2fr_100px_34px]" key={index}>
                  <label className="text-[10px] text-[#777d72]">Размер<input aria-label={`Размер варианта ${index + 1}`} className="mt-1 w-full border border-[#dedfd5] px-2 py-2.5 text-xs text-[#26352c]" onChange={(event) => update("variants", product.variants.map((item, current) => current === index ? { ...item, size: event.target.value } : item))} placeholder="Размер" value={variant.size} /></label>
                  <label className="text-[10px] text-[#777d72]">Цвет<input aria-label={`Цвет варианта ${index + 1}`} className="mt-1 w-full border border-[#dedfd5] px-2 py-2.5 text-xs text-[#26352c]" onChange={(event) => update("variants", product.variants.map((item, current) => current === index ? { ...item, color: event.target.value } : item))} placeholder="Цвет" value={variant.color} /></label>
                  <label className="col-span-2 text-[10px] text-[#777d72] sm:col-span-1">Артикул<input aria-label={`Артикул варианта ${index + 1}`} className="mt-1 w-full border border-[#dedfd5] px-2 py-2.5 text-xs text-[#26352c]" onChange={(event) => update("variants", product.variants.map((item, current) => current === index ? { ...item, sku: event.target.value } : item))} placeholder="Необязательно" value={variant.sku} /></label>
                  <label className="text-[10px] text-[#777d72]">Остаток<input aria-label={`Остаток варианта ${index + 1}`} className="mt-1 w-full border border-[#dedfd5] px-2 py-2.5 text-xs text-[#26352c]" min={0} onChange={(event) => update("variants", product.variants.map((item, current) => current === index ? { ...item, stock: Number(event.target.value) } : item))} required type="number" value={variant.stock} /></label>
                  <button aria-label={`Удалить вариант ${index + 1}`} className="self-end pb-2 text-[#a84939]" disabled={product.variants.length === 1} onClick={() => update("variants", product.variants.filter((_, current) => current !== index))} type="button"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-5 lg:sticky lg:top-6">
          <section className="border border-[#e7e5df] bg-white p-5 sm:p-6">
            <h2 className="font-serif text-2xl">Цена и публикация</h2>
            <label className="mt-5 block text-xs">
              Цена, сом *
              <input className={fieldClass} min={0} onChange={(event) => update("price", Number(event.target.value))} required type="number" value={product.price} />
            </label>
            <label className="mt-4 block text-xs">
              Старая цена, сом
              <input className={fieldClass} min={0} onChange={(event) => update("originalPrice", event.target.value ? Number(event.target.value) : null)} type="number" value={product.originalPrice ?? ""} />
            </label>
            <label className="mt-4 block text-xs">
              Метка на карточке
              <input className={fieldClass} maxLength={60} onChange={(event) => update("badge", event.target.value || null)} placeholder="Например, Новинка" value={product.badge ?? ""} />
            </label>
            <label className="mt-5 flex items-center gap-3 text-xs">
              <input checked={product.active} onChange={(event) => update("active", event.target.checked)} type="checkbox" />
              Показывать товар в магазине
            </label>
          </section>
          {save.isError && <p className="text-xs text-[#a84939]" role="alert">{save.error.message}</p>}
          <button className="w-full bg-[#26352c] px-4 py-4 text-[10px] uppercase tracking-[0.14em] text-white disabled:opacity-60" disabled={save.isPending || uploading} type="submit">
            {save.isPending ? "Сохраняем…" : id ? "Сохранить изменения" : "Создать товар"}
          </button>
        </aside>
      </form>
    </AdminShell>
  );
}
