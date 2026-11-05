import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function source(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('public renderer selects every declared template', () => {
  const renderer = source('src/render/TemplateRenderer.svelte');
  const manifest = JSON.parse(source('plugin.json'));
  const landingContribution = manifest.contributes.slots.find((slot) => slot.target === 'landing.templates');

  for (const template of landingContribution.templates) {
    assert.match(renderer, new RegExp(template.id));
  }
});

test('public renderer never renders author-controlled HTML', () => {
  const renderSources = fs
    .readdirSync(path.join(root, 'src/templates'), { recursive: true })
    .filter((entry) => typeof entry === 'string' && entry.endsWith('.svelte'))
    .map((entry) => source(path.join('src/templates', entry)))
    .join('\n');

  assert.equal(renderSources.includes('{@html'), false);
});

test('navigation and picker use typed SDK operations', () => {
  const bridge = source('src/shared/bridge.ts');
  const picker = source('src/picker/TemplatePicker.svelte');

  assert.match(bridge, /requestNavigation/);
  assert.match(picker, /landingTemplates\.preview/);
  assert.match(picker, /landingTemplates\.select/);
  assert.doesNotMatch(picker, /client\.action/);
});

test('runtime copy has locale-backed messages', () => {
  const messages = source('src/shared/i18n.ts');
  const picker = source('src/picker/TemplatePicker.svelte');

  assert.match(messages, /en:/);
  assert.match(messages, /fr:/);
  assert.match(messages, /es:/);
  assert.match(picker, /currentContext\.locale/);
});
