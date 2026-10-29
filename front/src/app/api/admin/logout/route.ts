import { clearedSessionCookieHeader } from "@/shared/lib/cloudflare-auth";

export function POST() {
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": clearedSessionCookieHeader() },
  });
}
