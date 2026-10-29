import { Suspense } from "react";
import { ProductPage } from "@/features/product/ProductPage";

export default function Page({ params }: PageProps<"/product/[id]">) {
  return (
    <Suspense fallback={<p className="py-20 text-center text-sm">Загружаем товар…</p>}>
      <ProductParams params={params} />
    </Suspense>
  );
}

async function ProductParams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductPage id={id} />;
}
