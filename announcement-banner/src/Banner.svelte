<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { createClassroomIOClient, type LatestPublishedCourse } from '@classroomio/plugin-sdk';
  import { DEFAULT_CONFIG, isSafeHostPath, normalizeConfig, type AnnouncementConfig } from './config';

  const client = createClassroomIOClient();
  let config = $state<AnnouncementConfig>({ ...DEFAULT_CONFIG });
  let ready = $state(false);
  let dismissed = $state(false);
  let latestCourse = $state<LatestPublishedCourse | null>(null);
  let resizeObserver: ResizeObserver | null = null;

  const message = $derived(
    config.mode === 'dynamic' && latestCourse
      ? `New course published: “${latestCourse.title}” is now open for enrollment.`
      : config.message
  );
  const linkText = $derived(config.mode === 'dynamic' ? 'Start learning' : config.linkText);
  const linkUrl = $derived(
    config.mode === 'dynamic' && latestCourse?.slug ? `/course/${latestCourse.slug}` : config.linkUrl
  );
  const dismissalKey = $derived(
    `dismissed-${config.revision}-${config.mode === 'dynamic' ? (latestCourse?.id ?? 'default') : 'custom'}`
  );

  async function reportHeight() {
    const height = dismissed ? 0 : document.documentElement.scrollHeight;
    await client.ui.resize(height);
  }

  async function dismiss() {
    dismissed = true;
    try {
      await client.storage.set(dismissalKey, true, 'announcement', 'user');
    } catch {
      // Dismiss immediately even if the preference cannot be persisted.
    } finally {
      await reportHeight();
    }
  }

  async function openLink() {
    if (isSafeHostPath(linkUrl)) await client.navigation.open(linkUrl);
  }

  onMount(() => {
    let disposed = false;

    async function initialize() {
      try {
        const storedConfig = await client.storage.get<AnnouncementConfig>('config', 'announcement', 'owner');
        if (disposed) return;

        config = normalizeConfig(storedConfig);
        if (config.mode === 'dynamic') {
          latestCourse = await client.courses.getLatestPublished();
        }
        if (disposed) return;

        dismissed = Boolean(await client.storage.get(dismissalKey, 'announcement', 'user'));
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
    class="banner-wrapper"
    style:background-color={config.backgroundColor}
    aria-label="Student Announcement"
    data-testid="lms-announcement-banner"
  >
    <div class="banner-inner">
      <div class="banner-body">
        <span class="sparkle-badge" aria-hidden="true">
          <svg class="sparkle-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/>
          </svg>
        </span>
        <div class="banner-headline">
          <span class="badge-new">NEW</span>
          <p class="banner-text">{message}</p>
        </div>
        {#if linkText && isSafeHostPath(linkUrl)}
          <button class="link-btn" type="button" onclick={openLink}>
            <span>{linkText}</span>
            <svg class="arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        {/if}
      </div>

      {#if config.dismissible}
        <button class="dismiss-btn" type="button" aria-label="Dismiss announcement" onclick={dismiss}>
          <svg class="close-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      {/if}
    </div>
  </aside>
{/if}

<style>
  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: transparent;
  }

  .banner-wrapper {
    position: relative;
    width: 100%;
    min-height: 44px;
    box-sizing: border-box;
    padding: 8px 16px;
    color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s ease;
  }

  .banner-inner {
    position: relative;
    display: flex;
    max-width: 1280px;
    margin: 0 auto;
    align-items: center;
    justify-content: center;
    padding: 0 40px;
    font-size: 13px;
  }

  .banner-body {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-width: 0;
    overflow: hidden;
    text-align: center;
  }

  .sparkle-badge {
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

  .sparkle-svg {
    width: 14px;
    height: 14px;
  }

  .banner-headline {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    overflow: hidden;
  }

  .badge-new {
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

  .banner-text {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .link-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    padding: 5px 12px;
    border: none;
    border-radius: 6px;
    background: #ffffff;
    color: #0f172a;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    transition: background-color 0.15s ease;
  }

  .link-btn:hover {
    background: #f1f5f9;
  }

  .arrow-svg {
    width: 13px;
    height: 13px;
    stroke: #334155;
  }

  .dismiss-btn {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
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
    transition: background-color 0.15s ease;
  }

  .dismiss-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .close-svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 640px) {
    .banner-inner {
      padding: 0;
      justify-content: flex-start;
    }
    .banner-body {
      justify-content: flex-start;
    }
    .sparkle-badge,
    .badge-new {
      display: none;
    }
  }
</style>
