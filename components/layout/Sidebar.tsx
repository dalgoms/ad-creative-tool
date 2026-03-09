"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Palette,
  FolderCog,
  Image,
  Layers,
  Monitor,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "Brands", href: "/brands", icon: Palette },
  { name: "Categories", href: "/categories", icon: FolderCog },
  { name: "Templates", href: "/templates", icon: Layers },
  { name: "Assets", href: "/assets", icon: Image },
  { name: "Platforms", href: "/settings/platforms", icon: Monitor },
  { name: "Webhooks", href: "/settings/webhooks", icon: Webhook },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold">
          A
        </div>
        <span className="text-lg font-semibold tracking-tight">Ad Creative</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <p className="text-xs text-zinc-500">Ad Creative Tool v1.0</p>
      </div>
    </aside>
  );
}
