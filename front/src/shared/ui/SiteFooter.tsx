"use client";

import Link from "next/link";
import { useStorefront } from "@/shared/lib/storefront-context";

export function SiteFooter() {
  const { t } = useStorefront();

  return (
    <footer className="mt-10 border-t border-neutral-200">
      <div className="mx-auto flex max-w-[1900px] flex-col gap-6 px-4 py-8 text-[10px] uppercase tracking-[0.12em] sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-[3.5vw]">
        <Link className="text-xl font-light tracking-[0.12em]" href="/">
          mimo
        </Link>
        <nav aria-label="Информация о магазине" className="flex flex-wrap gap-x-6 gap-y-3 text-neutral-600">
          <Link className="hover:text-neutral-950" href="/">{t("home")}</Link>
          <Link className="hover:text-neutral-950" href="/catalog">{t("footerShop")}</Link>
          <Link className="hover:text-neutral-950" href="/cart">{t("cart")}</Link>
          <Link className="hover:text-neutral-950" href="/contact">{t("contact")}</Link>
          <Link className="hover:text-neutral-950" href="/about">{t("about")}</Link>
        </nav>
        <p className="text-neutral-500">© mimo, 2026 · {t("footerCountry")}</p>
      </div>
    </footer>
  );
}
