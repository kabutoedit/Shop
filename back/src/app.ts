import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { z } from "zod";
import {
  adminCookieOptions,
  createSessionToken,
  requireAdmin,
  sessionCookie,
  verifyAdminCredentials,
} from "./auth.js";
import { subscribeToProductEvents } from "./product-events.js";
import { adminProductRouter, productRouter } from "./routes/products.js";

export const app = express();
const uploadDirectory = resolve(process.env.UPLOADS_DIRECTORY ?? "uploads");
mkdirSync(uploadDirectory, { recursive: true });

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(uploadDirectory, {
    setHeaders: (response) => response.setHeader("X-Content-Type-Options", "nosniff"),
  }),
);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/events", (_request, response) => {
  subscribeToProductEvents(response);
});

app.use("/api/products", productRouter);

app.post(
  "/api/admin/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Слишком много попыток. Попробуйте через 15 минут." },
  }),
  async (request, response) => {
    const schema = z.object({
      username: z.string().min(1).max(100),
      password: z.string().min(1).max(200),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Введите имя пользователя и пароль." });
      return;
    }

    if (!(await verifyAdminCredentials(parsed.data.username, parsed.data.password))) {
      response.status(401).json({ error: "Неверное имя пользователя или пароль." });
      return;
    }

    response.cookie(sessionCookie, await createSessionToken(), adminCookieOptions);
    response.json({ username: process.env.ADMIN_USERNAME });
  },
);

app.post("/api/admin/logout", (_request, response) => {
  response.clearCookie(sessionCookie, { ...adminCookieOptions, maxAge: undefined });
  response.status(204).end();
});

app.get("/api/admin/session", requireAdmin, (_request, response) => {
  response.json({ username: process.env.ADMIN_USERNAME });
});

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_request, file, callback) => {
      const extension = file.mimetype === "image/jpeg" ? ".jpg"
        : file.mimetype === "image/png" ? ".png"
        : file.mimetype === "image/webp" ? ".webp"
        : file.mimetype === "image/avif" ? ".avif"
        : ".gif";
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (_request, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Поддерживаются только JPG, PNG, WebP, AVIF и GIF."));
    }
  },
});

app.post(
  "/api/admin/uploads",
  requireAdmin,
  upload.array("images", 10),
  (request, response) => {
    const files = request.files as Express.Multer.File[];
    response.status(201).json({
      images: files.map((file) => ({
        url: `${process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 4000}`}/uploads/${file.filename}`,
        alt: file.originalname.slice(0, 250),
      })),
    });
  },
);

app.use("/api/admin/products", adminProductRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error("API error:", error);
  if (error instanceof multer.MulterError) {
    response.status(400).json({ error: "Не удалось загрузить фотографии. Проверьте размер и количество файлов." });
    return;
  }
  if (error instanceof Error && error.message.startsWith("Поддерживаются только")) {
    response.status(400).json({ error: error.message });
    return;
  }
  if (error instanceof SyntaxError) {
    response.status(400).json({ error: "Некорректный JSON в запросе." });
    return;
  }
  response.status(500).json({ error: "Внутренняя ошибка сервера." });
});
