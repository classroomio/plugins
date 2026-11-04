import type { TemplateDefinition } from './types';

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'neo-brutalism',
    name: 'Neo-Brutalism',
    tagline: 'Pop Creator / Indie Dev Academy',
    description: 'Chunky 3px high-contrast borders, tactile drop shadows, vibrant color-pop accents, and sticker tags.',
    thumbnail: 'assets/neo-brutalism-thumb.svg',
    tags: ['High Contrast', 'Bold', 'Playful', 'Indie']
  },
  {
    id: 'midnight-aurora',
    name: 'Midnight Aurora',
    tagline: 'Obsidian Glow / Elite AI & High-Tech',
    description: 'Deep obsidian backdrop with ambient radiant aurora mesh gradients, frosted glass cards, and neon accents.',
    thumbnail: 'assets/midnight-aurora-thumb.svg',
    tags: ['Dark Mode', 'Glassmorphism', 'High Tech', 'Modern']
  },
  {
    id: 'atelier',
    name: 'Atelier Editorial',
    tagline: 'Warm Editorial / Cultural Academy',
    description: 'Refined Italian paper warmth, classic high-contrast serif headlines, hairline borders, and book-jacket card layouts.',
    thumbnail: 'assets/atelier-thumb.svg',
    tags: ['Editorial', 'Serif', 'Minimalist', 'Sophisticated']
  }
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

