import type { Product, ProductInput } from "@/shared/types/product";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(
  path: string,
  options: RequestInit & { admin?: boolean } = {},
): Promise<T> {
  const { admin = false, ...init } = options;
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: admin ? "include" : init.credentials,
    headers:
      init.body instanceof FormData
        ? init.headers
        : { "Content-Type": "application/json", ...init.headers },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(body?.error ?? `Ошибка запроса (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getProducts(filters: {
  category?: string;
  search?: string;
} = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  const query = params.size ? `?${params}` : "";
  return request<{ products: Product[]; categories: string[] }>(
    `/api/products${query}`,
  );
}

export async function getProduct(id: string) {
  return request<{ product: Product }>(`/api/products/${encodeURIComponent(id)}`);
}

export const adminApi = {
  session: () => request<{ username: string }>("/api/admin/session", { admin: true }),
  login: (username: string, password: string) =>
    request<{ username: string }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      admin: true,
    }),
  logout: () =>
    request<void>("/api/admin/logout", { method: "POST", admin: true }),
  products: () =>
    request<{ products: Product[] }>("/api/admin/products", { admin: true }),
  createProduct: (product: ProductInput) =>
    request<{ product: Product }>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(product),
      admin: true,
    }),
  updateProduct: (id: string, product: ProductInput) =>
    request<{ product: Product }>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
      admin: true,
    }),
  deleteProduct: (id: string) =>
    request<void>(`/api/admin/products/${id}`, {
      method: "DELETE",
      admin: true,
    }),
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return request<{ images: { url: string; alt: string }[] }>("/api/admin/uploads", {
      method: "POST",
      body: formData,
      admin: true,
    });
  },
};
