import type { ClassroomIOClient } from '@classroomio/plugin-sdk';
import type { CertificateDesignV1, StudioTemplate } from './types';

const TEMPLATE_NAMESPACE = 'certificate-templates';

function isStudioTemplate(value: unknown): value is StudioTemplate {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const template = value as Partial<StudioTemplate>;
  return (
    typeof template.id === 'string' &&
    typeof template.name === 'string' &&
    typeof template.designVersion === 'number' &&
    typeof template.design === 'object' &&
    template.design !== null &&
    typeof template.revision === 'number' &&
    typeof template.isActive === 'boolean' &&
    typeof template.createdAt === 'string' &&
    typeof template.updatedAt === 'string'
  );
}

export class StudioApiClient {
  constructor(private client: ClassroomIOClient) {}

  private async getTemplatesMap(): Promise<Record<string, StudioTemplate>> {
    try {
      const raw = await this.client.preferences.get<Record<string, StudioTemplate>>(
        'templates_catalog',
        TEMPLATE_NAMESPACE
      );
      return raw || {};
    } catch {
      return {};
    }
  }

  private async saveTemplatesMap(map: Record<string, StudioTemplate>): Promise<void> {
    await this.client.preferences.set('templates_catalog', map, TEMPLATE_NAMESPACE);
  }

  async listTemplates(): Promise<StudioTemplate[]> {
    const map = await this.getTemplatesMap();
    return Object.values(map)
      .filter(isStudioTemplate)
      .filter((template) => template.isActive)
      .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
  }

  async getTemplate(id: string): Promise<StudioTemplate> {
    const map = await this.getTemplatesMap();
    const template = map[id];
    if (!isStudioTemplate(template) || !template.isActive) {
      throw new Error('Certificate template not found');
    }

    return template;
  }

  async createTemplate(data: {
    name: string;
    description?: string | null;
    designVersion?: number;
    design: CertificateDesignV1;
  }): Promise<StudioTemplate> {
    const context = await this.client.context.get();
    const now = new Date().toISOString();
    const template: StudioTemplate = {
      id: crypto.randomUUID(),
      installationId: context.installationId,
      name: data.name,
      description: data.description ?? null,
      designVersion: data.designVersion ?? 1,
      design: data.design,
      revision: 1,
      isActive: true,
      createdBy: '',
      createdAt: now,
      updatedAt: now
    };

    const map = await this.getTemplatesMap();
    map[template.id] = template;
    await this.saveTemplatesMap(map);
    return template;
  }

  async updateTemplate(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      design?: CertificateDesignV1;
    }
  ): Promise<StudioTemplate> {
    const map = await this.getTemplatesMap();
    const currentTemplate = map[id];
    if (!currentTemplate) throw new Error('Certificate template not found');

    const updatedTemplate: StudioTemplate = {
      ...currentTemplate,
      name: data.name ?? currentTemplate.name,
      description: data.description === undefined ? currentTemplate.description : data.description,
      design: data.design ?? currentTemplate.design,
      revision: currentTemplate.revision + 1,
      updatedAt: new Date().toISOString()
    };

    map[id] = updatedTemplate;
    await this.saveTemplatesMap(map);
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    const map = await this.getTemplatesMap();
    if (map[id]) {
      map[id] = { ...map[id], isActive: false, updatedAt: new Date().toISOString() };
      await this.saveTemplatesMap(map);
    }
  }

  async cloneTemplate(id: string): Promise<StudioTemplate> {
    const template = await this.getTemplate(id);
    return this.createTemplate({
      name: `${template.name} (copy)`,
      description: template.description,
      designVersion: template.designVersion,
      design: template.design
    });
  }
}
