export interface PublicLandingLinkItem {
  label: string;
  href: string;
  disabled?: boolean;
}

export interface PublicLandingSocialLink {
  platform: string;
  href: string;
}

export interface PublicLandingCourse {
  id: string;
  title: string;
  description: string;
  bannerImage?: string | null;
  image?: string | null;
  cost?: number;
  price?: number;
  currency?: string;
  isPaid?: boolean;
  isFree?: boolean;
  lessonsCount?: number;
  studentsCount?: number;
  tags?: string[];
  href: string;
}

export interface PublicLandingLabels {
  coursesHeading: string;
  coursesSubheading?: string;
  coursesViewAll: string;
  coursesEmptyTitle: string;
  coursesEmptyDescription: string;
  courseFree: string;
  courseEnroll: string;
  courseLessons: string;
  courseStudents: string;
}

export interface PublicLandingActions {
  signIn?: PublicLandingLinkItem;
  account?: PublicLandingLinkItem;
}

export interface PublicLandingFooterColumn {
  id: string;
  heading: string;
  links: PublicLandingLinkItem[];
}

export interface PublicLandingFooter {
  tagline?: string;
  copyright?: string;
  text?: string;
  bottomText?: string;
  socials: PublicLandingSocialLink[];
  columns: PublicLandingFooterColumn[];
  bottomLinks: PublicLandingLinkItem[];
}

export interface PublicLandingCallout {
  enabled?: boolean;
  heading: string;
  description: string;
  action: PublicLandingLinkItem;
}

export interface PublicLandingEmbed {
  enabled?: boolean;
  title: string;
  description?: string;
  code: string;
  secondaryAction?: PublicLandingLinkItem;
}

export interface PublicLandingResourceCard {
  icon: string;
  title: string;
  description: string;
  href: string;
}

export interface PublicLandingLinks {
  enabled?: boolean;
  heading: string;
  description?: string;
  cards: PublicLandingResourceCard[];
}

export interface NormalizedLandingViewModel {
  templateId: string;
  organization: {
    id?: string;
    name: string;
    siteName?: string;
    logoUrl?: string;
  };
  hero: {
    heading: string;
    subheading: string;
    eyebrow?: string;
    image?: string;
    stats?: Array<{ label: string; value: string }>;
    primaryAction?: PublicLandingLinkItem;
    secondaryAction?: PublicLandingLinkItem;
  };
  navigation: PublicLandingLinkItem[];
  courses: PublicLandingCourse[];
  coursesLoaded: boolean;
  hasMoreCourses: boolean;
  callout?: PublicLandingCallout;
  embed?: PublicLandingEmbed;
  links?: PublicLandingLinks;
  footer: PublicLandingFooter;
  labels: PublicLandingLabels;
  actions: PublicLandingActions;
}

export interface PublicLandingPageViewModel {
  theme?: string;
  templateId?: string;
  organization: {
    id?: string;
    name: string;
    siteName?: string;
    avatarUrl?: string | null;
    logoUrl?: string;
  };
  hero: {
    heading: string;
    subheading?: string;
    eyebrow?: string;
    image?: string;
    stats?: Array<{ label: string; value: string }>;
    primaryAction?: PublicLandingLinkItem;
    secondaryAction?: PublicLandingLinkItem;
  };
  navigation?:
    | {
        navItems: PublicLandingLinkItem[];
        signInLabel?: string;
        accountLabel?: string;
        isAuthenticated?: boolean;
      }
    | Array<{ label: string; href: string }>;
  courses: PublicLandingCourse[];
  coursesLoaded?: boolean;
  hasMoreCourses?: boolean;
  links?: {
    enabled?: boolean;
    title?: string;
    heading?: string;
    description?: string;
    items?: PublicLandingLinkItem[];
    cards?: Array<{ icon?: string; title: string; description: string; href: string }>;
  };
  callout?: {
    enabled?: boolean;
    title?: string;
    heading?: string;
    description?: string;
    action?: PublicLandingLinkItem;
  };
  embed?: {
    enabled?: boolean;
    type?: 'youtube' | 'vimeo' | 'loom' | 'custom';
    url?: string;
    title?: string;
    description?: string;
    code?: string;
    secondaryAction?: PublicLandingLinkItem;
  };
  footer?: {
    tagline?: string;
    copyright?: string;
    text?: string;
    bottomText?: string;
    links?: PublicLandingLinkItem[];
    bottomLinks?: PublicLandingLinkItem[];
    socialLinks?: PublicLandingSocialLink[];
    socials?: PublicLandingSocialLink[];
    columns?: Array<{ id: string; heading: string; links: PublicLandingLinkItem[] }>;
  };
  labels?: Record<string, string>;
  actions?: {
    signIn?: PublicLandingLinkItem;
    account?: PublicLandingLinkItem;
  };
}

export interface TemplateDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  thumbnail: string;
  tags: string[];
}
