<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { createClassroomIOClient } from '@classroomio/plugin-sdk';
  import {
    DEFAULT_CONFIG,
    PRESET_BANNER_COLORS,
    isSafeHostPath,
    normalizeConfig,
    type AnnouncementConfig
  } from './config';

  const client = createClassroomIOClient();
  let config = $state<AnnouncementConfig>({ ...DEFAULT_CONFIG });
  let saved = $state(false);
  let errorMessage = $state('');
  let isSaving = $state(false);

  async function reportHeight() {
    await client.ui.resize(document.documentElement.scrollHeight);
  }

  async function save() {
    errorMessage = '';
    saved = false;
    if (config.mode === 'custom' && config.linkUrl && !isSafeHostPath(config.linkUrl)) {
      errorMessage = 'Use a ClassroomIO path beginning with one slash, for example /lms/explore.';
      return;
    }

    isSaving = true;
    const nextConfig = { ...config, revision: config.revision + 1 };

    try {
      await client.storage.set('config', nextConfig, 'announcement', 'organization');
      config = nextConfig;
      saved = true;
      await client.ui.toast({ message: 'Announcement settings saved', variant: 'success' });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Announcement settings could not be saved.';
    } finally {
      isSaving = false;
    }
  }

  function reset() {
    config = { ...DEFAULT_CONFIG, revision: config.revision + 1 };
    saved = false;
    errorMessage = '';
  }

  onMount(() => {
    let disposed = false;
    const resizeObserver = new ResizeObserver(() => void reportHeight());
    resizeObserver.observe(document.documentElement);

    async function initialize() {
      try {
        const stored = await client.storage.get<AnnouncementConfig>('config', 'announcement', 'organization');
        if (!disposed) config = normalizeConfig(stored);
      } catch (error) {
        if (!disposed) {
          errorMessage = error instanceof Error ? error.message : 'Announcement settings could not be loaded.';
        }
      } finally {
        if (!disposed) await reportHeight();
      }
    }

    void initialize();
    return () => {
      disposed = true;
      resizeObserver.disconnect();
    };
  });

  onDestroy(() => client.destroy());
</script>

