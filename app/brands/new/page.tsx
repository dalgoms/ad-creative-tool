import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandForm } from "@/components/brands/BrandForm";

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/brands"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Brands
      </Link>
      <h1 className="text-2xl font-bold">New Brand</h1>
      <BrandForm />
    </div>
  );
}
