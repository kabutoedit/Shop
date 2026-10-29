"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi } from "@/shared/api/products";

export function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const login = useMutation({
    mutationFn: () => adminApi.login(username, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-session"] });
      router.replace("/admin/products");
    },
  });

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f6f2] px-5">
      <section className="w-full max-w-[420px] border border-[#e7e5df] bg-white p-7 sm:p-10">
        <Link className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#777d72]" href="/">
          <ArrowLeft size={14} /> В магазин
        </Link>
        <p className="mt-9 text-2xl font-semibold tracking-[-0.08em]">mimo<span className="text-[#c58d70]">.</span></p>
        <h1 className="mt-7 font-serif text-3xl tracking-[-0.04em]">Вход в админку</h1>
        <p className="mt-2 text-sm text-[#777d72]">Управление товарами магазина</p>
        <form
          className="mt-7 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            login.mutate();
          }}
        >
          <label className="block text-xs">
            Имя пользователя
            <input
              autoComplete="username"
              className="mt-2 w-full border border-[#dedfd5] px-3 py-3 text-sm outline-none focus:border-[#65755e]"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </label>
          <label className="block text-xs">
            Пароль
            <input
              autoComplete="current-password"
              className="mt-2 w-full border border-[#dedfd5] px-3 py-3 text-sm outline-none focus:border-[#65755e]"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {login.isError && (
            <p className="text-xs text-[#a84939]" role="alert">
              {login.error.message}
            </p>
          )}
          <button
            className="w-full bg-[#26352c] py-3.5 text-[10px] uppercase tracking-[0.14em] text-white disabled:opacity-60"
            disabled={login.isPending}
            type="submit"
          >
            {login.isPending ? "Входим…" : "Войти"}
          </button>
        </form>
      </section>
    </main>
  );
}
