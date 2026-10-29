import { listCategories, listProducts } from "@/shared/lib/cloudflare-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search")?.trim().slice(0, 100) || undefined;
  const products = await listProducts({ category, search });
  const categories = await listCategories();
  return Response.json(
    { products, categories },
    { headers: { "Cache-Control": "no-store" } },
  );
}
