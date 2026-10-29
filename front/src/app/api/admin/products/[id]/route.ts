import { requireAdmin } from "@/shared/lib/cloudflare-auth";
import {
  deleteProduct,
  getStoreEnv,
  saveProduct,
} from "@/shared/lib/cloudflare-store";
import { productSchema } from "@/shared/lib/product-schema";

export async function PUT(
  request: Request,
  context: RouteContext<"/api/admin/products/[id]">,
) {
  const denied = await requireAdmin(request, await getStoreEnv());
  if (denied) return denied;
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некорректный JSON в запросе." }, { status: 400 });
  }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Проверьте заполнение полей товара." }, { status: 400 });
  }
  const product = await saveProduct(parsed.data, id);
  if (!product) {
    return Response.json({ error: "Товар не найден." }, { status: 404 });
  }
  return Response.json({ product });
}

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/admin/products/[id]">,
) {
  const denied = await requireAdmin(request, await getStoreEnv());
  if (denied) return denied;
  const { id } = await context.params;
  if (!(await deleteProduct(id))) {
    return Response.json({ error: "Товар не найден." }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
