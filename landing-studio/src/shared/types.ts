import type { LandingPageDocumentV1 } from '@cio/landing-pages';

export interface StudioLandingPageTemplate {
  id: string;
  name: string;
  document: LandingPageDocumentV1;
  createdAt: string;
  updatedAt: string;
}
