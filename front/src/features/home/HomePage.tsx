"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { useStorefront } from "@/shared/lib/storefront-context";
import { SiteFooter } from "@/shared/ui/SiteFooter";
import { SiteHeader } from "@/shared/ui/SiteHeader";
import { HomeCollection } from "./HomeCollection";

const campaignPhotos = [
  {
    image: "photo-1519238263530-99bdd11df2ea",
    alt: "Детская одежда для повседневных приключений",
  },
  {
    image: "photo-1516627145497-ae6968895b74",
    alt: "Удобные вещи для активного детства",
  },
];

const photo = (image: string, width: number) =>
  `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=85`;

const categories = [
  { label: "Одежда", query: "Одежда", image: "photo-1503919005314-30d93d07d823" },
  { label: "Обувь", query: "Обувь", image: "photo-1516627145497-ae6968895b74" },
  { label: "Аксессуары", query: "Аксессуары", image: "photo-1514090458221-65bb69cf63e6" },
];

export function HomePage() {
  const { t, categoryName } = useStorefront();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative mx-auto grid min-h-[72svh] max-w-[1900px] grid-cols-2 gap-1 px-2 pt-2 sm:min-h-[82svh] sm:gap-2 sm:px-4 sm:pt-4">
          {campaignPhotos.map((campaign, index) => (
            <div
              aria-label={campaign.alt}
              className={`min-h-[72svh] animate-image-in bg-neutral-100 bg-cover sm:min-h-[82svh] ${index === 0 ? "bg-[center_45%]" : "bg-[center_40%]"}`}
              key={campaign.image}
              role="img"
              style={{
                backgroundImage: `url("${photo(campaign.image, 1400)}")`,
                animationDelay: `${index * 100}ms`,
              }}
            />
          ))}
          <div className="pointer-events-none absolute inset-2 flex items-center justify-center sm:inset-4">
            <Link
              className="pointer-events-auto inline-flex min-w-44 items-center justify-center border border-white/90 bg-black/10 px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-[2px] transition-colors duration-300 hover:bg-white hover:text-black sm:min-w-52 sm:py-5 sm:text-xs"
              href="/catalog"
            >
              {t("shop")}
            </Link>
          </div>
          <p className="absolute bottom-5 left-5 text-[9px] uppercase tracking-[0.16em] text-white drop-shadow sm:bottom-8 sm:left-8 sm:text-[10px]">
            {t("collectionForChildhood")}
          </p>
        </section>

        <div className="mx-auto flex max-w-[1900px] items-center justify-between px-4 py-8 sm:px-7 sm:py-12 lg:px-[3.5vw]">
          <h1 className="text-xl font-light tracking-[0.08em] sm:text-2xl">
            {t("everydayThings")}
          </h1>
          <Link
            className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.15em] transition-opacity hover:opacity-55 sm:text-[10px]"
            href="/catalog"
          >
            {t("viewAll")} <ArrowRight size={14} strokeWidth={1.4} />
          </Link>
        </div>

        <HomeCollection />

        <section className="mx-auto max-w-[1900px] px-2 pb-14 sm:px-4 sm:pb-20">
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {categories.map((category, index) => (
              <Link
                className="group relative overflow-hidden bg-neutral-100"
                href={`/catalog?category=${encodeURIComponent(category.query)}`}
                key={category.query}
              >
                <div
                  aria-label={categoryName(category.label)}
                  className="aspect-[0.82] animate-image-in bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.025] sm:aspect-[1.15]"
                  role="img"
                  style={{
                    backgroundImage: `url("${photo(category.image, 900)}")`,
                    animationDelay: `${index * 90}ms`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white sm:bottom-6 sm:left-6 sm:right-6">
                  <span className="text-[9px] uppercase tracking-[0.12em] sm:text-sm sm:tracking-[0.16em]">
                    {categoryName(category.label)}
                  </span>
                  <ArrowDownRight className="size-4 sm:size-5" strokeWidth={1.4} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
