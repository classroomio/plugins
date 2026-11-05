<script lang="ts">
  import { onMount } from 'svelte';
  import { createClassroomIOClient, type ClassroomIOClient } from '@classroomio/plugin-sdk';
  import Check from '@lucide/svelte/icons/check';
  import Sparkles from '@lucide/svelte/icons/sparkles';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Eye from '@lucide/svelte/icons/eye';
  import { TEMPLATES } from '../shared/templates';
  import type { TemplateDefinition } from '../shared/types';
  import { getMessages } from '../shared/i18n';

  const client: ClassroomIOClient = createClassroomIOClient();

  let activeTemplateId = $state<string | null>(null);
  let applyingId = $state<string | null>(null);
  let pickerEl = $state<HTMLElement | null>(null);
  let isReady = $state(false);
  let locale = $state('en');
  const messages = $derived(getMessages(locale));

  $effect(() => {
    if (!pickerEl || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.ceil(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
        if (height > 0) {
          void client.ui.resize(height + 16);
        }
      }
    });

    observer.observe(pickerEl);
    return () => observer.disconnect();
  });

  onMount(async () => {
    try {
      const currentTheme = await client.theme.get();
      if (currentTheme?.colorScheme) {
        document.documentElement.setAttribute('data-theme', currentTheme.colorScheme);
      }
    } catch {}

    try {
      const currentContext = await client.context.get();
      locale = currentContext.locale ?? 'en';
      const resource = currentContext.surface?.resource as Record<string, unknown> | undefined;
      const appearance = resource?.appearance;
      if (appearance && typeof appearance === 'object' && 'templateId' in appearance) {
        activeTemplateId = String((appearance as Record<string, unknown>).templateId);
      } else if (resource?.selectedTemplateId) {
        activeTemplateId = String(resource.selectedTemplateId);
      }
    } catch {}

    isReady = true;
  });

  async function handlePreview(template: TemplateDefinition) {
    try {
      await client.landingTemplates.preview(template.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : messages.previewFailed;
      void client.ui.toast({
        message,
        variant: 'error'
      });
    }
  }

  async function handleActivate(template: TemplateDefinition) {
    applyingId = template.id;

    try {
      await client.landingTemplates.select(template.id);

      activeTemplateId = template.id;
      void client.ui.toast({
        message: messages.activated(template.name),
        variant: 'success'
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : messages.activateFailed;
      void client.ui.toast({
        message,
        variant: 'error'
      });
    } finally {
      applyingId = null;
    }
  }
</script>

<div class="picker-container" bind:this={pickerEl}>
  <div class="header">
    <div class="title-row">
      <div class="icon-wrap">
        <Sparkles size={16} />
      </div>
      <div>
        <h3 class="title">{messages.pickerTitle}</h3>
        <p class="subtitle">{messages.pickerSubtitle}</p>
      </div>
    </div>
  </div>

  <div class="templates-grid">
    {#each TEMPLATES as template (template.id)}
      {@const isActive = activeTemplateId === template.id}
      {@const isApplying = applyingId === template.id}

      <div class="template-card" class:active={isActive}>
        <div
          class="thumbnail-wrap"
          role="button"
          tabindex="0"
          onclick={() => handlePreview(template)}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handlePreview(template)}
          aria-label={`${messages.preview} ${template.name}`}
        >
          <img src={template.thumbnail} alt={template.name} class="thumbnail" />
          <div class="preview-overlay">
            <Eye size={16} />
            <span>{messages.preview}</span>
          </div>
          {#if isActive}
            <div class="active-badge">
              <Check size={12} strokeWidth={3} />
              <span>{messages.active}</span>
            </div>
          {/if}
        </div>

        <div class="content-wrap">
          <div class="name-row">
            <h4 class="name">{template.name}</h4>
          </div>
          <p class="tagline">{template.tagline}</p>
          <p class="description">{template.description}</p>

          <div class="tags-row">
            {#each template.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>

          <div class="action-wrap">
            <button
              type="button"
              class="btn btn-outline"
              onclick={() => handlePreview(template)}
            >
              <Eye size={14} />
              <span>{messages.preview}</span>
            </button>
            {#if isActive}
              <button class="btn btn-active" disabled>
                <Check size={14} />
                <span>{messages.selected}</span>
              </button>
            {:else}
              <button
                class="btn btn-primary"
                disabled={isApplying}
                onclick={() => handleActivate(template)}
              >
                {#if isApplying}
                  <Loader2 size={14} class="spin" />
                  <span>{messages.applying}</span>
                {:else}
                  <span>{messages.useTemplate}</span>
                {/if}
              </button>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .picker-container {
    padding: 0.5rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .icon-wrap {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: #f1f5f9;
    color: #4f46e5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global([data-theme='dark']) .icon-wrap {
    background: #1e1b4b;
    color: #818cf8;
  }

  .title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #0f172a;
  }

  :global([data-theme='dark']) .title {
    color: #f8fafc;
  }

  .subtitle {
    margin: 0.125rem 0 0;
    font-size: 0.8125rem;
    color: #64748b;
  }

  :global([data-theme='dark']) .subtitle {
    color: #94a3b8;
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  .template-card {
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    background: #ffffff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease;
  }

  :global([data-theme='dark']) .template-card {
    border-color: #1e293b;
    background: #0f172a;
  }

  .template-card:hover {
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  :global([data-theme='dark']) .template-card:hover {
    border-color: #334155;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }

  .template-card.active {
    border-color: #4f46e5;
    box-shadow: 0 0 0 1px #4f46e5;
  }

  .thumbnail-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    background: #f8fafc;
    border-bottom: 1px solid #f1f5f9;
    overflow: hidden;
    cursor: pointer;
  }

  .preview-overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    color: #ffffff;
    font-size: 0.8125rem;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .thumbnail-wrap:hover .preview-overlay {
    opacity: 1;
  }

  :global([data-theme='dark']) .thumbnail-wrap {
    background: #090a0f;
    border-bottom-color: #1e293b;
  }

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .active-badge {
    position: absolute;
    top: 0.625rem;
    right: 0.625rem;
    background: #4f46e5;
    color: #ffffff;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.6875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .content-wrap {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0.5rem;
  }

  .name {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
  }

  :global([data-theme='dark']) .name {
    color: #f8fafc;
  }

  .tagline {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4f46e5;
  }

  :global([data-theme='dark']) .tagline {
    color: #818cf8;
  }

  .description {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.4;
    color: #64748b;
    flex: 1;
  }

  :global([data-theme='dark']) .description {
    color: #94a3b8;
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 0.25rem;
  }

  .tag {
    font-size: 0.6875rem;
    padding: 0.125rem 0.5rem;
    border-radius: 0.375rem;
    background: #f1f5f9;
    color: #475569;
    font-weight: 500;
  }

  :global([data-theme='dark']) .tag {
    background: #1e293b;
    color: #94a3b8;
  }

  .action-wrap {
    margin-top: 0.75rem;
    display: flex;
    gap: 0.5rem;
  }

  .btn-outline {
    background: transparent;
    color: #0f172a;
    border: 1px solid #cbd5e1;
  }

  :global([data-theme='dark']) .btn-outline {
    color: #f8fafc;
    border-color: #334155;
  }

  .btn-outline:hover {
    background: #f1f5f9;
  }

  :global([data-theme='dark']) .btn-outline:hover {
    background: #1e293b;
  }

  .btn {
    width: 100%;
    padding: 0.5rem 0.875rem;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    transition: all 0.15s ease;
    border: none;
  }

  .btn-primary {
    background: #0f172a;
    color: #ffffff;
  }

  :global([data-theme='dark']) .btn-primary {
    background: #f8fafc;
    color: #0f172a;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1e293b;
  }

  :global([data-theme='dark']) .btn-primary:hover:not(:disabled) {
    background: #e2e8f0;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-active {
    background: #f1f5f9;
    color: #4f46e5;
    cursor: default;
    border: 1px solid #e0e7ff;
  }

  :global([data-theme='dark']) .btn-active {
    background: #1e1b4b;
    color: #818cf8;
    border-color: #312e81;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  :global(.spin) {
    animation: spin 1s linear infinite;
  }
</style>
