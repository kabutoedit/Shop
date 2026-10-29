import { Suspense } from "react";
import { AdminProductForm } from "@/features/admin/AdminProductForm";

export default function Page({ params }: PageProps<"/admin/products/[id]">) {
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
  return <AdminProductForm id={id} />;
}
