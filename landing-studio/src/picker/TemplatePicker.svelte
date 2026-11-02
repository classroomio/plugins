<script lang="ts">
  import { onMount } from 'svelte';
  import { createClassroomIOClient, type ClassroomIOClient } from '@classroomio/plugin-sdk';
  import { escapeHtml, renderLandingPage } from '@cio/landing-pages';
  import CheckIcon from '@lucide/svelte/icons/check';
  import LoaderIcon from '@lucide/svelte/icons/loader-2';
  import LayoutTemplateIcon from '@lucide/svelte/icons/layout-template';
  import { StudioApiClient } from '../shared/api';
  import type { StudioLandingPageTemplate } from '../shared/types';
  import { landingPageDocumentsMatch } from './template-match';

  const client: ClassroomIOClient = createClassroomIOClient();
  const api = new StudioApiClient(client);
  let templates = $state<StudioLandingPageTemplate[]>([]);
  let isLoading = $state(true);
  let applyingId = $state<string | null>(null);
  let selectedId = $state<string | null>(null);
  let errorMessage = $state('');
  let container = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(([entry]) => {
      const height = Math.ceil(entry?.contentRect.height ?? 0);
      if (height > 0) void client.ui.resize(height + 24);
    });
    observer.observe(container);
    return () => observer.disconnect();
  });

  onMount(async () => {
    try {
      const theme = await client.theme.get();
      document.documentElement.setAttribute('data-theme', theme.colorScheme);
    } catch {}

    try {
      const context = await client.context.get();
      const selectedTemplateId = context.surface?.resource?.selectedTemplateId;
      const selectedDocument = context.surface?.resource?.selectedTemplateDocument;
      const selectedTemplateName = context.surface?.resource?.selectedTemplateName;
      templates = await api.listTemplates();
      const selected =
        templates.find((template) => template.id === selectedTemplateId) ??
        templates.find((template) => landingPageDocumentsMatch(template.document, selectedDocument)) ??
        templates.find((template) => template.name === selectedTemplateName);
      selectedId = selected?.id ?? null;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to load landing page templates';
    } finally {
      isLoading = false;
    }
  });

  function renderPreview(template: StudioLandingPageTemplate): string {
    const rendered = renderLandingPage(template.document, {
      organization: { id: 'preview', name: 'Your Academy', slug: '', logoUrl: null },
      courses: [],
      auth: { isAuthenticated: false }
    });
    const styleOpen = '<' + 'style>';
    const styleClose = '</' + 'style>';
    return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(template.name)}</title>${styleOpen}*{box-sizing:border-box}html,body{margin:0}${rendered.css}${styleClose}</head><body>${rendered.html}</body></html>`;
  }

  async function applyTemplate(template: StudioLandingPageTemplate) {
    applyingId = template.id;
    errorMessage = '';
    try {
      await client.action('apply', {
        schema: 'classroomio.landing-page',
        version: 1,
        id: template.id,
        name: template.name,
        document: template.document
      });
      selectedId = template.id;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to apply landing page template';
    } finally {
      applyingId = null;
    }
  }
</script>

<div class="picker" bind:this={container}>
  <div class="heading">
    <span class="heading-icon"><LayoutTemplateIcon size={16} /></span>
    <div>
      <h3>Landing Page Studio</h3>
      <p>Select an organization template to use as your academy homepage.</p>
    </div>
  </div>

  {#if isLoading}
    <div class="state"><LoaderIcon class="spin" size={18} /> Loading templates…</div>
  {:else if errorMessage}
    <div class="state error">{errorMessage}</div>
  {:else if templates.length === 0}
    <div class="state">Create a landing page in Landing Page Studio to see it here.</div>
  {:else}
    <div class="grid">
      {#each templates as template (template.id)}
        <button
          type="button"
          class:active={selectedId === template.id}
          disabled={applyingId === template.id}
          onclick={() => applyTemplate(template)}
        >
          <span class="preview">
            <iframe title={template.name} srcdoc={renderPreview(template)} sandbox="" tabindex="-1"></iframe>
          </span>
          <span class="label">
            {#if applyingId === template.id}
              <LoaderIcon class="spin" size={12} />
            {:else if selectedId === template.id}
              <CheckIcon size={12} />
            {/if}
            {template.name}
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }
  :global(body) {
    margin: 0;
    font-family: var(--cio-font-sans, sans-serif);
    color: var(--cio-foreground, #0f172a);
  }
  .picker {
    width: 100%;
  }
  .heading {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .heading-icon {
    display: flex;
    padding: 7px;
    border-radius: 8px;
    color: var(--cio-accent, #2563eb);
    background: color-mix(in srgb, var(--cio-accent, #2563eb) 12%, transparent);
  }
  h3 {
    margin: 0;
    font-size: 14px;
  }
  p {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--cio-foreground-muted, #64748b);
  }
  .state {
    display: flex;
    min-height: 90px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 10px;
    background: var(--cio-surface-muted, #f8fafc);
    color: var(--cio-foreground-muted, #64748b);
    font-size: 13px;
  }
  .state.error {
    color: var(--cio-destructive, #dc2626);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 14px;
  }
  button {
    overflow: hidden;
    padding: 0;
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: 10px;
    background: var(--cio-surface, #fff);
    color: inherit;
    cursor: pointer;
    text-align: left;
    transition:
      border-color 0.15s,
      box-shadow 0.15s,
      transform 0.15s;
  }
  button:hover {
    transform: translateY(-2px);
    border-color: var(--cio-accent, #2563eb);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
  }
  button.active {
    border-color: var(--cio-accent, #2563eb);
    outline: 2px solid var(--cio-accent, #2563eb);
    outline-offset: 1px;
  }
  .preview {
    position: relative;
    display: block;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: #fff;
    pointer-events: none;
  }
  iframe {
    position: absolute;
    width: 1200px;
    height: 750px;
    border: 0;
    transform: scale(0.18);
    transform-origin: top left;
    pointer-events: none;
  }
  .label {
    display: flex;
    min-height: 38px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 600;
  }
  :global(.spin) {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
