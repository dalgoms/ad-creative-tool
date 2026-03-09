import { prisma } from "@/lib/db/prisma";

export async function getCategoryRule(categoryId: string) {
  const rule = await prisma.categoryRule.findUnique({
    where: { id: categoryId },
  });

  if (!rule) throw new Error(`Category rule not found: ${categoryId}`);
  if (!rule.isActive) throw new Error(`Category rule is inactive: ${categoryId}`);

  return {
    ...rule,
    keywords: rule.keywords as {
      primary: string[];
      secondary: string[];
      cta_keywords: string[];
      restricted: string[];
      required: string[];
    },
    tone: rule.tone as {
      voice: string;
      formality: string;
      emotion: string;
      description: string;
    },
    copyRules: rule.copyRules as {
      headline_max_chars: number;
      subcopy_max_chars: number;
      cta_max_chars: number;
      headline_style: string;
      avoid_patterns: string[];
      prompt_template: string;
    },
    visualDirection: rule.visualDirection as {
      style: string;
      color_mood: string;
      background_prompt_template: string;
      avoid_visuals: string[];
      preferred_visuals: string[];
    },
    templateMapping: rule.templateMapping as {
      default_template_group: string;
      platform_overrides: Record<string, string>;
    },
  };
}

export async function getAllCategories() {
  return prisma.categoryRule.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}
