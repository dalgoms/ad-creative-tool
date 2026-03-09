import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Brands ---
  const brand = await prisma.brand.upsert({
    where: { id: "brand_timbel" },
    update: {},
    create: {
      id: "brand_timbel",
      name: "Timbel",
      primaryColor: "#2563EB",
      secondaryColor: "#1E40AF",
      accentColor: "#F59E0B",
      headingFont: "Inter",
      bodyFont: "Inter",
      logoUrl: null,
    },
  });
  console.log(`Brand: ${brand.name}`);

  // --- Category Rules ---
  const categories = [
    {
      id: "cat_b2b_saas",
      name: "B2B SaaS",
      slug: "b2b-saas",
      keywords: {
        primary: ["ROI", "efficiency", "automation", "scale", "growth"],
        secondary: ["workflow", "integration", "dashboard", "analytics", "productivity"],
        cta_keywords: ["Start Free Trial", "Book a Demo", "Get Started"],
        restricted: ["cheap", "discount", "limited time", "buy now", "guaranteed"],
        required: [],
      },
      tone: {
        voice: "professional",
        formality: "high",
        emotion: "confident",
        description:
          "Authoritative but approachable. Data-driven language. Focus on business outcomes. Avoid hype.",
      },
      copyRules: {
        headline_max_chars: 40,
        subcopy_max_chars: 90,
        cta_max_chars: 20,
        headline_style: "benefit-first",
        avoid_patterns: ["!!!", "ALL CAPS words", "emojis"],
        prompt_template:
          "Generate ad copy for a B2B SaaS product called '{{productName}}'. Product: {{productDescription}}. Target audience: {{targetAudience}}. Tone: {{tone.voice}}, {{tone.emotion}}. Must include at least one keyword from: {{keywords.primary}}. Headline must be under {{headline_max_chars}} characters. Subcopy under {{subcopy_max_chars}} characters. CTA under {{cta_max_chars}} characters. Focus on business outcomes, not features. {{tone.description}}",
      },
      visualDirection: {
        style: "clean-corporate",
        color_mood: "cool-professional",
        background_prompt_template:
          "Clean abstract gradient background, blue and indigo tones, subtle geometric shapes, professional SaaS aesthetic, no text, no people, high resolution, minimalist",
        avoid_visuals: ["cartoons", "stock photo people", "cluttered backgrounds", "neon colors"],
        preferred_visuals: ["abstract gradients", "geometric patterns", "data visualizations", "clean tech"],
      },
      templateMapping: {
        default_template_group: "corporate-minimal",
        platform_overrides: {},
      },
    },
    {
      id: "cat_beauty",
      name: "Beauty",
      slug: "beauty",
      keywords: {
        primary: ["glow", "radiant", "natural", "hydrate", "transform"],
        secondary: ["skin", "self-care", "luminous", "dermatologist-tested", "gentle"],
        cta_keywords: ["Shop Now", "Discover More", "Try It Free"],
        restricted: ["anti-aging", "miracle", "cure", "permanent", "guaranteed results"],
        required: [],
      },
      tone: {
        voice: "aspirational",
        formality: "medium",
        emotion: "warm",
        description:
          "Inviting and sensory. Use descriptive, tactile language. Evoke feeling and self-care moments.",
      },
      copyRules: {
        headline_max_chars: 35,
        subcopy_max_chars: 80,
        cta_max_chars: 18,
        headline_style: "emotion-first",
        avoid_patterns: ["clinical jargon", "ALL CAPS", "aggressive urgency"],
        prompt_template:
          "Generate beauty/skincare ad copy for '{{productName}}'. Product: {{productDescription}}. Target audience: {{targetAudience}}. Tone: {{tone.voice}}, {{tone.emotion}}. Use sensory language. Must include a keyword from: {{keywords.primary}}. Headline under {{headline_max_chars}} chars. Subcopy under {{subcopy_max_chars}} chars. {{tone.description}}",
      },
      visualDirection: {
        style: "soft-luxury",
        color_mood: "warm-pastel",
        background_prompt_template:
          "Soft gradient background with warm pastel tones, rose gold and cream, subtle floral texture, luxurious beauty aesthetic, no text, no faces, clean composition, high resolution",
        avoid_visuals: ["harsh lighting", "clinical settings", "neon", "dark themes"],
        preferred_visuals: ["soft textures", "natural materials", "golden hour", "botanical elements"],
      },
      templateMapping: {
        default_template_group: "beauty-elegant",
        platform_overrides: {},
      },
    },
    {
      id: "cat_education",
      name: "Education",
      slug: "education",
      keywords: {
        primary: ["learn", "master", "skill", "career", "certified"],
        secondary: ["course", "instructor", "hands-on", "community", "flexible"],
        cta_keywords: ["Enroll Now", "Start Learning", "Join Free"],
        restricted: ["easy money", "get rich", "no effort", "guaranteed job"],
        required: [],
      },
      tone: {
        voice: "encouraging",
        formality: "medium",
        emotion: "motivating",
        description:
          "Supportive and empowering. Emphasize growth and possibility. Make learning feel achievable and exciting.",
      },
      copyRules: {
        headline_max_chars: 40,
        subcopy_max_chars: 90,
        cta_max_chars: 18,
        headline_style: "outcome-first",
        avoid_patterns: ["!!!", "clickbait", "false promises"],
        prompt_template:
          "Generate education/course ad copy for '{{productName}}'. Product: {{productDescription}}. Target audience: {{targetAudience}}. Tone: {{tone.voice}}, {{tone.emotion}}. Focus on transformation and outcomes. Must include a keyword from: {{keywords.primary}}. Headline under {{headline_max_chars}} chars. {{tone.description}}",
      },
      visualDirection: {
        style: "bold-modern",
        color_mood: "energetic-warm",
        background_prompt_template:
          "Modern gradient background with warm orange and deep purple tones, abstract shapes suggesting growth and progress, education technology aesthetic, no text, no people, high resolution",
        avoid_visuals: ["boring classroom", "stock photos", "childish illustrations"],
        preferred_visuals: ["abstract progress shapes", "warm gradients", "tech-meets-human", "upward movement"],
      },
      templateMapping: {
        default_template_group: "education-bold",
        platform_overrides: {},
      },
    },
  ];

  for (const cat of categories) {
    await prisma.categoryRule.upsert({
      where: { id: cat.id },
      update: {
        keywords: cat.keywords,
        tone: cat.tone,
        copyRules: cat.copyRules,
        visualDirection: cat.visualDirection,
        templateMapping: cat.templateMapping,
      },
      create: cat,
    });
    console.log(`Category: ${cat.name}`);
  }

  // --- Platform Presets ---
  const presets = [
    {
      id: "preset_meta_square",
      platform: "meta",
      placement: "feed",
      label: "Meta Feed Square",
      width: 1080,
      height: 1080,
      aspectRatio: "1:1",
      safeZone: { top: 60, bottom: 60, left: 60, right: 60 },
      layoutRules: {
        headline_area: { x: 60, y: 200, maxWidth: 960, maxLines: 2 },
        subcopy_area: { x: 60, y: 520, maxWidth: 960, maxLines: 2 },
        cta_area: { x: 60, y: 780, width: 320, height: 64 },
        logo_area: { x: 60, y: 60, maxWidth: 200, maxHeight: 60 },
        badge_area: { x: 820, y: 60, maxWidth: 200, maxHeight: 48 },
      },
      fontScale: 1.0,
    },
    {
      id: "preset_meta_portrait",
      platform: "meta",
      placement: "feed",
      label: "Meta Feed Portrait",
      width: 1080,
      height: 1350,
      aspectRatio: "4:5",
      safeZone: { top: 80, bottom: 80, left: 60, right: 60 },
      layoutRules: {
        headline_area: { x: 60, y: 300, maxWidth: 960, maxLines: 3 },
        subcopy_area: { x: 60, y: 700, maxWidth: 960, maxLines: 3 },
        cta_area: { x: 60, y: 1080, width: 360, height: 72 },
        logo_area: { x: 60, y: 60, maxWidth: 200, maxHeight: 60 },
        badge_area: { x: 820, y: 60, maxWidth: 200, maxHeight: 48 },
      },
      fontScale: 1.0,
    },
    {
      id: "preset_meta_story",
      platform: "meta",
      placement: "story",
      label: "Meta Story / Reel",
      width: 1080,
      height: 1920,
      aspectRatio: "9:16",
      safeZone: { top: 200, bottom: 200, left: 80, right: 80 },
      layoutRules: {
        headline_area: { x: 80, y: 600, maxWidth: 920, maxLines: 3 },
        subcopy_area: { x: 80, y: 1000, maxWidth: 920, maxLines: 2 },
        cta_area: { x: 80, y: 1400, width: 400, height: 80 },
        logo_area: { x: 80, y: 240, maxWidth: 180, maxHeight: 60 },
        badge_area: null,
      },
      fontScale: 1.1,
    },
    {
      id: "preset_linkedin_square",
      platform: "linkedin",
      placement: "feed",
      label: "LinkedIn Feed Square",
      width: 1200,
      height: 1200,
      aspectRatio: "1:1",
      safeZone: { top: 80, bottom: 80, left: 80, right: 80 },
      layoutRules: {
        headline_area: { x: 80, y: 260, maxWidth: 1040, maxLines: 2 },
        subcopy_area: { x: 80, y: 580, maxWidth: 1040, maxLines: 2 },
        cta_area: { x: 80, y: 880, width: 360, height: 72 },
        logo_area: { x: 80, y: 80, maxWidth: 220, maxHeight: 64 },
        badge_area: { x: 900, y: 80, maxWidth: 220, maxHeight: 52 },
      },
      fontScale: 1.05,
    },
    {
      id: "preset_linkedin_landscape",
      platform: "linkedin",
      placement: "feed",
      label: "LinkedIn Landscape",
      width: 1200,
      height: 627,
      aspectRatio: "1.91:1",
      safeZone: { top: 40, bottom: 40, left: 80, right: 80 },
      layoutRules: {
        headline_area: { x: 80, y: 120, maxWidth: 700, maxLines: 2 },
        subcopy_area: { x: 80, y: 340, maxWidth: 700, maxLines: 2 },
        cta_area: { x: 80, y: 480, width: 300, height: 60 },
        logo_area: { x: 900, y: 40, maxWidth: 220, maxHeight: 56 },
        badge_area: null,
      },
      fontScale: 0.9,
    },
  ];

  for (const preset of presets) {
    await prisma.platformPreset.upsert({
      where: { id: preset.id },
      update: preset,
      create: preset,
    });
    console.log(`Preset: ${preset.label}`);
  }

  // --- Template Definitions ---
  const templates = [
    {
      id: "tmpl_corporate_minimal",
      name: "Corporate Minimal",
      templateGroup: "corporate-minimal",
      compatiblePresets: [
        "preset_meta_square",
        "preset_meta_portrait",
        "preset_meta_story",
        "preset_linkedin_square",
        "preset_linkedin_landscape",
      ],
      layers: [
        { type: "background_image", source: "dynamic", fit: "cover", fallback_color: "#1a1a2e" },
        { type: "background_overlay", color: "#000000", opacity: 0.5 },
        { type: "logo", source: "brand", position: "from_preset", fallback: "hide" },
        {
          type: "badge",
          source: "dynamic",
          position: "from_preset",
          background_color: "brand.accentColor",
          text_color: "#FFFFFF",
          border_radius: 8,
          font_size: 16,
          font_weight: 700,
          fallback: "hide",
        },
        {
          type: "headline",
          source: "dynamic",
          position: "from_preset",
          font_family: "brand.headingFont",
          font_size: 48,
          font_weight: 800,
          color: "#FFFFFF",
          line_height: 1.15,
          text_align: "left",
          overflow: "truncate_ellipsis",
        },
        {
          type: "subcopy",
          source: "dynamic",
          position: "from_preset",
          font_family: "brand.bodyFont",
          font_size: 24,
          font_weight: 400,
          color: "#E0E0E0",
          line_height: 1.4,
          text_align: "left",
          overflow: "truncate_ellipsis",
        },
        {
          type: "cta_button",
          source: "dynamic",
          position: "from_preset",
          background_color: "brand.primaryColor",
          text_color: "#FFFFFF",
          font_size: 20,
          font_weight: 700,
          border_radius: 12,
          padding_x: 32,
          padding_y: 16,
        },
      ],
    },
    {
      id: "tmpl_beauty_elegant",
      name: "Beauty Elegant",
      templateGroup: "beauty-elegant",
      compatiblePresets: [
        "preset_meta_square",
        "preset_meta_portrait",
        "preset_meta_story",
        "preset_linkedin_square",
        "preset_linkedin_landscape",
      ],
      layers: [
        { type: "background_image", source: "dynamic", fit: "cover", fallback_color: "#FDF2F8" },
        { type: "background_overlay", color: "#FFFFFF", opacity: 0.3 },
        { type: "logo", source: "brand", position: "from_preset", fallback: "hide" },
        {
          type: "badge",
          source: "dynamic",
          position: "from_preset",
          background_color: "#BE185D",
          text_color: "#FFFFFF",
          border_radius: 20,
          font_size: 14,
          font_weight: 600,
          fallback: "hide",
        },
        {
          type: "headline",
          source: "dynamic",
          position: "from_preset",
          font_family: "brand.headingFont",
          font_size: 44,
          font_weight: 700,
          color: "#1F2937",
          line_height: 1.2,
          text_align: "center",
          overflow: "truncate_ellipsis",
        },
        {
          type: "subcopy",
          source: "dynamic",
          position: "from_preset",
          font_family: "brand.bodyFont",
          font_size: 22,
          font_weight: 400,
          color: "#4B5563",
          line_height: 1.5,
          text_align: "center",
          overflow: "truncate_ellipsis",
        },
        {
          type: "cta_button",
          source: "dynamic",
          position: "from_preset",
          background_color: "#BE185D",
          text_color: "#FFFFFF",
          font_size: 18,
          font_weight: 600,
          border_radius: 24,
          padding_x: 36,
          padding_y: 14,
        },
      ],
    },
    {
      id: "tmpl_education_bold",
      name: "Education Bold",
      templateGroup: "education-bold",
      compatiblePresets: [
        "preset_meta_square",
        "preset_meta_portrait",
        "preset_meta_story",
        "preset_linkedin_square",
        "preset_linkedin_landscape",
      ],
      layers: [
        { type: "background_image", source: "dynamic", fit: "cover", fallback_color: "#1E1B4B" },
        { type: "background_overlay", color: "#1E1B4B", opacity: 0.6 },
        { type: "logo", source: "brand", position: "from_preset", fallback: "hide" },
        {
          type: "badge",
          source: "dynamic",
          position: "from_preset",
          background_color: "#F97316",
          text_color: "#FFFFFF",
          border_radius: 6,
          font_size: 16,
          font_weight: 800,
          fallback: "hide",
        },
        {
          type: "headline",
          source: "dynamic",
          position: "from_preset",
          font_family: "brand.headingFont",
          font_size: 52,
          font_weight: 900,
          color: "#FFFFFF",
          line_height: 1.1,
          text_align: "left",
          overflow: "truncate_ellipsis",
        },
        {
          type: "subcopy",
          source: "dynamic",
          position: "from_preset",
          font_family: "brand.bodyFont",
          font_size: 24,
          font_weight: 400,
          color: "#D1D5DB",
          line_height: 1.4,
          text_align: "left",
          overflow: "truncate_ellipsis",
        },
        {
          type: "cta_button",
          source: "dynamic",
          position: "from_preset",
          background_color: "#F97316",
          text_color: "#FFFFFF",
          font_size: 22,
          font_weight: 800,
          border_radius: 8,
          padding_x: 36,
          padding_y: 18,
        },
      ],
    },
  ];

  for (const tmpl of templates) {
    await prisma.templateDefinition.upsert({
      where: { id: tmpl.id },
      update: tmpl,
      create: tmpl,
    });
    console.log(`Template: ${tmpl.name}`);
  }

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
