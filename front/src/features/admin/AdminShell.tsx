"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, PackagePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminApi } from "@/shared/api/products";

export function AdminShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: ["admin-session"],
    queryFn: adminApi.session,
    retry: false,
  });

  useEffect(() => {
    if (session.isError) {
      router.replace("/admin");
    }
  }, [router, session.isError]);

  async function logout() {
    await adminApi.logout();
    await queryClient.invalidateQueries({ queryKey: ["admin-session"] });
    router.replace("/admin");
  }

  if (session.isPending || session.isError) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-[#777d72]">
        Проверяем доступ…
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <header className="border-b border-[#e7e5df] bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link className="text-xl font-semibold tracking-[-0.08em]" href="/admin/products">
              mimo<span className="text-[#c58d70]">.</span>
              <span className="ml-2 text-[10px] font-normal uppercase tracking-[0.12em] text-[#777d72]">admin</span>
            </Link>
            <nav className="hidden items-center gap-5 sm:flex">
              <Link className="text-xs hover:underline" href="/admin/products">Товары</Link>
              <Link className="inline-flex items-center gap-1 text-xs hover:underline" href="/admin/products/new">
                <PackagePlus size={15} /> Добавить товар
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-[10px] uppercase tracking-[0.12em] text-[#777d72] hover:text-[#26352c]" href="/">
              Открыть магазин
            </Link>
            <button aria-label="Выйти из админки" className="flex items-center gap-2 text-xs" onClick={() => void logout()}>
              <LogOut size={15} /><span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
