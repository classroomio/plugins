export interface AnnouncementConfig {
  mode: 'dynamic' | 'custom';
  message: string;
  linkText: string;
  linkUrl: string;
  backgroundColor: string;
  dismissible: boolean;
  revision: number;
}

export const DEFAULT_CONFIG: AnnouncementConfig = {
  mode: 'dynamic',
  message: 'Welcome! Explore newly released courses and interactive training tracks in your academy.',
  linkText: 'Explore courses',
  linkUrl: '/lms/explore',
  backgroundColor: '#2563eb',
  dismissible: true,
  revision: 1
};

export const PRESET_BANNER_COLORS = [
  { label: 'Primary Blue', value: '#2563eb' },
  { label: 'Deep Indigo', value: '#4f46e5' },
  { label: 'Royal Violet', value: '#7c3aed' },
  { label: 'Emerald Green', value: '#059669' },
  { label: 'Amber Warmth', value: '#d97706' },
  { label: 'Rose Accent', value: '#e11d48' },
  { label: 'Slate Dark', value: '#1e293b' }
];

export const PRESET_COLORS = PRESET_BANNER_COLORS.map((c) => c.value);

export function normalizeConfig(value: unknown): AnnouncementConfig {
  if (!value || typeof value !== 'object') return { ...DEFAULT_CONFIG };

  const candidate = value as Partial<AnnouncementConfig>;
  return {
    mode: candidate.mode === 'custom' ? 'custom' : 'dynamic',
    message: typeof candidate.message === 'string' ? candidate.message : DEFAULT_CONFIG.message,
    linkText: typeof candidate.linkText === 'string' ? candidate.linkText : DEFAULT_CONFIG.linkText,
    linkUrl: typeof candidate.linkUrl === 'string' ? candidate.linkUrl : DEFAULT_CONFIG.linkUrl,
    backgroundColor:
      typeof candidate.backgroundColor === 'string' ? candidate.backgroundColor : DEFAULT_CONFIG.backgroundColor,
    dismissible: typeof candidate.dismissible === 'boolean' ? candidate.dismissible : DEFAULT_CONFIG.dismissible,
    revision:
      typeof candidate.revision === 'number' && Number.isInteger(candidate.revision) && candidate.revision > 0
        ? candidate.revision
        : DEFAULT_CONFIG.revision
  };
}

export function isSafeHostPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}
