import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { CategoryRuleEditor } from "@/components/categories/CategoryRuleEditor";

export const dynamic = "force-dynamic";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.categoryRule.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Categories
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Version {category.version} &middot; Slug: {category.slug}
          </p>
        </div>
      </div>
      <CategoryRuleEditor category={category} />
    </div>
  );
}
