import type { Product } from "@/shared/types/product";
import { useStorefront } from "@/shared/lib/storefront-context";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  const { t } = useStorefront();
  if (!products.length) {
    return (
      <div className="border-y border-neutral-200 py-20 text-center">
        <p className="text-sm">{t("emptyTitle")}</p>
        <p className="mt-2 text-xs text-neutral-500">{t("emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="product-grid grid grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-10 lg:gap-x-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
