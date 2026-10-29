import type { QueryClient } from "@tanstack/react-query";

export function invalidateProductQueries(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["products"] }),
    queryClient.invalidateQueries({ queryKey: ["product"] }),
    queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  ]);
}
