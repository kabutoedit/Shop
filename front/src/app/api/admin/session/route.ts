import { requireAdmin } from "@/shared/lib/cloudflare-auth";
import { getStoreEnv } from "@/shared/lib/cloudflare-store";

export async function GET(request: Request) {
  const env = await getStoreEnv();
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  return Response.json(
    { username: env.ADMIN_USERNAME },
    { headers: { "Cache-Control": "no-store" } },
  );
}
