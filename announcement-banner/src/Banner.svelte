<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import { createClassroomIOClient } from '@classroomio/plugin-sdk';
  import { DEFAULT_CONFIG, isSafeHostPath, normalizeConfig, type AnnouncementConfig } from './config';

  const client = createClassroomIOClient();
  let config = $state<AnnouncementConfig>({ ...DEFAULT_CONFIG });
  let ready = $state(false);
  let dismissed = $state(false);
  let latestCourse = $state<{ id: string; title: string; slug: string | null } | null>(null);
  let bannerEl = $state<HTMLElement | null>(null);
  let resizeObserver: ResizeObserver | null = null;

  const message = $derived(
    config.mode === 'custom'
      ? config.message
      : latestCourse
        ? `New course published: “${latestCourse.title}” is now open for enrollment.`
        : DEFAULT_CONFIG.message
  );
  const linkText = $derived(
    config.mode === 'custom' ? config.linkText : latestCourse?.slug ? 'Start learning' : DEFAULT_CONFIG.linkText
  );
  const linkUrl = $derived(
    config.mode === 'custom'
      ? config.linkUrl
      : latestCourse?.slug
        ? `/course/${latestCourse.slug}`
        : DEFAULT_CONFIG.linkUrl
  );
  const dismissalKey = $derived(
    config.mode === 'dynamic'
      ? `dismissed-${config.revision}-${latestCourse?.id ?? 'none'}`
      : `dismissed-${config.revision}`
  );

  async function reportHeight() {
    await tick();
    const height = !ready || dismissed || !bannerEl ? 0 : bannerEl.offsetHeight;
    await client.ui.resize(height);
  }

  async function dismiss() {
    dismissed = true;
    void reportHeight();
    try {
      await client.storage.set(dismissalKey, { dismissed: true }, 'announcement', 'user');
    } catch {}
  }

  async function openLink() {
    if (isSafeHostPath(linkUrl)) await client.navigation.open(linkUrl);
  }

  onMount(() => {
    let disposed = false;

    async function initialize() {
      try {
        const storedConfig = await client.storage.get<AnnouncementConfig>('config', 'announcement', 'organization');
        if (disposed) return;

        config = normalizeConfig(storedConfig);
        if (config.mode === 'dynamic') {
          try {
            const response = await client.action<{
              items: { id: string; title: string; slug: string | null }[];
            }, { limit: number; publishedOnly: boolean }>('courses:list', { limit: 1, publishedOnly: true });
            latestCourse = response.items[0] ?? null;
          } catch {
            latestCourse = null;
          }
        }

        const storedDismissal = await client.storage.get<{ dismissed: boolean }>(dismissalKey, 'announcement', 'user');
        dismissed = Boolean(storedDismissal?.dismissed);
      } catch {
        dismissed = false;
      } finally {
        if (!disposed) {
          ready = true;
          await reportHeight();
        }
      }
    }

    resizeObserver = new ResizeObserver(() => void reportHeight());
    resizeObserver.observe(document.documentElement);
    void initialize();
    return () => {
      disposed = true;
    };
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
    client.destroy();
  });
</script>

{#if ready && !dismissed}
  <aside
    bind:this={bannerEl}
    class="banner-wrapper"
    style:background-color={config.backgroundColor}
    aria-label="Student Announcement"
    data-testid="lms-announcement-banner"
  >
    <div class="banner-content">
      <div class="message-group">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="announcement-icon">
          <path d="m3 11 18-5v12L3 13v-2Z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
        <span class="message-text">{message}</span>
      </div>

      <div class="actions-group">
        {#if linkText && linkUrl}
          <button type="button" class="action-link" onclick={openLink}>
            {linkText}
            <span aria-hidden="true">→</span>
          </button>
        {/if}

        {#if config.dismissible}
          <button
            type="button"
            class="dismiss-button"
            aria-label="Dismiss announcement"
            onclick={dismiss}
          >
            ✕
          </button>
        {/if}
      </div>
    </div>
  </aside>
{/if}

<style>
  :global(html),
  :global(body) {
    overflow: hidden;
    margin: 0;
    padding: 0;
  }

  .banner-wrapper {
    width: 100%;
    color: #ffffff;
    font-family: var(--cio-font-sans, system-ui, -apple-system, sans-serif);
    font-size: 0.8125rem;
    line-height: 1.4;
    transition: opacity 0.2s ease;
  }

  .banner-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .message-group {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1 1 auto;
  }

  .announcement-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.9;
  }

  .message-text {
    font-weight: 500;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .actions-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }

  .action-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.35);
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s ease;
  }

  .action-link:hover {
    background: rgba(255, 255, 255, 0.32);
  }

  .dismiss-button {
    background: transparent;
    border: none;
    color: #ffffff;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    opacity: 0.8;
    transition: opacity 0.15s ease, background 0.15s ease;
  }

  .dismiss-button:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.15);
  }
</style>
