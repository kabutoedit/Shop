import { getProduct } from "@/shared/lib/cloudflare-store";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/products/[id]">,
) {
  const { id } = await context.params;
  const product = await getProduct(id);
  if (!product) {
    return Response.json({ error: "Товар не найден." }, { status: 404 });
  }
  return Response.json({ product }, { headers: { "Cache-Control": "no-store" } });
}
