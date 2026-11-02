import { isLandingPageDocumentV1, type LandingPageDocumentV1 } from '@cio/landing-pages';
import type { ClassroomIOClient } from '@classroomio/plugin-sdk';
import type { StudioLandingPageTemplate } from './types';

const TEMPLATE_NAMESPACE = 'landing-page-templates';

function isStudioTemplate(value: unknown): value is StudioLandingPageTemplate {
  if (!value || typeof value !== 'object') return false;

  const template = value as Record<string, unknown>;
  return (
    typeof template.id === 'string' &&
    typeof template.name === 'string' &&
    typeof template.createdAt === 'string' &&
    typeof template.updatedAt === 'string' &&
    isLandingPageDocumentV1(template.document)
  );
}

export class StudioApiClient {
  constructor(private readonly client: ClassroomIOClient) {}

  async listTemplates(): Promise<StudioLandingPageTemplate[]> {
    const records = await this.client.storage.list<StudioLandingPageTemplate>(TEMPLATE_NAMESPACE, 'organization');
    return records
      .map((record) => record.value)
      .filter(isStudioTemplate)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async createTemplate(name: string, document: LandingPageDocumentV1): Promise<StudioLandingPageTemplate> {
    const timestamp = new Date().toISOString();
    const template: StudioLandingPageTemplate = {
      id: crypto.randomUUID(),
      name,
      document: JSON.parse(JSON.stringify(document)),
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.client.storage.set(template.id, template, TEMPLATE_NAMESPACE, 'organization');
    return template;
  }

  async updateTemplate(
    template: StudioLandingPageTemplate,
    name: string,
    document: LandingPageDocumentV1
  ): Promise<StudioLandingPageTemplate> {
    const updatedTemplate: StudioLandingPageTemplate = {
      ...template,
      name,
      document: JSON.parse(JSON.stringify(document)),
      updatedAt: new Date().toISOString()
    };
    await this.client.storage.set(updatedTemplate.id, updatedTemplate, TEMPLATE_NAMESPACE, 'organization');
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.client.storage.delete(id, TEMPLATE_NAMESPACE, 'organization');
  }
}
