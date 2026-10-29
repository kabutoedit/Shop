"use client";

import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useCart } from "@/shared/lib/cart-context";
import { useStorefront } from "@/shared/lib/storefront-context";

const categories = [
  ["Одежда", "Одежда"],
  ["Обувь", "Обувь"],
  ["Аксессуары", "Аксессуары"],
  ["Для дома", "Для дома"],
];

export function SiteHeader() {
  const [menuRendered, setMenuRendered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { count } = useCart();
  const {
    currency,
    currencyOptions,
    locale,
    localeOptions,
    setCurrency,
    setLocale,
    t,
    categoryName,
  } = useStorefront();

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setShopOpen(false);
    document.body.style.overflow = "";
    menuToggleRef.current?.focus();
    closeTimer.current = setTimeout(() => {
      setMenuRendered(false);
      closeTimer.current = null;
    }, 300);
  }, []);

  useEffect(() => {
    if (!menuRendered) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
      if (event.key === "Tab") {
        const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeMenu, menuRendered]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  function openMenu() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    document.body.style.overflow = "hidden";
    setMenuRendered(true);
    window.requestAnimationFrame(() => {
      setMenuOpen(true);
      menuRef.current?.focus();
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/catalog?q=${encodeURIComponent(query)}` : "/catalog");
    setSearchOpen(false);
    if (menuRendered) closeMenu();
  }

  return (
    <>
      <div className="border-b border-neutral-200 px-4 py-2 text-center text-[9px] uppercase tracking-[0.16em] text-neutral-600 sm:text-[10px]">
        {t("deliveryNotice")}
      </div>
      <header className="relative z-30 border-b border-neutral-200 bg-white">
        <div className="relative mx-auto flex h-[68px] max-w-[1900px] items-center justify-between px-4 sm:h-[76px] sm:px-7 lg:px-[3.5vw]">
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="grid size-10 place-items-center"
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
            ref={menuToggleRef}
            type="button"
          >
            {menuOpen ? <X size={23} strokeWidth={1.3} /> : <Menu size={23} strokeWidth={1.3} />}
          </button>

          <Link
            aria-label="mimo — главная"
            className="absolute left-1/2 -translate-x-1/2 text-[27px] font-light tracking-[0.12em] text-neutral-950 sm:text-[31px]"
            href="/"
          >
            mimo
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            {searchOpen && (
              <form
                className="absolute left-4 right-4 top-full z-10 flex animate-dropdown items-center gap-3 border-b border-neutral-300 bg-white px-2 py-4 sm:left-auto sm:right-28 sm:w-72"
                onSubmit={submitSearch}
              >
                <Search size={18} strokeWidth={1.4} />
                <input
                  aria-label={t("searchProducts")}
                  autoFocus
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("searchProducts")}
                  value={search}
                />
                <button aria-label={t("close")} onClick={() => setSearchOpen(false)} type="button">
                  <X size={17} strokeWidth={1.4} />
                </button>
              </form>
            )}
            <button
              aria-expanded={searchOpen}
              aria-label={searchOpen ? t("close") : t("search")}
              className="grid size-10 place-items-center"
              onClick={() => setSearchOpen((open) => !open)}
              type="button"
            >
              <Search size={21} strokeWidth={1.35} />
            </button>
            <Link
              aria-label={`${t("cart")}: ${count}`}
              className="relative grid size-10 place-items-center"
              href="/cart"
            >
              <ShoppingBag size={21} strokeWidth={1.35} />
              {count > 0 && (
                <span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-neutral-950 px-1 text-[9px] text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {menuRendered && (
        <div className="fixed inset-0 z-50" aria-hidden={!menuOpen}>
          <button
            aria-label={t("closeMenu")}
            className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ease-out motion-reduce:transition-none ${menuOpen ? "opacity-100" : "opacity-0"}`}
            onClick={closeMenu}
            tabIndex={menuOpen ? 0 : -1}
            type="button"
          />
          <aside
            aria-label={t("menu")}
            aria-modal="true"
            className={`absolute inset-y-0 left-0 flex w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
            ref={menuRef}
            role="dialog"
            tabIndex={-1}
            inert={!menuOpen}
          >
            <div className="flex h-[68px] items-center justify-between border-b border-neutral-200 px-6 sm:h-[76px]">
              <span className="text-[10px] uppercase tracking-[0.17em] text-neutral-500">
                {t("menu")}
              </span>
              <button
                aria-label={t("closeMenu")}
                className="grid size-10 place-items-center"
                onClick={closeMenu}
                type="button"
              >
                <X size={21} strokeWidth={1.4} />
              </button>
            </div>

            <nav aria-label={t("menu")} className="flex-1 overflow-y-auto px-6 py-7">
              <Link className="block py-3 text-base font-normal tracking-normal" href="/" onClick={closeMenu}>
                {t("home")}
              </Link>
              <div className="border-t border-neutral-200">
                <button
                  aria-expanded={shopOpen}
                  className="flex w-full items-center justify-between py-4 text-base font-normal tracking-normal"
                  onClick={() => setShopOpen((open) => !open)}
                  type="button"
                >
                  {t("shop")}
                  <ChevronDown
                    className={`transition-transform duration-300 ${shopOpen ? "rotate-180" : ""}`}
                    size={19}
                    strokeWidth={1.4}
                  />
                </button>
                <div
                  aria-hidden={!shopOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${shopOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <Link
                      className="block pb-3 pl-3 text-base text-neutral-500 transition-colors hover:text-black"
                      href="/catalog"
                      onClick={closeMenu}
                      tabIndex={shopOpen ? 0 : -1}
                    >
                      {t("allProducts")}
                    </Link>
                    {categories.map(([category, query]) => (
                      <Link
                        className="block py-2 pl-3 text-base text-neutral-500 transition-colors hover:text-black"
                        href={`/catalog?category=${encodeURIComponent(query)}`}
                        key={category}
                        onClick={closeMenu}
                        tabIndex={shopOpen ? 0 : -1}
                      >
                        {categoryName(category)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                className="block border-t border-neutral-200 py-4 text-base font-normal tracking-normal"
                href="/contact"
                onClick={closeMenu}
              >
                {t("contact")}
              </Link>
              <Link
                className="block border-t border-neutral-200 py-4 text-base font-normal tracking-normal"
                href="/about"
                onClick={closeMenu}
              >
                {t("about")}
              </Link>
            </nav>

            <div className="space-y-5 border-t border-neutral-200 px-6 py-6">
              <div>
                <p className="mb-3 text-[9px] uppercase tracking-[0.15em] text-neutral-500">
                  {t("language")}
                </p>
                <div aria-label={t("chooseLanguage")} className="flex gap-2" role="group">
                  {localeOptions.map((option) => (
                    <button
                      aria-pressed={locale === option.value}
                      className={`min-w-12 border px-3 py-2 text-[10px] tracking-[0.12em] transition-colors duration-200 ${locale === option.value ? "border-black bg-black text-white" : "border-neutral-200 hover:border-neutral-500"}`}
                      key={option.value}
                      onClick={() => setLocale(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[9px] uppercase tracking-[0.15em] text-neutral-500">
                  {t("currency")}
                </p>
                <div aria-label={t("chooseCurrency")} className="flex gap-2" role="group">
                  {currencyOptions.map((option) => (
                    <button
                      aria-pressed={currency === option}
                      className={`min-w-14 border px-3 py-2 text-[10px] tracking-[0.1em] transition-colors duration-200 ${currency === option ? "border-black bg-black text-white" : "border-neutral-200 hover:border-neutral-500"}`}
                      key={option}
                      onClick={() => setCurrency(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <p className="mt-3 max-w-xs text-[10px] leading-5 text-neutral-500">
                  {t("currencyDisclaimer")}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
