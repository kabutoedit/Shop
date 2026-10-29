import {
  checkLoginRateLimit,
  createSessionToken,
  sessionCookieHeader,
  verifyAdminCredentials,
} from "@/shared/lib/cloudflare-auth";
import { getStoreEnv } from "@/shared/lib/cloudflare-store";

export async function POST(request: Request) {
  const env = await getStoreEnv();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некорректный JSON в запросе." }, { status: 400 });
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("username" in body) ||
    !("password" in body) ||
    typeof body.username !== "string" ||
    typeof body.password !== "string" ||
    !body.username.length ||
    body.username.length > 100 ||
    !body.password.length ||
    body.password.length > 200
  ) {
    return Response.json(
      { error: "Введите имя пользователя и пароль." },
      { status: 400 },
    );
  }
  if (
    !env.ADMIN_SESSION_SECRET ||
    env.ADMIN_SESSION_SECRET.length < 32 ||
    !env.ADMIN_PASSWORD ||
    env.ADMIN_PASSWORD.length < 12 ||
    !env.ADMIN_USERNAME
  ) {
    return Response.json({ error: "Админка ещё не настроена." }, { status: 503 });
  }
  if (!(await checkLoginRateLimit(request, env))) {
    return Response.json(
      { error: "Слишком много попыток. Попробуйте через 15 минут." },
      { status: 429 },
    );
  }
  if (!(await verifyAdminCredentials(env, body.username, body.password))) {
    return Response.json(
      { error: "Неверное имя пользователя или пароль." },
      { status: 401 },
    );
  }

  const token = await createSessionToken(env);
  return Response.json(
    { username: env.ADMIN_USERNAME },
    { headers: { "Set-Cookie": sessionCookieHeader(token) } },
  );
}
