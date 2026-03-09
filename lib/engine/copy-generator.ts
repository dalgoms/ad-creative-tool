import OpenAI from "openai";
import { buildCopyPrompt } from "./prompt-builder";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
  }
  return _openai;
}

export interface CopyVariantResult {
  headline: string;
  subcopy: string;
  cta: string;
  keywords_used: string[];
}

export interface CopyGenerationResult {
  variants: CopyVariantResult[];
  source: "openai" | "fallback";
  model?: string;
}

interface CategoryRuleData {
  keywords: {
    primary: string[];
    secondary: string[];
    cta_keywords: string[];
    restricted: string[];
    required: string[];
  };
  tone: {
    voice: string;
    formality: string;
    emotion: string;
    description: string;
  };
  copyRules: {
    headline_max_chars: number;
    subcopy_max_chars: number;
    cta_max_chars: number;
    headline_style: string;
    avoid_patterns: string[];
    prompt_template: string;
  };
}

interface CampaignContext {
  productName: string;
  productDescription?: string;
  targetAudience?: string;
}

export async function generateCopyWithFallback(
  category: CategoryRuleData,
  campaign: CampaignContext,
  variantCount: number = 3
): Promise<CopyGenerationResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      variants: generateFallbackCopy(category, campaign, variantCount),
      source: "fallback",
    };
  }

  try {
    const variants = await generateCopyVariants(category, campaign, variantCount);
    return { variants, source: "openai", model: "gpt-4o" };
  } catch (err) {
    console.warn("OpenAI copy generation failed, using fallback:", (err as Error).message);
    try {
      const variants = await generateCopyVariants(category, campaign, variantCount, 0.3);
      return { variants, source: "openai", model: "gpt-4o" };
    } catch {
      return {
        variants: generateFallbackCopy(category, campaign, variantCount),
        source: "fallback",
      };
    }
  }
}

export async function generateCopyVariants(
  category: CategoryRuleData,
  campaign: CampaignContext,
  variantCount: number = 3,
  temperature: number = 0.8
): Promise<CopyVariantResult[]> {
  const promptData = JSON.parse(
    buildCopyPrompt(category, campaign, variantCount)
  );

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: promptData.system },
      { role: "user", content: promptData.user },
    ],
    temperature,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(content);
  const variants: CopyVariantResult[] = parsed.variants;

  if (!Array.isArray(variants) || variants.length === 0) {
    throw new Error("OpenAI returned invalid variant structure");
  }

  const validated = validateAndTrimVariants(variants, category.copyRules);
  checkRestrictedPhrases(validated, category.keywords.restricted);
  return validated;
}

function validateAndTrimVariants(
  variants: CopyVariantResult[],
  rules: CategoryRuleData["copyRules"]
): CopyVariantResult[] {
  return variants.map((v) => ({
    headline: truncateWithEllipsis(v.headline, rules.headline_max_chars),
    subcopy: truncateWithEllipsis(v.subcopy, rules.subcopy_max_chars),
    cta: truncateWithEllipsis(v.cta, rules.cta_max_chars),
    keywords_used: v.keywords_used || [],
  }));
}

function checkRestrictedPhrases(variants: CopyVariantResult[], restricted: string[]) {
  if (restricted.length === 0) return;
  for (const v of variants) {
    const allText = `${v.headline} ${v.subcopy} ${v.cta}`.toLowerCase();
    for (const phrase of restricted) {
      if (allText.includes(phrase.toLowerCase())) {
        console.warn(`Restricted phrase "${phrase}" found in copy, allowing through (post-generation)`);
      }
    }
  }
}

function truncateWithEllipsis(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3).trimEnd() + "...";
}

export function generateFallbackCopy(
  category: CategoryRuleData,
  campaign: CampaignContext,
  variantCount: number = 3
): CopyVariantResult[] {
  const { keywords, copyRules } = category;
  const variants: CopyVariantResult[] = [];

  for (let i = 0; i < variantCount; i++) {
    const keyword = keywords.primary[i % keywords.primary.length];
    const cta = keywords.cta_keywords[i % keywords.cta_keywords.length];

    variants.push({
      headline: truncateWithEllipsis(
        `${keyword} Your Business with ${campaign.productName}`,
        copyRules.headline_max_chars
      ),
      subcopy: truncateWithEllipsis(
        campaign.productDescription || `Discover how ${campaign.productName} transforms your workflow.`,
        copyRules.subcopy_max_chars
      ),
      cta: truncateWithEllipsis(cta, copyRules.cta_max_chars),
      keywords_used: [keyword],
    });
  }

  return variants;
}
