"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStorefront } from "@/shared/lib/storefront-context";
import { SiteFooter } from "@/shared/ui/SiteFooter";
import { SiteHeader } from "@/shared/ui/SiteHeader";

export function AboutPage() {
  const { t } = useStorefront();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1900px] px-4 sm:px-7 lg:px-[3.5vw]">
        <section className="grid min-h-[65svh] items-center gap-8 py-12 sm:grid-cols-[1fr_0.9fr] sm:gap-14 sm:py-16">
          <div className="max-w-xl py-4">
            <p className="mb-5 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              {t("aboutEyebrow")}
            </p>
            <h1 className="text-4xl font-light leading-[1.15] tracking-[0.025em] sm:text-6xl">
              {t("aboutTitle")}
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
              {t("aboutText")}
            </p>
            <p className="mt-8 border-t border-neutral-200 pt-5 text-[10px] uppercase tracking-[0.16em]">
              {t("aboutPromise")}
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] transition-opacity hover:opacity-55"
              href="/catalog"
            >
              {t("shopCollection")} <ArrowRight size={14} strokeWidth={1.4} />
            </Link>
          </div>
          <div
            aria-label={t("aboutTitle")}
            className="min-h-[55svh] animate-image-in bg-neutral-100 bg-cover bg-center"
            role="img"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1400&q=85")',
            }}
          />
        </section>
        <section className="border-t border-neutral-200 py-10 sm:py-14">
          <p className="max-w-3xl text-xl font-light leading-relaxed tracking-[0.025em] sm:text-3xl">
            {t("aboutStory")}
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
