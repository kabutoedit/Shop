import { compare, hash } from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";

export const sessionCookie = "mimo_admin_session";
const sessionDurationSeconds = 60 * 60 * 8;
const adminPasswordHash = process.env.ADMIN_PASSWORD
  ? hash(process.env.ADMIN_PASSWORD, 12)
  : Promise.resolve("");

function configuredSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32 || secret.includes("replace-this")) {
    throw new Error(
      "Задайте ADMIN_SESSION_SECRET длиной не менее 32 символов в back/.env",
    );
  }
  return new TextEncoder().encode(secret);
}

export function assertAdminConfiguration() {
  if (
    !process.env.ADMIN_USERNAME ||
    process.env.ADMIN_USERNAME === "admin" ||
    process.env.ADMIN_USERNAME.startsWith("change-this")
  ) {
    throw new Error("Задайте собственное имя ADMIN_USERNAME в back/.env");
  }
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12 || password.includes("replace-this")) {
    throw new Error(
      "Задайте ADMIN_PASSWORD длиной не менее 12 символов в back/.env",
    );
  }
  configuredSecret();
}

export async function verifyAdminCredentials(username: string, password: string) {
  const configuredUsername = process.env.ADMIN_USERNAME ?? "";
  const validPassword = await compare(password, await adminPasswordHash);
  return username === configuredUsername && validPassword;
}

export async function createSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(configuredSecret());
}

export async function requireAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token = request.cookies?.[sessionCookie];
  if (!token) {
    response.status(401).json({ error: "Требуется войти в админ-панель." });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, configuredSecret());
    if (payload.role !== "admin") {
      response.status(401).json({ error: "Недействительная сессия." });
      return;
    }
    next();
  } catch {
    response.status(401).json({ error: "Сессия истекла. Войдите снова." });
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/admin",
  maxAge: sessionDurationSeconds * 1000,
};
