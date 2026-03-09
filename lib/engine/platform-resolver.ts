import { prisma } from "@/lib/db/prisma";

export interface LayoutArea {
  x: number;
  y: number;
  maxWidth?: number;
  maxLines?: number;
  width?: number;
  height?: number;
  maxHeight?: number;
}

export interface LayoutRules {
  headline_area: LayoutArea;
  subcopy_area: LayoutArea;
  cta_area: LayoutArea;
  logo_area: LayoutArea;
  badge_area: LayoutArea | null;
}

export async function getPlatformPresets(presetIds: string[]) {
  const presets = await prisma.platformPreset.findMany({
    where: { id: { in: presetIds }, isActive: true },
  });

  return presets.map((p) => ({
    ...p,
    layoutRules: p.layoutRules as unknown as LayoutRules,
    safeZone: p.safeZone as unknown as { top: number; bottom: number; left: number; right: number },
  }));
}

export async function getAllPresets() {
  return prisma.platformPreset.findMany({
    where: { isActive: true },
    orderBy: [{ platform: "asc" }, { width: "asc" }],
  });
}
