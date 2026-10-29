import { requireAdmin } from "@/shared/lib/cloudflare-auth";
import { getStoreEnv } from "@/shared/lib/cloudflare-store";

const imageTypes = new Map([
  ["image/avif", "avif"],
  ["image/gif", "gif"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxFileSize = 8 * 1024 * 1024;
const maxFiles = 10;

export async function POST(request: Request) {
  const env = await getStoreEnv();
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Не удалось прочитать загруженные файлы." }, { status: 400 });
  }
  const entries = formData.getAll("images");
  const files = entries.filter((entry): entry is File => entry instanceof File);
  if (
    files.length !== entries.length ||
    !files.length ||
    files.length > maxFiles ||
    files.some(
      (file) =>
        !(file instanceof File) ||
        !imageTypes.has(file.type) ||
        file.size === 0 ||
        file.size > maxFileSize,
    )
  ) {
    return Response.json(
      { error: "Загрузите от 1 до 10 изображений (JPEG, PNG, WebP, AVIF или GIF) до 8 МБ каждое." },
      { status: 400 },
    );
  }

  const images: { url: string; alt: string }[] = [];
  for (const file of files) {
    const extension = imageTypes.get(file.type);
    if (!extension) {
      return Response.json({ error: "Формат изображения не поддерживается." }, { status: 400 });
    }
    const key = `${crypto.randomUUID()}.${extension}`;
    await env.PRODUCT_IMAGES.put(key, await file.arrayBuffer(), {
      metadata: { contentType: file.type },
    });
    images.push({ url: `/api/images/${key}`, alt: "" });
  }
  return Response.json({ images }, { status: 201 });
}
