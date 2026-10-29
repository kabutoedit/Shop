"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiUrl } from "@/shared/api/products";
import { CartProvider } from "@/shared/lib/cart-context";
import { invalidateProductQueries } from "@/shared/lib/product-query-cache";
import { StorefrontProvider } from "@/shared/lib/storefront-context";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ProductDataSync />
      <StorefrontProvider>
        <CartProvider>{children}</CartProvider>
      </StorefrontProvider>
    </QueryClientProvider>
  );
}

function ProductDataSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let revision: number | undefined;
    let active = true;

    const checkForUpdates = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/events`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Не удалось проверить обновления товаров (${response.status}).`);
        }
        const data = (await response.json()) as { revision?: unknown };
        if (typeof data.revision !== "number") {
          throw new Error("Сервер вернул некорректную версию каталога.");
        }
        if (!active) return;
        if (revision !== undefined && data.revision !== revision) {
          void invalidateProductQueries(queryClient);
        }
        revision = data.revision;
      } catch (error) {
        console.error("Не удалось синхронизировать каталог.", error);
      }
    };

    void checkForUpdates();
    const interval = window.setInterval(() => void checkForUpdates(), 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [queryClient]);

  return null;
}
