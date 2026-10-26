<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { createClassroomIOClient } from '@classroomio/plugin-sdk';

  interface ReadingMetrics {
    wordCount: number;
    estimatedMinutes: number;
  }

  const client = createClassroomIOClient();

  let metrics = $state<ReadingMetrics | null>(null);
  let errorMessage = $state('');
  let resizeObserver: ResizeObserver | null = null;

  async function reportHeight() {
    await client.ui.resize(document.documentElement.scrollHeight);
  }

  onMount(() => {
    let disposed = false;

    async function initialize() {
      try {
        const context = await client.context.get();
        if (disposed) return;

        const resource = context.surface?.resource;
        const wordCount = resource?.wordCount ?? 0;
        const estimatedMinutes = resource?.estimatedMinutes ?? Math.max(1, Math.ceil(wordCount / 200));

        metrics = { wordCount, estimatedMinutes };
      } catch (error) {
        if (disposed) return;

        errorMessage = error instanceof Error ? error.message : 'Reading time is unavailable.';
      } finally {
        if (!disposed) await reportHeight();
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

<main aria-live="polite">
  {#if metrics}
    <section class="reading-card" data-testid="reading-time-widget">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 7v5l3 2"></path>
      </svg>
      <strong>{metrics.estimatedMinutes} min read</strong>
      <span aria-hidden="true">·</span>
      <span>{metrics.wordCount.toLocaleString()} words</span>
    </section>
  {:else if errorMessage}
    <p class="error" role="status">{errorMessage}</p>
  {:else}
    <div class="skeleton" aria-label="Calculating reading time"></div>
  {/if}
</main>

<style>
  :global(html),
  :global(body) {
    overflow: hidden;
  }

  main {
    width: 100%;
    padding: 2px 0;
  }

  .reading-card {
    display: flex;
    min-height: 40px;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    color: var(--cio-foreground-muted);
    font-size: 0.75rem;
    background: var(--cio-surface-muted);
    border: 1px solid var(--cio-border);
    border-radius: var(--cio-radius-md, var(--cio-radius));
  }

  strong {
    color: var(--cio-foreground);
    font-weight: 600;
  }

  svg {
    width: 15px;
    height: 15px;
    color: var(--cio-accent);
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .error {
    margin: 0;
    padding: 8px 12px;
    color: var(--cio-destructive);
    font-size: 0.75rem;
  }

  .skeleton {
    height: 40px;
    background: var(--cio-surface-muted);
    border: 1px solid var(--cio-border);
    border-radius: var(--cio-radius-md, var(--cio-radius));
    opacity: 0.65;
  }
</style>
