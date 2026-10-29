"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useStorefront } from "@/shared/lib/storefront-context";
import { SiteFooter } from "@/shared/ui/SiteFooter";
import { SiteHeader } from "@/shared/ui/SiteHeader";

export function ContactPage() {
  const { t } = useStorefront();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[65svh] w-full max-w-[1900px] flex-col justify-center px-4 py-16 sm:px-7 lg:px-[3.5vw]">
        <p className="mb-5 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          mimo · {t("contact")}
        </p>
        <h1 className="max-w-2xl text-4xl font-light tracking-[0.035em] sm:text-6xl">
          {t("contactTitle")}
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-7 text-neutral-600 sm:text-base">
          {t("contactText")}
        </p>
        <p className="mt-8 border-t border-neutral-200 pt-5 text-sm text-neutral-500">
          {t("contactDetails")}
        </p>
        <Link
          className="mt-10 inline-flex w-fit items-center gap-2 text-[10px] uppercase tracking-[0.14em] transition-opacity hover:opacity-55"
          href="/"
        >
          <ArrowLeft size={14} strokeWidth={1.4} /> {t("backHome")}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
