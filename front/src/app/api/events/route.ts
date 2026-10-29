import { getProductRevision } from "@/shared/lib/cloudflare-store";

export async function GET() {
  return Response.json(
    { revision: await getProductRevision() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
