"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProducts } from "@/shared/api/products";
import { useStorefront } from "@/shared/lib/storefront-context";
import { SiteFooter } from "@/shared/ui/SiteFooter";
import { SiteHeader } from "@/shared/ui/SiteHeader";
import { ProductGrid } from "@/shared/ui/ProductGrid";

const noProducts: Awaited<ReturnType<typeof getProducts>>["products"] = [];

const sortOptions = [
  ["featured", "featured"],
  ["newest", "newest"],
  ["price-up", "priceLow"],
  ["price-down", "priceHigh"],
  ["name-asc", "nameAsc"],
  ["name-desc", "nameDesc"],
] as const;

export function CatalogPage({
  initialSearch,
}: {
  initialSearch: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const { locale, t, categoryName, productName } = useStorefront();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["products", "catalog"],
    queryFn: () => getProducts(),
  });
  const products = data?.products ?? noProducts;
  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = !category || product.category === category;
      const query = search.trim().toLocaleLowerCase("ru");
      const matchesSearch =
        !query ||
        `${product.name} ${product.description} ${product.category} ${product.age}`
          .toLocaleLowerCase("ru")
          .includes(query);
      return matchesCategory && matchesSearch;
    });

    const collator = new Intl.Collator(locale);
    if (sort === "price-up") return filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-down") return filtered.sort((a, b) => b.price - a.price);
    if (sort === "newest") return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "name-asc") {
      return filtered.sort((a, b) => collator.compare(productName(a), productName(b)));
    }
    if (sort === "name-desc") {
      return filtered.sort((a, b) => collator.compare(productName(b), productName(a)));
    }
    return filtered;
  }, [category, locale, productName, products, search, sort]);
  const categories = data?.categories ?? [];

  useEffect(() => {
    if (!sortOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !sortRef.current?.contains(event.target)) {
        setSortOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSortOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [sortOpen]);

  function chooseSort(value: string) {
    setSort(value);
    setSortOpen(false);
  }

  function chooseCategory(nextCategory: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextCategory) {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    router.replace(query ? `/catalog?${query}` : "/catalog", { scroll: false });
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] w-full max-w-[1900px] px-4 sm:px-7 lg:px-[3.5vw]">
        <div className="flex min-h-[94px] items-end justify-between gap-5 py-5 sm:min-h-[110px] sm:py-7">
          <div>
            <h1 className="text-xl font-light tracking-[0.12em] sm:text-2xl">
              {category || search ? t("results") : t("collection")}
            </h1>
            {(category || search) && (
              <p className="mt-2 text-xs text-neutral-500">
                {[category ? categoryName(category) : "", search].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <p aria-live="polite" className="pb-1 text-[10px] tracking-[0.12em] text-neutral-500 sm:text-xs">
            {visibleProducts.length} {t("productCount")}
          </p>
        </div>

        <div className="flex min-h-[58px] items-center justify-between border-y border-neutral-200">
          <button
            aria-expanded={filtersOpen}
            className="inline-flex h-full items-center gap-2 py-4 text-[10px] uppercase tracking-[0.14em] sm:text-xs"
            onClick={() => setFiltersOpen((open) => !open)}
            type="button"
          >
            <SlidersHorizontal size={15} strokeWidth={1.4} />
            {t("filter")}
            {category && <span className="text-neutral-500">(1)</span>}
          </button>
          <div className="relative" ref={sortRef}>
            <button
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              className="inline-flex items-center gap-3 py-4 text-[10px] uppercase tracking-[0.14em] sm:text-xs"
              onClick={() => setSortOpen((open) => !open)}
              type="button"
            >
              <span>{t("sortBy")}</span>
              <ChevronDown
                className={`transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`}
                size={14}
                strokeWidth={1.4}
              />
            </button>
            {sortOpen && (
              <div
                aria-label={t("sortBy")}
                className="absolute right-0 top-full z-20 min-w-56 origin-top-right animate-dropdown border border-neutral-200 bg-white py-2 shadow-lg"
                role="listbox"
              >
                {sortOptions.map(([value, label]) => (
                  <button
                    aria-selected={sort === value}
                    className="flex w-full items-center justify-between gap-5 px-4 py-3 text-left text-xs transition-colors hover:bg-neutral-50"
                    key={value}
                    onClick={() => chooseSort(value)}
                    role="option"
                    type="button"
                  >
                    {t(label)}
                    {sort === value && <Check size={14} strokeWidth={1.5} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          aria-hidden={!filtersOpen}
          className={`grid border-b border-neutral-200 transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${filtersOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"}`}
          inert={!filtersOpen}
        >
          <div className="overflow-hidden">
            <div className="grid gap-5 py-5 sm:grid-cols-[minmax(220px,320px)_1fr] sm:items-center">
              <label className="flex items-center gap-3 border-b border-neutral-300 pb-2">
                <Search size={16} strokeWidth={1.4} />
                <input
                  aria-label={t("searchProducts")}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("find")}
                  value={search}
                />
              </label>
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                <button
                  aria-pressed={!category}
                  className={`text-xs ${!category ? "underline underline-offset-4" : "text-neutral-500"}`}
                  onClick={() => chooseCategory("")}
                  type="button"
                >
                  {t("all")}
                </button>
                {categories.map((item) => (
                  <button
                    aria-pressed={category === item}
                    className={`text-xs ${category === item ? "underline underline-offset-4" : "text-neutral-500"}`}
                    key={item}
                    onClick={() => chooseCategory(category === item ? "" : item)}
                    type="button"
                  >
                    {categoryName(item)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="py-5 sm:py-7">
          {isPending ? (
            <p className="py-20 text-center text-sm text-neutral-500">{t("loadingCatalog")}</p>
          ) : isError ? (
            <p className="py-20 text-center text-sm text-neutral-500">
              {error instanceof Error ? error.message : t("catalogError")}
            </p>
          ) : (
            <ProductGrid products={visibleProducts} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
