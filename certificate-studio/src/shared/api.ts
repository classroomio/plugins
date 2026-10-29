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

  async listTemplates(): Promise<StudioTemplate[]> {
    try {
      const records = await this.client.storage.list<StudioTemplate>(TEMPLATE_NAMESPACE, 'organization');
      return (records || [])
        .map((record) => record.value)
        .filter(isStudioTemplate)
        .filter((template) => template.isActive)
        .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
    } catch {
      return [];
    }
  }

  async getTemplate(id: string): Promise<StudioTemplate> {
    const template = await this.client.storage.get<StudioTemplate>(id, TEMPLATE_NAMESPACE, 'organization');
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

    await this.client.storage.set(template.id, template, TEMPLATE_NAMESPACE, 'organization');
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
    const currentTemplate = await this.getTemplate(id);

    const updatedTemplate: StudioTemplate = {
      ...currentTemplate,
      name: data.name ?? currentTemplate.name,
      description: data.description === undefined ? currentTemplate.description : data.description,
      design: data.design ?? currentTemplate.design,
      revision: currentTemplate.revision + 1,
      updatedAt: new Date().toISOString()
    };

    await this.client.storage.set(id, updatedTemplate, TEMPLATE_NAMESPACE, 'organization');
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    const currentTemplate = await this.getTemplate(id).catch(() => null);
    if (currentTemplate) {
      const archived: StudioTemplate = {
        ...currentTemplate,
        isActive: false,
        updatedAt: new Date().toISOString()
      };
      await this.client.storage.set(id, archived, TEMPLATE_NAMESPACE, 'organization');
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
