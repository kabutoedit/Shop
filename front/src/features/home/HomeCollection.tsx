"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/shared/api/products";
import { useStorefront } from "@/shared/lib/storefront-context";
import { ProductGrid } from "@/shared/ui/ProductGrid";

export function HomeCollection() {
  const { t } = useStorefront();
  const { data, isPending, isError } = useQuery({
    queryKey: ["products", "home"],
    queryFn: () => getProducts(),
  });

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 sm:py-20 lg:px-12">
      <div className="mb-8 flex items-end justify-between sm:mb-10">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{t("newArrivals")}</p>
          <h2 className="text-3xl font-light tracking-[0.04em] sm:text-4xl">{t("featuredProducts")}</h2>
        </div>
        <Link className="hidden items-center gap-2 pb-1 text-[10px] uppercase tracking-[0.12em] transition-opacity hover:opacity-60 sm:flex" href="/catalog">
          {t("viewAll")} <ArrowRight size={14} />
        </Link>
      </div>
      {isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="animate-pulse" key={index}>
              <div className="aspect-[0.76] bg-[#eeece6]" />
              <div className="mt-4 h-3 w-2/3 bg-[#eeece6]" />
              <div className="mt-3 h-3 w-1/3 bg-[#eeece6]" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-neutral-500">{t("catalogError")}</p>
      ) : (
        <ProductGrid products={data.products.slice(0, 4)} />
      )}
      <Link className="mt-7 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] transition-opacity hover:opacity-60 sm:hidden" href="/catalog">
        {t("viewAll")} <ArrowRight size={14} />
      </Link>
    </section>
  );
}
