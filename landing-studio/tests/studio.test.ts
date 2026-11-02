import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  getDefaultDocumentForTemplate,
  isLandingPageDocumentV1,
  renderLandingPage,
  TEMPLATES,
  validateLandingPageDocument
} from '@cio/landing-pages';
import { landingPageDocumentsMatch } from '../src/picker/template-match';

describe('Landing Page Studio Plugin', () => {
  it('has a valid plugin.json manifest', () => {
    const manifestPath = path.resolve(__dirname, '../plugin.json');
    const content = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(content);

    expect(manifest.id).toBe('com.classroomio.landing-studio');
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.manifestVersion).toBe(1);
    expect(manifest.runtime?.ui?.entrypoints?.studio?.resource).toBe('dist/studio.html');
    expect(manifest.contributes?.navigation?.[0]?.location).toBe('organization.navigation');
    expect(manifest.permissions?.required).toContain('plugin.storage:read');
    expect(manifest.permissions?.required).toContain('plugin.storage:write');
    expect(manifest.permissions?.required).toContain('course.metadata:read');
    expect(manifest.runtime?.ui?.entrypoints?.templatePicker?.resource).toBe('dist/picker.html');
    expect(manifest.contributes?.slots?.[0]?.target).toBe('landing.templates');
  });

  it('provides valid templates and default documents conforming to schema', () => {
    const templateIds = ['bootcamp', 'creator', 'modern', 'minimal'] as const;

    for (const id of templateIds) {
      const template = TEMPLATES[id];
      expect(template).toBeDefined();
      expect(template.id).toBe(id);

      const doc = getDefaultDocumentForTemplate(id);
      expect(isLandingPageDocumentV1(doc)).toBe(true);

      const validation = validateLandingPageDocument(doc);
      expect(validation.success).toBe(true);

      const rendered = renderLandingPage(doc, {
        organization: {
          id: 'org-test',
          name: 'Test Org',
          slug: 'test-org',
          logoUrl: null
        },
        courses: [
          {
            id: 'c-1',
            title: 'Fullstack Dev',
            description: 'Learn modern web dev',
            slug: 'fullstack-dev',
            published: true,
            image: null,
            isPricing: true,
            currency: 'USD',
            cost: 99,
            totalLessons: 12
          }
        ],
        auth: {
          isAuthenticated: false,
          user: null,
          action: { label: 'Sign in', href: '/login' }
        }
      });

      expect(rendered.html).toContain('Test Org');
      expect(rendered.html).toContain('Fullstack Dev');
      expect(rendered.css).toBeDefined();
    }
  });

  it('matches an applied template regardless of object key order', () => {
    const document = getDefaultDocumentForTemplate('modern');
    const reorderedDocument = Object.fromEntries(Object.entries(document).reverse());

    expect(landingPageDocumentsMatch(document, reorderedDocument)).toBe(true);
    expect(landingPageDocumentsMatch(document, getDefaultDocumentForTemplate('minimal'))).toBe(false);
  });

  it('Verifies zero private ClassroomIO internal imports in plugin source', () => {
    const srcDir = path.resolve(__dirname, '../src');

    function scanFiles(dir: string): string[] {
      const results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results.push(...scanFiles(fullPath));
        } else if (file.endsWith('.ts') || file.endsWith('.svelte') || file.endsWith('.html')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const files = scanFiles(srcDir);
    expect(files.length).toBeGreaterThan(0);

    const FORBIDDEN_PATTERNS = [
      /\$lib\//,
      /\$features\//,
      /\$app\//,
      /apps\//,
      /\.\.\/\.\.\/\.\.\//,
      /localStorage/,
      /sessionStorage/,
      /indexedDB/,
      /document\.cookie/,
      /@cio\/db/
    ];

    for (const file of files) {
      const fileContent = fs.readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN_PATTERNS) {
        const matches = fileContent.match(pattern);
        if (matches) {
          throw new Error(`Forbidden private import or storage pattern matching ${pattern} found in file: ${file}`);
        }
      }
    }
  });
});
