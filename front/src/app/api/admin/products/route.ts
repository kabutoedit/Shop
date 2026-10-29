import { requireAdmin } from "@/shared/lib/cloudflare-auth";
import {
  getStoreEnv,
  listProducts,
  saveProduct,
} from "@/shared/lib/cloudflare-store";
import { productSchema } from "@/shared/lib/product-schema";

export async function GET(request: Request) {
  const denied = await requireAdmin(request, await getStoreEnv());
  if (denied) return denied;
  return Response.json(
    { products: await listProducts({ includeInactive: true }) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request, await getStoreEnv());
  if (denied) return denied;
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Проверьте заполнение полей товара." }, { status: 400 });
  }
  const product = await saveProduct(parsed.data);
  return Response.json({ product }, { status: 201 });
}

async function readJson(request: Request): Promise<unknown | Response> {
  try {
    return await request.json();
  } catch {
    return Response.json({ error: "Некорректный JSON в запросе." }, { status: 400 });
  }
}
