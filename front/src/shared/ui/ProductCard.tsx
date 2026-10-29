"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { useCart } from "@/shared/lib/cart-context";
import { useStorefront } from "@/shared/lib/storefront-context";
import type { Product } from "@/shared/types/product";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, lines } = useCart();
  const { formatPrice, productName, badgeLabel, t } = useStorefront();
  const image = product.images[0];
  const alternateImage = product.images[1];
  const availableVariants = product.variants.filter((variant) => variant.stock > 0);
  const quickAddVariant = availableVariants[0];
  const quantityInCart = quickAddVariant
    ? lines.find((line) => line.variantId === quickAddVariant.id)?.quantity ?? 0
    : 0;
  const name = productName(product);

  function quickAdd() {
    if (!quickAddVariant) return;
    addItem(product.id, quickAddVariant.id, quickAddVariant.stock);
  }

  return (
    <article className="group min-w-0 text-center">
      <div className="relative overflow-hidden bg-neutral-100">
        <Link
          aria-label={`${t("chooseOption")}: ${name}`}
          className="relative block"
          href={`/product/${product.id}`}
        >
          <div
            aria-label={image?.alt || name}
            className="aspect-[0.76] bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.015]"
            role="img"
            style={{
              backgroundImage: image
                ? `url("${image.url}")`
                : "linear-gradient(145deg, #f1f0ec, #e5e3dd)",
            }}
          />
          {alternateImage && (
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden bg-cover bg-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block"
              style={{ backgroundImage: `url("${alternateImage.url}")` }}
            />
          )}
          {product.badge && (
            <span className="absolute left-2 top-2 bg-white px-2 py-1 text-[9px] uppercase tracking-[0.12em] sm:left-3 sm:top-3">
              {badgeLabel(product.badge)}
            </span>
          )}
          {!availableVariants.length && (
            <span className="absolute inset-x-0 bottom-0 bg-white/90 py-3 text-[10px] uppercase tracking-[0.12em]">
              Нет в наличии
            </span>
          )}
        </Link>
        {!!availableVariants.length &&
          (availableVariants.length === 1 ? (
            <button
              aria-label={`${quantityInCart ? `${t("inCart")}: ${quantityInCart}` : t("addToCart")}: ${name}`}
              className="absolute inset-x-0 bottom-0 flex h-11 items-center justify-center gap-2 bg-white/95 text-[10px] uppercase tracking-[0.12em] opacity-100 transition-opacity hover:bg-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-neutral-900 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              onClick={quickAdd}
              type="button"
            >
              {quantityInCart ? <Check size={15} strokeWidth={1.5} /> : <Plus size={15} strokeWidth={1.5} />}
              {quantityInCart ? `${t("inCart")}: ${quantityInCart}` : t("addToCart")}
            </button>
          ) : (
            <Link
              className="absolute inset-x-0 bottom-0 flex h-11 items-center justify-center bg-white/95 text-[10px] uppercase tracking-[0.12em] opacity-100 transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              href={`/product/${product.id}`}
            >
              {t("chooseOption")}
            </Link>
          ))}
      </div>
      <div className="px-1 pt-3 sm:pt-4">
        <Link
          className="block text-[10px] uppercase tracking-[0.13em] hover:opacity-60 sm:text-xs sm:tracking-[0.17em]"
          href={`/product/${product.id}`}
        >
          {name}
        </Link>
        <div className="mt-1.5 flex items-center justify-center gap-2 text-[10px] tracking-[0.12em] text-neutral-500 sm:mt-2 sm:text-xs">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="line-through">{formatPrice(product.originalPrice)}</span>
          )}
          <span>{formatPrice(product.price)}</span>
        </div>
      </div>
    </article>
  );
}
