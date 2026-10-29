"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getProduct } from "@/shared/api/products";
import { useCart } from "@/shared/lib/cart-context";
import { useStorefront } from "@/shared/lib/storefront-context";
import { SiteFooter } from "@/shared/ui/SiteFooter";
import { SiteHeader } from "@/shared/ui/SiteHeader";

export function ProductPage({ id }: { id: string }) {
  const { formatPrice, productDescription, productName, categoryName, variantLabel, ageLabel, t } = useStorefront();
  const { data, isPending, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const { addItem, lines } = useCart();

  if (isPending) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto min-h-[60vh] w-full max-w-[1600px] px-5 py-20 text-center text-sm text-neutral-500">
          {t("loadingProduct")}
        </main>
        <SiteFooter />
      </>
    );
  }

  if (isError || !data?.product) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto min-h-[60vh] w-full max-w-[1600px] px-5 py-20 text-center">
          <h1 className="text-3xl font-light">{t("notFound")}</h1>
          <Link className="mt-5 inline-block text-xs underline" href="/catalog">{t("backToCatalog")}</Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  const product = data.product;
  const colors = [...new Set(product.variants.map((variant) => variant.color).filter(Boolean))];
  const sizes = [...new Set(product.variants.map((variant) => variant.size).filter(Boolean))];
  const selectedVariant = product.variants.find(
    (variant) =>
      (!sizes.length || variant.size === selectedSize) &&
      (!colors.length || variant.color === selectedColor),
  );
  const availableVariants = product.variants.filter(
    (variant) => !colors.length || variant.color === selectedColor,
  );
  const canAdd = Boolean(selectedVariant && selectedVariant.stock > 0);
  const quantityInCart = selectedVariant
    ? lines.find((line) => line.variantId === selectedVariant.id)?.quantity ?? 0
    : 0;
  const image = product.images[selectedImage] ?? product.images[0];
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 sm:py-10 lg:px-12">
        <Link className="mb-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-neutral-500 transition-colors hover:text-black" href="/catalog">
          <ArrowLeft size={14} /> {t("backToCatalog")}
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="grid gap-3 sm:grid-cols-[78px_1fr]">
            <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
              {product.images.map((item, index) => (
                <button
                  aria-label={`${t("photo")} ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`h-[76px] w-[62px] shrink-0 bg-cover bg-center sm:h-[100px] sm:w-full ${selectedImage === index ? "ring-1 ring-black" : "opacity-70"}`}
                  key={item.id}
                  onClick={() => setSelectedImage(index)}
                  style={{ backgroundImage: `url("${item.url}")` }}
                />
              ))}
            </div>
            <div
              aria-label={image?.alt || productName(product)}
              className="aspect-[0.82] bg-neutral-100 bg-cover bg-center sm:order-2 sm:aspect-[0.9]"
              role="img"
              style={{ backgroundImage: image ? `url("${image.url}")` : undefined }}
            />
          </div>
          <section className="lg:sticky lg:top-8 lg:self-start lg:pt-5">
            <p className="text-[10px] uppercase tracking-[0.17em] text-neutral-500">{categoryName(product.category)}</p>
            <h1 className="mt-3 text-3xl font-light leading-tight tracking-[0.04em] sm:text-5xl">{productName(product)}</h1>
            <div className="mt-5 flex items-center gap-3">
              <span className="text-lg">{formatPrice(product.price)}</span>
              {product.originalPrice !== null && (
                <span className="text-sm text-[#8a8b83] line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            <p className="mt-6 border-y border-neutral-200 py-5 text-sm leading-7 text-neutral-600">{productDescription(product)}</p>

            {colors.length > 0 && (
              <fieldset className="mt-6">
                <legend className="mb-3 text-[10px] uppercase tracking-[0.12em]">{t("color")}: {selectedColor ? variantLabel(selectedColor) : t("selectColor")}</legend>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      aria-pressed={selectedColor === color}
                      className={`border px-4 py-2.5 text-xs transition-colors duration-200 ${selectedColor === color ? "border-black bg-black text-white" : "border-neutral-200 hover:border-neutral-500"}`}
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedSize("");
                      }}
                    >
                      {variantLabel(color)}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {sizes.length > 0 && (
              <fieldset className="mt-6">
                <legend className="mb-3 text-[10px] uppercase tracking-[0.12em]">{t("size")}: {selectedSize || t("chooseVariant")}</legend>
                <div className="flex flex-wrap gap-2">
                  {availableVariants.map((variant) => (
                    <button
                      aria-pressed={selectedSize === variant.size}
                      className={`min-w-12 border px-3 py-2.5 text-xs transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${selectedSize === variant.size ? "border-black bg-black text-white" : "border-neutral-200 hover:border-neutral-500"}`}
                      disabled={variant.stock <= 0}
                      key={variant.id}
                      onClick={() => {
                        setSelectedSize(variant.size);
                      }}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <button
              className="mt-8 w-full bg-black px-6 py-4 text-xs uppercase tracking-[0.16em] text-white transition-opacity duration-200 hover:opacity-75 disabled:cursor-not-allowed disabled:bg-neutral-300"
              disabled={!canAdd}
              onClick={() => {
                if (selectedVariant) {
                  addItem(product.id, selectedVariant.id, selectedVariant.stock);
                }
              }}
            >
              {quantityInCart
                ? `${t("inCart")}: ${quantityInCart}`
                : canAdd
                  ? t("addToCart")
                  : t("chooseAvailable")}
            </button>
            <div className="mt-7 space-y-3 border-t border-neutral-200 pt-5 text-xs text-neutral-500">
              <p>{t("deliveryInKyrgyzstan")}</p>
              <p>{t("sizeHelp")}</p>
              {product.age && <p>{t("age")}: {ageLabel(product.age)}</p>}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
