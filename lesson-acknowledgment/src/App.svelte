<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { createClassroomIOClient } from '@classroomio/plugin-sdk';

  interface AcknowledgmentRecord {
    acknowledgedAt: string;
  }

  const client = createClassroomIOClient();
  const storageNamespace = 'lesson-acknowledgment';
  let isAcknowledged = $state(false);
  let acknowledgedAt = $state<string | null>(null);
  let isLoading = $state(true);
  let isSubmitting = $state(false);
  let errorMessage = $state('');
  let lessonId = '';
  let resizeObserver: ResizeObserver | null = null;

  const formattedTimestamp = $derived.by(() => {
    if (!acknowledgedAt) return '';

    try {
      return new Date(acknowledgedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return acknowledgedAt;
    }
  });

  async function reportHeight() {
    await client.ui.resize(document.documentElement.scrollHeight);
  }

  async function acknowledge() {
    if (isSubmitting || !lessonId) return;

    isSubmitting = true;
    errorMessage = '';
    try {
      const now = new Date().toISOString();
      await client.storage.set(lessonId, { acknowledgedAt: now }, storageNamespace, 'user');
      isAcknowledged = true;
      acknowledgedAt = now;
      await client.ui.toast({ message: 'Lesson policy acknowledged', variant: 'success' });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'The acknowledgment could not be saved.';
    } finally {
      isSubmitting = false;
      await reportHeight();
    }
  }

  onMount(() => {
    let disposed = false;

    async function initialize() {
      try {
        const context = await client.context.get();
        const resourceLessonId = context.surface?.resource?.type === 'lesson' ? context.surface.resource.id : null;
        if (!resourceLessonId) throw new Error('Lesson context is unavailable.');

        lessonId = resourceLessonId;
        const acknowledgment = await client.storage.get<AcknowledgmentRecord>(
          resourceLessonId,
          storageNamespace,
          'user'
        );
        if (disposed) return;

        isAcknowledged = Boolean(acknowledgment);
        acknowledgedAt = acknowledgment?.acknowledgedAt ?? null;
      } catch (error) {
        if (disposed) return;

        errorMessage = error instanceof Error ? error.message : 'The acknowledgment is unavailable.';
      } finally {
        if (!disposed) {
          isLoading = false;
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

<main aria-live="polite">
  {#if isLoading}
    <div class="card skeleton" aria-label="Loading lesson acknowledgment"></div>
  {:else if isAcknowledged}
    <section class="card acknowledged" data-testid="lesson-acknowledgment-box">
      <div class="message">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"></path>
          <path d="m9 11 3 3L22 4"></path>
        </svg>
        <strong>Lesson understood</strong>
        {#if formattedTimestamp}
          <span aria-hidden="true">·</span>
          <span>{formattedTimestamp}</span>
        {/if}
      </div>
    </section>
  {:else}
    <section class="card prompt" data-testid="lesson-acknowledgment-box">
      <div class="message">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <span>I have read and understood the material in this lesson.</span>
      </div>
      <button class="primary" type="button" disabled={isSubmitting} onclick={acknowledge}>
        <span aria-hidden="true">✓</span>
        {isSubmitting ? 'Saving…' : 'Acknowledge'}
      </button>
    </section>
  {/if}

  {#if errorMessage}
    <p class="error" role="alert">{errorMessage}</p>
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
    color: var(--cio-foreground);
    font-family: var(--cio-font-sans);
  }

  .card {
    display: flex;
    min-height: 42px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    border: 1px solid var(--cio-border);
    border-radius: var(--cio-radius-md, var(--cio-radius));
    background: var(--cio-surface-muted);
    font-size: 0.75rem;
  }

  .message {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
    color: var(--cio-foreground-muted);
  }

  .message strong {
    color: var(--cio-foreground);
    font-weight: 600;
  }

  svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .acknowledged svg {
    color: #16a34a;
  }

  .prompt svg {
    color: var(--cio-accent);
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 0;
    border-radius: var(--cio-radius-sm, 4px);
    padding: 5px 10px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  .primary {
    color: var(--cio-accent-foreground);
    background: var(--cio-accent);
  }

  .error {
    margin: 6px 0 0;
    color: var(--cio-destructive);
    font-size: 0.75rem;
  }

  .skeleton {
    opacity: 0.65;
  }
</style>
