import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { StoreEnv } from "@/shared/lib/cloudflare-store";

export const sessionCookie = "mimo_admin_session";
const sessionDurationSeconds = 60 * 60 * 8;
let adminPasswordHash: Promise<string> | undefined;

function isConfigured(env: StoreEnv) {
  return Boolean(
    env.ADMIN_USERNAME &&
      env.ADMIN_PASSWORD &&
      env.ADMIN_PASSWORD.length >= 12 &&
      env.ADMIN_SESSION_SECRET &&
      env.ADMIN_SESSION_SECRET.length >= 32,
  );
}

export async function requireAdmin(request: Request, env: StoreEnv) {
  if (!isConfigured(env)) {
    return Response.json({ error: "Админка ещё не настроена." }, { status: 503 });
  }
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookie}=`))
    ?.slice(sessionCookie.length + 1);
  if (!token) {
    return Response.json({ error: "Требуется войти в админ-панель." }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(env.ADMIN_SESSION_SECRET),
    );
    if (payload.role === "admin") return null;
  } catch {
    return Response.json({ error: "Сессия истекла. Войдите снова." }, { status: 401 });
  }
  return Response.json({ error: "Недействительная сессия." }, { status: 401 });
}

export async function checkLoginRateLimit(request: Request, env: StoreEnv) {
  const address = request.headers.get("cf-connecting-ip") ?? "local";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.ADMIN_SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(address)),
  );
  const ipHash = Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO admin_login_attempts (ip_hash, window_start, attempts)
     VALUES (?, ?, 1)
     ON CONFLICT(ip_hash) DO UPDATE SET
       attempts = CASE WHEN window_start <= ? THEN 1 ELSE attempts + 1 END,
       window_start = CASE WHEN window_start <= ? THEN excluded.window_start ELSE window_start END`,
  )
    .bind(ipHash, now, now - 15 * 60 * 1000, now - 15 * 60 * 1000)
    .run();
  const attempt = await env.DB
    .prepare("SELECT attempts FROM admin_login_attempts WHERE ip_hash = ?")
    .bind(ipHash)
    .first<{ attempts: number }>();
  return (attempt?.attempts ?? 0) <= 10;
}

export async function verifyAdminCredentials(
  env: StoreEnv,
  username: string,
  password: string,
) {
  if (!isConfigured(env) || username !== env.ADMIN_USERNAME) return false;
  adminPasswordHash ??= hash(env.ADMIN_PASSWORD, 12);
  return compare(password, await adminPasswordHash);
}

export async function createSessionToken(env: StoreEnv) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(new TextEncoder().encode(env.ADMIN_SESSION_SECRET));
}

export function sessionCookieHeader(token: string) {
  return `${sessionCookie}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=${sessionDurationSeconds}`;
}

export function clearedSessionCookieHeader() {
  return `${sessionCookie}=; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=0`;
}
