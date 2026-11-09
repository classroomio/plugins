import type { TemplateDefinition } from './types';

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'neo-brutalism',
    name: 'Vanguard SaaS',
    tagline: 'High-Impact Product & Tech Academy',
    description: 'Vibrant high-contrast surfaces, luminous indigo gradients, browser-framed hero previews, and responsive bento cards.',
    thumbnail: 'assets/neo-brutalism-thumb.svg',
    tags: ['High Impact', 'SaaS', 'Bento', 'Modern']
  },
  {
    id: 'midnight-aurora',
    name: 'Obsidian Horizon',
    tagline: 'Modern Dark Luxury & AI Tech',
    description: 'Deep obsidian canvas with subtle micro-grid, ambient radial glows, frosted glass cards, and luminous cyan accents.',
    thumbnail: 'assets/midnight-aurora-thumb.svg',
    tags: ['Dark Luxury', 'High Tech', 'Glassmorphism', 'Modern']
  },
  {
    id: 'atelier',
    name: 'Atelier Minimal',
    tagline: 'Nordic Architectural & Swiss Editorial',
    description: 'Warm linen surfaces, high-contrast serif headlines, hairline borders, and refined book-jacket course presentations.',
    thumbnail: 'assets/atelier-thumb.svg',
    tags: ['Editorial', 'Minimalist', 'Architectural', 'Refined']
  }
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
