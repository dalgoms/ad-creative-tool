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
  badgeText?: string;
}

export function buildCopyPrompt(
  category: CategoryRuleData,
  campaign: CampaignContext,
  variantCount: number
): string {
  const { keywords, tone, copyRules } = category;

  let prompt = copyRules.prompt_template;

  const replacements: Record<string, string> = {
    "{{productName}}": campaign.productName,
    "{{productDescription}}": campaign.productDescription || "Not specified",
    "{{targetAudience}}": campaign.targetAudience || "General audience",
    "{{tone.voice}}": tone.voice,
    "{{tone.emotion}}": tone.emotion,
    "{{tone.description}}": tone.description,
    "{{keywords.primary}}": keywords.primary.join(", "),
    "{{headline_max_chars}}": String(copyRules.headline_max_chars),
    "{{subcopy_max_chars}}": String(copyRules.subcopy_max_chars),
    "{{cta_max_chars}}": String(copyRules.cta_max_chars),
  };

  for (const [key, value] of Object.entries(replacements)) {
    prompt = prompt.replaceAll(key, value);
  }

  const systemPrompt = `You are an expert advertising copywriter. Generate exactly ${variantCount} ad copy variants.

RULES:
- Each headline must be under ${copyRules.headline_max_chars} characters
- Each subcopy must be under ${copyRules.subcopy_max_chars} characters
- Each CTA must be under ${copyRules.cta_max_chars} characters
- Headline style: ${copyRules.headline_style}
- NEVER use these patterns: ${copyRules.avoid_patterns.join(", ")}
- NEVER use these restricted words/phrases: ${keywords.restricted.join(", ")}
- Suggested CTA options: ${keywords.cta_keywords.join(", ")}
${keywords.required.length > 0 ? `- MUST include these words somewhere: ${keywords.required.join(", ")}` : ""}

Respond ONLY with valid JSON in this exact format:
{
  "variants": [
    {
      "headline": "...",
      "subcopy": "...",
      "cta": "...",
      "keywords_used": ["keyword1", "keyword2"]
    }
  ]
}`;

  return JSON.stringify({ system: systemPrompt, user: prompt });
}

export function buildBackgroundImagePrompt(
  visualDirection: {
    background_prompt_template: string;
    avoid_visuals: string[];
    preferred_visuals: string[];
  },
  brandColors?: { primaryColor: string; secondaryColor: string }
): string {
  let prompt = visualDirection.background_prompt_template;

  if (brandColors) {
    prompt = prompt.replace("{{brand.primary_color}}", brandColors.primaryColor);
    prompt = prompt.replace("{{brand.secondary_color}}", brandColors.secondaryColor);
  }

  prompt += `. Preferred elements: ${visualDirection.preferred_visuals.join(", ")}`;
  prompt += `. Avoid: ${visualDirection.avoid_visuals.join(", ")}`;

  return prompt;
}
