import type { ReactNode } from "react";
import type { AdTemplateProps } from "./components/AdTemplate";
import { AdTemplate } from "./components/AdTemplate";
import { PremiumGradient } from "./components/PremiumGradient";
import { BeautySoft } from "./components/BeautySoft";
import { EducationVibrant } from "./components/EducationVibrant";

export type TemplateComponent = (props: AdTemplateProps) => ReactNode;

const registry: Record<string, TemplateComponent> = {
  "premium-gradient": PremiumGradient,
  "beauty-soft": BeautySoft,
  "education-vibrant": EducationVibrant,

  "corporate-minimal": AdTemplate,
  "beauty-elegant": AdTemplate,
  "education-bold": AdTemplate,
};

export function getTemplateComponent(templateGroup: string): TemplateComponent {
  return registry[templateGroup] || AdTemplate;
}

export function listRegisteredTemplates(): string[] {
  return Object.keys(registry);
}
