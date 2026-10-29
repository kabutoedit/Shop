"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackagePlus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/shared/api/products";
import { formatPrice } from "@/shared/lib/format-price";
import { invalidateProductQueries } from "@/shared/lib/product-query-cache";
import { AdminShell } from "./AdminShell";

export function AdminProductList() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["admin-products"],
    queryFn: adminApi.products,
  });
  const removeProduct = useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => invalidateProductQueries(queryClient),
  });

  function confirmDelete(id: string, name: string) {
    if (window.confirm(`Удалить «${name}»? Это действие нельзя отменить.`)) {
      removeProduct.mutate(id);
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#987760]">Каталог</p>
          <h1 className="font-serif text-4xl tracking-[-0.04em]">Товары</h1>
        </div>
        <Link className="inline-flex w-fit items-center gap-2 bg-[#26352c] px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-white" href="/admin/products/new">
          <PackagePlus size={15} /> Добавить товар
        </Link>
      </div>
      {removeProduct.isError && (
        <p className="mt-5 text-xs text-[#a84939]" role="alert">{removeProduct.error.message}</p>
      )}
      {isPending ? (
        <p className="py-16 text-center text-sm text-[#777d72]">Загружаем товары…</p>
      ) : isError ? (
        <p className="py-16 text-center text-sm text-[#a84939]">{error.message}</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-[#e7e5df] bg-white">
          <table className="w-full min-w-[700px] text-left">
            <thead className="border-b border-[#e7e5df] bg-[#fbfaf7] text-[10px] uppercase tracking-[0.1em] text-[#777d72]">
              <tr><th className="px-4 py-3 font-normal">Товар</th><th className="px-4 py-3 font-normal">Категория</th><th className="px-4 py-3 font-normal">Цена</th><th className="px-4 py-3 font-normal">Остаток</th><th className="px-4 py-3 font-normal">Статус</th><th className="px-4 py-3 font-normal">Действия</th></tr>
            </thead>
            <tbody className="divide-y divide-[#e7e5df]">
              {data.products.map((product) => (
                <tr className="align-middle" key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-12 shrink-0 bg-[#eeece6] bg-cover bg-center" style={{ backgroundImage: product.images[0] ? `url("${product.images[0].url}")` : undefined }} />
                      <div>
                        <p className="text-xs font-medium">{product.name}</p>
                        <p className="mt-1 text-[10px] text-[#777d72]">{product.images.length} фото · {product.variants.length} вариантов</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{product.category}</td>
                  <td className="px-4 py-3 text-xs">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-xs">{product.variants.reduce((sum, variant) => sum + variant.stock, 0)}</td>
                  <td className="px-4 py-3 text-xs">{product.active ? "Опубликован" : "Скрыт"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link aria-label={`Редактировать ${product.name}`} href={`/admin/products/${product.id}`}><Pencil size={15} /></Link>
                      <button aria-label={`Удалить ${product.name}`} disabled={removeProduct.isPending} onClick={() => confirmDelete(product.id, product.name)}><Trash2 className="text-[#a84939]" size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.products.length === 0 && <p className="py-16 text-center text-sm text-[#777d72]">Товаров пока нет. Добавьте первый.</p>}
        </div>
      )}
    </AdminShell>
  );
}
