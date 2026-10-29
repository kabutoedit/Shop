import { Suspense } from "react";
import { CatalogPage } from "@/features/catalog/CatalogPage";

export default function Page({ searchParams }: PageProps<"/catalog">) {
  return (
    <Suspense fallback={<p className="py-20 text-center text-sm">Загружаем каталог…</p>}>
      <CatalogParams params={searchParams} />
    </Suspense>
  );
}

async function CatalogParams({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await params;
  const search = typeof searchParams.q === "string" ? searchParams.q : "";

  return <CatalogPage key={search} initialSearch={search} />;
}
