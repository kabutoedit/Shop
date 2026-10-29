import { getStoreEnv } from "@/shared/lib/cloudflare-store";

const imageKeyPattern = /^[0-9a-f-]{36}\.(avif|gif|jpg|png|webp)$/;

export async function GET(
  _request: Request,
  context: RouteContext<"/api/images/[key]">,
) {
  const { key } = await context.params;
  if (!imageKeyPattern.test(key)) {
    return Response.json({ error: "Изображение не найдено." }, { status: 404 });
  }
  const { value, metadata } = await (await getStoreEnv())
    .PRODUCT_IMAGES.getWithMetadata<{ contentType?: string }>(key, "arrayBuffer");
  if (!value) {
    return Response.json({ error: "Изображение не найдено." }, { status: 404 });
  }
  return new Response(value, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": metadata?.contentType ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
