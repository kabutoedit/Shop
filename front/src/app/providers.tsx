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
    const events = new EventSource(`${apiUrl}/api/events`);
    events.onmessage = () => {
      void invalidateProductQueries(queryClient);
    };

    return () => events.close();
  }, [queryClient]);

  return null;
}