<main class="settings-page">
  <header class="page-header">
    <div class="header-titles">
      <h1 class="page-title">Announcement Banner</h1>
      <p class="page-description">Customize the message learners see across your academy.</p>
    </div>
    <div class="header-actions">
      <button class="cio-btn cio-btn-outline" type="button" onclick={reset}>Reset</button>
      <button class="cio-btn cio-btn-primary" type="button" onclick={save} disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  </header>

  <div class="cards-stack">
    <!-- Live Interactive Preview -->
    <section class="settings-card">
      <h2 class="card-title">Preview</h2>
      <div
        class="banner-preview"
        style:background-color={config.backgroundColor}
        role="region"
        aria-label="Announcement Preview"
      >
        <div class="preview-content">
          <span class="sparkle-icon" aria-hidden="true">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/>
            </svg>
          </span>
          <div class="preview-text-group">
            <span class="preview-badge">NEW</span>
            <p class="preview-text">
              {config.mode === 'dynamic'
                ? 'New course published: “Modern Web Development” is now open for enrollment.'
                : (config.message || 'Welcome! Explore newly released courses and interactive training tracks in your academy.')}
            </p>
          </div>
        </div>

        <div class="preview-actions">
          <span class="preview-link-btn">
            <span>{config.mode === 'dynamic' ? 'Start learning' : (config.linkText || 'Explore courses')}</span>
            <svg class="arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
          {#if config.dismissible}
            <button type="button" class="preview-dismiss-btn" aria-label="Dismiss banner preview">
              <svg class="close-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          {/if}
        </div>
      </div>
    </section>

    <!-- Banner Content Selection -->
    <section class="settings-card">
      <h2 class="card-title">Banner content</h2>
      <div class="mode-grid">
        <button
          type="button"
          class="mode-card"
          class:active={config.mode === 'dynamic'}
          onclick={() => (config.mode = 'dynamic')}
        >
          <div class="mode-card-header">
            <svg class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            <strong>Latest published course</strong>
          </div>
          <span class="mode-desc">Automatically announce the newest published course to learners.</span>
        </button>

        <button
          type="button"
          class="mode-card"
          class:active={config.mode === 'custom'}
          onclick={() => (config.mode = 'custom')}
        >
          <div class="mode-card-header">
            <svg class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            <strong>Custom announcement</strong>
          </div>
          <span class="mode-desc">Write a fixed custom message and configure where it links.</span>
        </button>
      </div>

      {#if config.mode === 'custom'}
        <div class="custom-panel">
          <div class="field-item">
            <label class="cio-label" for="custom-msg">Announcement message</label>
            <textarea
              id="custom-msg"
              class="cio-input"
              rows="3"
              placeholder="Welcome! Check out our new interactive training tracks."
              bind:value={config.message}
            ></textarea>
          </div>

          <div class="fields-row">
            <div class="field-item">
              <label class="cio-label" for="link-text">Button label</label>
              <input
                id="link-text"
                class="cio-input"
                placeholder="Start learning"
                bind:value={config.linkText}
              />
            </div>
            <div class="field-item">
              <label class="cio-label" for="link-url">ClassroomIO path</label>
              <input
                id="link-url"
                class="cio-input"
                placeholder="/lms/explore"
                bind:value={config.linkUrl}
              />
            </div>
          </div>
        </div>
      {/if}
    </section>

    <!-- Background Color Palette -->
    <section class="settings-card">
      <h2 class="card-title">Background color</h2>
      <div class="colors-wrap">
        {#each PRESET_BANNER_COLORS as preset}
          <button
            type="button"
            class="color-preset-btn"
            class:selected={config.backgroundColor.toLowerCase() === preset.value.toLowerCase()}
            onclick={() => (config.backgroundColor = preset.value)}
          >
            <span class="color-dot" style:background-color={preset.value}></span>
            <span class="color-label">{preset.label}</span>
          </button>
        {/each}

        <!-- Custom Color Picker -->
        <div class="custom-color-picker">
          <input
            type="color"
            class="color-input"
            bind:value={config.backgroundColor}
            aria-label="Pick custom background color"
          />
          <span class="color-hex">{config.backgroundColor}</span>
        </div>
      </div>
    </section>

    <!-- Preferences & Dismissible Toggle -->
    <section class="settings-card">
      <h2 class="card-title">Preferences</h2>
      <label class="toggle-control">
        <input type="checkbox" class="cio-checkbox" bind:checked={config.dismissible} />
        <div class="toggle-text">
          <span class="toggle-title">Allow learners to dismiss the banner</span>
          <span class="toggle-desc">When enabled, learners can close the banner. The dismissal stays saved for this announcement.</span>
        </div>
      </label>

      {#if errorMessage}
        <p class="status-msg error-msg" role="alert">{errorMessage}</p>
      {/if}
      {#if saved}
        <p class="status-msg success-msg" role="status">Settings successfully saved.</p>
      {/if}
    </section>
  </div>
</main>

<style>
  .settings-page {
    max-width: 960px;
    margin: 0 auto;
    padding: 24px 20px 48px;
    font-family: var(--cio-font-sans, 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    color: var(--cio-foreground, #0f172a);
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
  }

  .page-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--cio-foreground, #0f172a);
  }

  .page-description {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--cio-foreground-muted, #64748b);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cards-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .settings-card {
    padding: 20px 24px;
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: var(--cio-radius-lg, 12px);
    background: var(--cio-surface, #ffffff);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .card-title {
    margin: 0 0 14px;
    font-size: 14px;
    font-weight: 600;
    color: var(--cio-foreground, #0f172a);
  }

  /* Live Preview */
  .banner-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    transition: background-color 0.2s ease;
  }

  .preview-content {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }

  .sparkle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    border-radius: 999px;
    background: #ffffff;
    color: #2563eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .icon-svg {
    width: 14px;
    height: 14px;
  }

  .preview-text-group {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }

  .preview-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #ffffff;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .preview-text {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .preview-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 6px;
    background: #ffffff;
    color: #0f172a;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
  }

  .arrow-svg {
    width: 13px;
    height: 13px;
    stroke: #334155;
  }

  .preview-dismiss-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #ffffff;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .preview-dismiss-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .close-svg {
    width: 15px;
    height: 15px;
  }

  /* Mode Grid */
  .mode-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 14px;
    margin-bottom: 16px;
  }

  .mode-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 18px;
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: var(--cio-radius-md, 8px);
    background: var(--cio-surface, #ffffff);
    color: var(--cio-foreground, #0f172a);
    text-align: left;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .mode-card:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .mode-card.active {
    border-color: var(--cio-accent, #2563eb);
    background: #eff6ff;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
  }

  .mode-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--cio-foreground, #0f172a);
  }

  .mode-icon {
    width: 16px;
    height: 16px;
    color: var(--cio-accent, #2563eb);
  }

  .mode-desc {
    margin-top: 5px;
    font-size: 12px;
    color: var(--cio-foreground-muted, #64748b);
    line-height: 1.45;
  }

  /* Custom Panel */
  .custom-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: var(--cio-radius-md, 8px);
    background: var(--cio-surface-muted, #f8fafc);
  }

  .fields-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .field-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .cio-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--cio-foreground, #334155);
  }

  .cio-input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px;
    border: 1px solid var(--cio-border, #cbd5e1);
    border-radius: var(--cio-radius-sm, 6px);
    background: #ffffff;
    font-size: 13px;
    color: var(--cio-foreground, #0f172a);
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .cio-input:focus {
    border-color: var(--cio-accent, #2563eb);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
  }

  /* Colors */
  .colors-wrap {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .color-preset-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 13px;
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: var(--cio-radius-md, 8px);
    background: var(--cio-surface, #ffffff);
    color: var(--cio-foreground, #334155);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .color-preset-btn:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .color-preset-btn.selected {
    border-color: var(--cio-accent, #2563eb);
    background: #eff6ff;
    color: #1d4ed8;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
  }

  .color-dot {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  .custom-color-picker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: var(--cio-radius-md, 8px);
    background: #ffffff;
  }

  .color-input {
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  .color-hex {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    color: var(--cio-foreground-muted, #64748b);
  }

  /* Toggle Control */
  .toggle-control {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    user-select: none;
  }

  .cio-checkbox {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    cursor: pointer;
    accent-color: var(--cio-accent, #2563eb);
  }

  .toggle-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .toggle-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--cio-foreground, #0f172a);
  }

  .toggle-desc {
    font-size: 12px;
    color: var(--cio-foreground-muted, #64748b);
  }

  .status-msg {
    margin: 14px 0 0;
    font-size: 13px;
    font-weight: 500;
  }

  .error-msg {
    color: #ef4444;
  }

  .success-msg {
    color: #10b981;
  }

  /* Buttons */
  .cio-btn {
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 7px 15px;
    border-radius: var(--cio-radius-md, 8px);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .cio-btn-primary {
    border: 1px solid #2563eb;
    background: #2563eb;
    color: #ffffff;
  }

  .cio-btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .cio-btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cio-btn-outline {
    border: 1px solid var(--cio-border, #cbd5e1);
    background: #ffffff;
    color: var(--cio-foreground, #334155);
  }

  .cio-btn-outline:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }

  @media (max-width: 640px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
    }
    .fields-row {
      grid-template-columns: 1fr;
    }
    .preview-actions {
      display: none;
    }
  }
</style>
