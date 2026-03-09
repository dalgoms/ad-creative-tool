import { buildBackgroundImagePrompt } from "./prompt-builder";

interface VisualDirection {
  style: string;
  color_mood: string;
  background_prompt_template: string;
  avoid_visuals: string[];
  preferred_visuals: string[];
}

interface BrandColors {
  primaryColor: string;
  secondaryColor: string;
}

export function generateBackgroundPrompt(
  visualDirection: VisualDirection,
  brandColors?: BrandColors
): string {
  return buildBackgroundImagePrompt(visualDirection, brandColors);
}
