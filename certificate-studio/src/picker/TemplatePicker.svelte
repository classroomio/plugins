<script lang="ts">
  import { onMount } from 'svelte';
  import { createClassroomIOClient, type ClassroomIOClient } from '@classroomio/plugin-sdk';
  import Loader2 from '@lucide/svelte/icons/loader-2';
  import Check from '@lucide/svelte/icons/check';
  import Award from '@lucide/svelte/icons/award';
  import { renderCertificatePreview } from '@classroomio/certificate-kit';
  import { StudioApiClient } from '../shared/api';
  import type { StudioTemplate } from '../shared/types';

  const client: ClassroomIOClient = createClassroomIOClient();
  const api = new StudioApiClient(client);

  let templates = $state<StudioTemplate[]>([]);
  let isLoading = $state(true);
  let errorMessage = $state<string | null>(null);
  let applyingId = $state<string | null>(null);
  let appliedId = $state<string | null>(null);

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

  function getMiniPreview(template: StudioTemplate) {
    const previewData = {
      recipientName: 'Student Name',
      courseName: 'Course Title',
      courseDescription: template.description || '',
      orgName: 'Academy',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      certificateId: 'SAMPLE-001'
    };
    return renderCertificatePreview(template.design, previewData).html;
  }

  async function handleApply(template: StudioTemplate) {
    applyingId = template.id;
    errorMessage = null;

    try {
      await client.certificateTemplates.apply({
        externalTemplateId: template.id,
        externalTemplateVersion: template.revision,
        name: template.name,
        design: template.design
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

<div class="picker-container">
  <div class="picker-header">
    <div class="header-icon-box">
      <Award size={18} />
    </div>
    <div>
      <h3 class="picker-title">Organization Templates</h3>
      <p class="picker-subtitle">Select a studio template to apply its design to this course</p>
    </div>
  </div>

  {#if isLoading}
    <div class="state-box">
      <Loader2 size={24} class="spinner" />
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
    <div class="templates-list">
      {#each templates as template (template.id)}
        <div class="template-item" class:is-applied={appliedId === template.id}>
          <div class="thumbnail-wrapper">
            <div class="thumbnail-scaler">
              {@html getMiniPreview(template)}
            </div>
          </div>

          <div class="item-info">
            <h4 class="item-name">{template.name}</h4>
            <span class="item-badge">{template.design.templateId}</span>
          </div>

          <button
            type="button"
            class="apply-btn"
            class:applied={appliedId === template.id}
            disabled={applyingId === template.id}
            onclick={() => handleApply(template)}
          >
            {#if applyingId === template.id}
              <Loader2 size={14} class="spinner" />
              <span>Applying...</span>
            {:else if appliedId === template.id}
              <Check size={14} />
              <span>Applied</span>
            {:else}
              <span>Apply</span>
            {/if}
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .picker-container {
    padding: 16px;
    background: var(--cio-color-surface, #1e293b);
    color: var(--cio-color-text, #f8fafc);
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .picker-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .header-icon-box {
    color: var(--cio-color-primary, #3b82f6);
    background: rgba(59, 130, 246, 0.1);
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .picker-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }

  .picker-subtitle {
    font-size: 12px;
    color: var(--cio-color-text-secondary, #94a3b8);
    margin: 2px 0 0;
  }

  .state-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    font-size: 13px;
    color: var(--cio-color-text-secondary, #94a3b8);
  }

  .state-box.error {
    color: #ef4444;
  }

  .empty-box {
    text-align: center;
    padding: 24px;
    font-size: 13px;
    color: var(--cio-color-text-secondary, #94a3b8);
  }

  .empty-subtext {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
  }

  .templates-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .template-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--cio-color-border, #334155);
    border-radius: 8px;
    transition: border-color 0.15s ease;
  }

  .template-item:hover {
    border-color: rgba(59, 130, 246, 0.4);
  }

  .template-item.is-applied {
    border-color: rgba(34, 197, 94, 0.6);
    background: rgba(34, 197, 94, 0.05);
  }

  .thumbnail-wrapper {
    position: relative;
    width: 66px;
    height: 46px;
    border-radius: 4px;
    overflow: hidden;
    background: #000;
    flex-shrink: 0;
  }

  .thumbnail-scaler {
    position: absolute;
    top: 0;
    left: 0;
    width: 1100px;
    height: 780px;
    transform: scale(calc(66 / 1100));
    transform-origin: top left;
    pointer-events: none;
  }

  .item-info {
    flex: 1;
    min-width: 0;
  }

  .item-name {
    font-size: 13px;
    font-weight: 600;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-badge {
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.08);
    color: var(--cio-color-text-secondary, #94a3b8);
    padding: 1px 5px;
    border-radius: 3px;
  }

  .apply-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--cio-color-primary, #2563eb);
    color: #ffffff;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
  }

  .apply-btn:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .apply-btn.applied {
    background: #16a34a;
  }

  .apply-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
