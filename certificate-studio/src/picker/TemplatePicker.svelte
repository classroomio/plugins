<script lang="ts">
  import { onMount } from 'svelte';
  import { createClassroomIOClient, type ClassroomIOClient } from '@classroomio/plugin-sdk';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Check from '@lucide/svelte/icons/check';
  import Award from '@lucide/svelte/icons/award';
  import { renderCertificatePreviewDocument } from '../kit';
  import { StudioApiClient } from '../shared/api';
  import type { StudioTemplate } from '../shared/types';

  const client: ClassroomIOClient = createClassroomIOClient();
  const api = new StudioApiClient(client);

  let templates = $state<StudioTemplate[]>([]);
  let isLoading = $state(true);
  let errorMessage = $state<string | null>(null);
  let applyingId = $state<string | null>(null);
  let appliedId = $state<string | null>(null);
  let containerWidth = $state(340);
  let pickerEl = $state<HTMLElement | null>(null);

  const cardWidth = $derived(Math.max(80, (containerWidth - 12) / 2));
  const cardScale = $derived(cardWidth / 1100);

  $effect(() => {
    if (!pickerEl || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.ceil(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
        if (height > 0) {
          void client.ui.resize(height + 24);
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
      templates = await api.listTemplates();
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
    } finally {
      isLoading = false;
    }
  });

  function getPreviewDoc(template: StudioTemplate): string {
    const previewData = {
      recipientName: 'Student Name',
      courseName: 'Course Title',
      courseDescription: template.description || 'Certificate description',
      orgName: 'Academy',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      certificateId: 'SAMPLE-001'
    };
    return renderCertificatePreviewDocument(template.design, previewData);
  }

  async function handleApply(template: StudioTemplate) {
    applyingId = template.id;
    errorMessage = null;

    try {
      await client.action('apply', {
        schema: 'classroomio.certificate-document',
        version: 1,
        document: template.design,
        name: template.name
      });

      appliedId = template.id;
      void client.ui.toast({
        message: `Applied "${template.name}" to course certificate`,
        variant: 'success'
      });
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : 'Failed to apply template to course';
      void client.ui.toast({
        message: errorMessage,
        variant: 'error'
      });
    } finally {
      applyingId = null;
    }
  }
</script>

<div class="picker-container" bind:this={pickerEl}>
  <div class="picker-header">
    <div class="header-icon-box">
      <Award size={16} />
    </div>
    <div class="header-text">
      <h3 class="picker-title">Organization Templates</h3>
      <p class="picker-subtitle">Select a studio template to apply its design to this course</p>
    </div>
  </div>

  {#if isLoading}
    <div class="state-box">
      <Loader2 size={20} class="spinner" />
      <span>Loading studio templates...</span>
    </div>
  {:else if errorMessage}
    <div class="state-box error">
      <span>{errorMessage}</span>
    </div>
  {:else if templates.length === 0}
    <div class="empty-box">
      <p>No organization certificate templates found.</p>
      <p class="empty-subtext">Create templates in Organization Settings > Certificate Studio.</p>
    </div>
  {:else}
    <div class="grid-container" bind:clientWidth={containerWidth}>
      {#each templates as template (template.id)}
        {@const isApplying = applyingId === template.id}
        {@const isApplied = appliedId === template.id}
        <button
          type="button"
          class="card-button"
          class:is-active={isApplied}
          disabled={isApplying}
          onclick={() => handleApply(template)}
          title={`Click to apply ${template.name}`}
        >
          <div class="frame-wrapper">
            <iframe
              class="card-iframe"
              srcdoc={getPreviewDoc(template)}
              tabindex="-1"
              aria-hidden="true"
              title={template.name}
              style="transform: scale({cardScale});"
            ></iframe>
          </div>

          <span class="card-banner" class:applied-banner={isApplied}>
            {#if isApplying}
              <Loader2 size={10} class="spinner inline-icon" /> Applying...
            {:else if isApplied}
              <Check size={10} class="inline-icon" /> {template.name}
            {:else}
              {template.name}
            {/if}
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .picker-container {
    padding: 0;
    font-family: var(--cio-font-sans, 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    color: var(--cio-foreground, #0f172a);
  }

  .picker-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .header-icon-box {
    color: var(--cio-accent, #2563eb);
    background: rgba(37, 99, 235, 0.1);
    padding: 5px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header-text {
    min-width: 0;
  }

  .picker-title {
    font-size: 13px;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
  }

  .picker-subtitle {
    font-size: 11px;
    color: var(--cio-foreground-muted, #64748b);
    margin: 2px 0 0;
  }

  .state-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    font-size: 12px;
    color: var(--cio-foreground-muted, #64748b);
  }

  .state-box.error {
    color: var(--cio-destructive, #ef4444);
  }

  .empty-box {
    text-align: center;
    padding: 20px;
    font-size: 12px;
    color: var(--cio-foreground-muted, #64748b);
    background: var(--cio-surface-muted, rgba(0, 0, 0, 0.04));
    border-radius: 8px;
  }

  .empty-subtext {
    font-size: 11px;
    color: var(--cio-foreground-muted, #94a3b8);
    margin-top: 4px;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .card-button {
    position: relative;
    aspect-ratio: 1.4 / 1;
    overflow: hidden;
    border-radius: 6px;
    border: 1px solid var(--cio-border, #e2e8f0);
    background: #ffffff;
    padding: 0;
    cursor: pointer;
    text-align: left;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  }

  .card-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    border-color: var(--cio-accent, #2563eb);
  }

  .card-button.is-active {
    border-color: var(--cio-accent, #2563eb);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    outline: 2px solid var(--cio-accent, #2563eb);
    outline-offset: 1px;
  }

  .card-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
    box-shadow: none;
  }

  .frame-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #f8fafc;
  }

  .card-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 1100px;
    height: 780px;
    border: none;
    pointer-events: none;
    transform-origin: 0 0;
  }

  .card-banner {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 4px 8px;
    text-align: center;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: rgba(15, 23, 42, 0.9);
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .applied-banner {
    background: var(--cio-accent, #2563eb);
    color: var(--cio-accent-foreground, #ffffff);
  }

  :global(.inline-icon) {
    display: inline-block;
    flex-shrink: 0;
  }

  :global(.spinner) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
