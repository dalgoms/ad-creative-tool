import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { BrandForm } from "@/components/brands/BrandForm";

export const dynamic = "force-dynamic";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/brands"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Brands
      </Link>
      <h1 className="text-2xl font-bold">Edit Brand: {brand.name}</h1>
      <BrandForm brand={brand} />
    </div>
  );
}
