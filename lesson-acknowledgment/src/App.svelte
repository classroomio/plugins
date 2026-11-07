<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import { createClassroomIOClient, type PluginContext } from '@classroomio/plugin-sdk';

  interface FeedbackRecord {
    rating?: number;
    comment?: string;
    completed?: boolean;
    userName?: string;
    acknowledgedAt: string;
  }

  interface ReviewItem {
    id: string;
    rating: number;
    comment: string;
    userName: string;
    timestamp: string;
  }

  const client = createClassroomIOClient({ timeoutMs: 10000 });
  const storageNamespace = 'lesson-acknowledgment';

  let context = $state<PluginContext | null>(null);
  let lessonId = $state('');
  let isLoading = $state(true);
  let isSubmitting = $state(false);
  let errorMessage = $state('');
  let resizeObserver: ResizeObserver | null = null;

  // Learner state
  let rating = $state(5);
  let hoverRating = $state<number | null>(null);
  let comment = $state('');
  let completed = $state(true);
  let isAcknowledged = $state(false);
  let acknowledgedAt = $state<string | null>(null);
  let isEditing = $state(false);

  // Instructor / Teacher state
  let isTeacher = $derived(context?.actor?.role === 'admin' || context?.actor?.role === 'tutor');
  let teacherReviews = $state<ReviewItem[]>([]);
  let selectedFilter = $state<number | 'all'>('all');

  const ratingDescriptions: Record<number, string> = {
    1: 'Needs improvement',
    2: 'Fair',
    3: 'Good',
    4: 'Very good',
    5: 'Excellent'
  };

  const activeRatingDisplay = $derived(hoverRating ?? rating);

  // Statistics derived for teacher
  const stats = $derived.by(() => {
    const total = teacherReviews.length;
    if (total === 0) {
      return { total: 0, average: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, percents: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    for (const r of teacherReviews) {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
      sum += r.rating || 5;
    }
    const average = Math.round((sum / total) * 10) / 10;
    const percents: Record<number, number> = {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100)
    };
    return { total, average, counts, percents };
  });

  const filteredReviews = $derived.by(() => {
    if (selectedFilter === 'all') return teacherReviews;
    return teacherReviews.filter((r) => Math.round(r.rating) === selectedFilter);
  });

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
    await tick();
    const scrollHeight = document.documentElement.scrollHeight;
    try {
      await client.ui.resize(Math.max(60, scrollHeight));
    } catch {}
  }

  async function loadTeacherData() {
    if (!lessonId) return;
    try {
      const response = await client.storage.list<FeedbackRecord>(storageNamespace, 'user', {
        allUsers: true,
        key: lessonId
      });
      teacherReviews = response.items.map((item, idx) => ({
        id: item.key + '-' + idx,
        rating: typeof item.value?.rating === 'number' ? item.value.rating : 5,
        comment: item.value?.comment || '',
        userName: item.value?.userName || 'Student',
        timestamp: item.value?.acknowledgedAt || item.updatedAt
      }));
    } catch (err) {
      console.warn('Could not load teacher reviews:', err);
    }
  }

  async function submitFeedback() {
    if (isSubmitting || !lessonId) return;
    isSubmitting = true;
    errorMessage = '';
    try {
      const now = new Date().toISOString();
      const payload: FeedbackRecord = {
        rating,
        comment: comment.trim() || undefined,
        completed,
        userName: context?.actor?.role === 'learner' ? 'Learner' : undefined,
        acknowledgedAt: now
      };
      await client.storage.set(lessonId, payload, storageNamespace, 'user');
      isAcknowledged = true;
      acknowledgedAt = now;
      isEditing = false;
      await client.ui.toast({ message: 'Feedback submitted successfully', variant: 'success' });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'The feedback could not be saved.';
    } finally {
      isSubmitting = false;
      await reportHeight();
    }
  }

  onMount(() => {
    let disposed = false;

    async function initialize() {
      try {
        const ctx = await client.context.get();
        if (disposed) return;
        context = ctx;

        const resourceLessonId = ctx.surface?.resource?.type === 'lesson' ? ctx.surface.resource.id : null;
        if (!resourceLessonId) throw new Error('Lesson context is unavailable.');
        lessonId = resourceLessonId;

        if (ctx.actor?.role === 'admin' || ctx.actor?.role === 'tutor') {
          await loadTeacherData();
        } else {
          const userRecord = await client.storage.get<FeedbackRecord>(resourceLessonId, storageNamespace, 'user');
          if (disposed) return;
          if (userRecord) {
            isAcknowledged = true;
            rating = userRecord.rating ?? 5;
            comment = userRecord.comment ?? '';
            completed = userRecord.completed ?? true;
            acknowledgedAt = userRecord.acknowledgedAt ?? null;
          }
        }
      } catch (error) {
        if (disposed) return;
        errorMessage = error instanceof Error ? error.message : 'Feedback service is unavailable.';
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
    <div class="card skeleton">
      <div class="skeleton-line sm"></div>
      <div class="skeleton-line lg"></div>
    </div>
  {:else if isTeacher}
    <!-- Teacher / Instructor Review Analytics View -->
    <section class="card teacher-card" data-testid="lesson-feedback-teacher">
      <header class="card-header">
        <div class="header-title-row">
          <svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <h3 class="header-title">Student Feedback & Reviews</h3>
        </div>
        <span class="reviews-count-badge">
          {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
        </span>
      </header>

      {#if stats.total === 0}
        <div class="empty-teacher-state">
          <p class="empty-msg">No student reviews yet for this lesson.</p>
          <span class="empty-sub">Reviews and satisfaction ratings will appear here once learners complete the lesson.</span>
        </div>
      {:else}
        <!-- App Store / Google Play style rating chart -->
        <div class="ratings-chart-container">
          <div class="score-summary">
            <span class="score-number">{stats.average.toFixed(1)}</span>
            <div class="stars-row sm" aria-label="Average rating {stats.average} out of 5">
              {#each [1, 2, 3, 4, 5] as star}
                <svg
                  class="star-svg"
                  class:filled={star <= Math.round(stats.average)}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              {/each}
            </div>
            <span class="score-caption">Course feedback</span>
          </div>

          <div class="distribution-bars">
            {#each [5, 4, 3, 2, 1] as star}
              {@const pct = stats.percents[star] || 0}
              {@const count = stats.counts[star] || 0}
              <button
                type="button"
                class="bar-row"
                class:active-bar={selectedFilter === star}
                onclick={() => {
                  selectedFilter = selectedFilter === star ? 'all' : star;
                  void reportHeight();
                }}
              >
                <span class="bar-star-label">{star}★</span>
                <div class="bar-track">
                  <div class="bar-fill" style="width: {pct}%"></div>
                </div>
                <span class="bar-count-label">{count}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Filter chips -->
        <div class="filter-chips-row">
          <button
            type="button"
            class="chip"
            class:active={selectedFilter === 'all'}
            onclick={() => {
              selectedFilter = 'all';
              void reportHeight();
            }}
          >
            All ({stats.total})
          </button>
          {#each [5, 4, 3, 2, 1] as star}
            {#if stats.counts[star] > 0}
              <button
                type="button"
                class="chip"
                class:active={selectedFilter === star}
                onclick={() => {
                  selectedFilter = selectedFilter === star ? 'all' : star;
                  void reportHeight();
                }}
              >
                {star}★ ({stats.counts[star]})
              </button>
            {/if}
          {/each}
        </div>

        <!-- Reviews list -->
        <div class="reviews-list">
          {#each filteredReviews as review (review.id)}
            <article class="review-item">
              <div class="review-top">
                <div class="reviewer-info">
                  <div class="reviewer-avatar">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <span class="reviewer-name">{review.userName}</span>
                </div>
                <div class="review-meta">
                  <div class="stars-row xs">
                    {#each [1, 2, 3, 4, 5] as star}
                      <svg
                        class="star-svg"
                        class:filled={star <= review.rating}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    {/each}
                  </div>
                  {#if review.timestamp}
                    <time class="review-date">
                      {new Date(review.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </time>
                  {/if}
                </div>
              </div>
              {#if review.comment}
                <p class="review-comment">{review.comment}</p>
              {/if}
            </article>
          {/each}
        </div>
      {/if}
    </section>
  {:else if isAcknowledged && !isEditing}
    <!-- Learner Submitted State -->
    <section class="card acknowledged" data-testid="lesson-feedback-box">
      <div class="ack-summary">
        <div class="ack-badge">
          <svg class="check-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"></path>
            <path d="m9 11 3 3L22 4"></path>
          </svg>
          <span class="ack-title">Lesson completed & understood</span>
        </div>

        <div class="ack-details">
          <div class="stars-row sm">
            {#each [1, 2, 3, 4, 5] as star}
              <svg
                class="star-svg"
                class:filled={star <= rating}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            {/each}
            <span class="rating-text-sm">{ratingDescriptions[rating] || ''}</span>
          </div>

          {#if comment}
            <p class="submitted-comment">"{comment}"</p>
          {/if}

          {#if formattedTimestamp}
            <span class="timestamp-sub">Submitted {formattedTimestamp}</span>
          {/if}
        </div>
      </div>

      <button
        type="button"
        class="secondary-btn sm"
        onclick={() => {
          isEditing = true;
          void reportHeight();
        }}
      >
        Edit feedback
      </button>
    </section>
  {:else}
    <!-- Learner Interactive Rating & Feedback Form -->
    <section class="card prompt" data-testid="lesson-feedback-box">
      <header class="prompt-header">
        <h4 class="prompt-title">How was this lesson?</h4>
        <p class="prompt-sub">Your feedback helps improve course quality and instructors see satisfaction trends.</p>
      </header>

      <!-- Interactive 5-star Picker -->
      <div class="star-picker-section">
        <div class="stars-row interactive" role="radiogroup" aria-label="Rate this lesson from 1 to 5 stars">
          {#each [1, 2, 3, 4, 5] as star}
            <button
              type="button"
              class="star-btn"
              role="radio"
              aria-checked={rating === star}
              aria-label="{star} stars: {ratingDescriptions[star]}"
              onclick={() => {
                rating = star;
                void reportHeight();
              }}
              onmouseenter={() => (hoverRating = star)}
              onmouseleave={() => (hoverRating = null)}
            >
              <svg
                class="star-svg lg"
                class:filled={star <= activeRatingDisplay}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          {/each}
        </div>
        <span class="rating-descriptor">{ratingDescriptions[activeRatingDisplay] || ''}</span>
      </div>

      <!-- Optional Comment Box -->
      <div class="comment-field">
        <textarea
          bind:value={comment}
          class="feedback-textarea"
          placeholder="Leave any feedback or questions for the instructor (optional)..."
          rows="2"
          maxlength="1000"
          oninput={() => void reportHeight()}
        ></textarea>
      </div>

      <!-- Completion Checkbox -->
      <label class="completion-checkbox-label">
        <input
          type="checkbox"
          bind:checked={completed}
          class="checkbox-input"
        />
        <span>I have read and understood the material in this lesson</span>
      </label>

      <!-- Actions -->
      <footer class="prompt-footer">
        {#if isEditing}
          <button
            type="button"
            class="secondary-btn"
            disabled={isSubmitting}
            onclick={() => {
              isEditing = false;
              void reportHeight();
            }}
          >
            Cancel
          </button>
        {/if}
        <button
          class="primary-btn"
          type="button"
          disabled={isSubmitting}
          onclick={submitFeedback}
        >
          {#if isSubmitting}
            <span>Saving…</span>
          {:else}
            <span>{isEditing ? 'Update Feedback' : 'Submit Feedback'}</span>
          {/if}
        </button>
      </footer>
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
    margin: 0;
    padding: 0;
  }

  main {
    width: 100%;
    padding: 2px 0;
    color: var(--cio-foreground, #0f172a);
    font-family: var(--cio-font-sans, system-ui, -apple-system, sans-serif);
    box-sizing: border-box;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px 18px;
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: var(--cio-radius, 10px);
    background: var(--cio-surface, #ffffff);
    font-size: 0.8125rem;
    box-sizing: border-box;
    transition: border-color 0.15s ease;
  }

  /* Teacher View Styling */
  .teacher-card {
    background: var(--cio-surface, #ffffff);
    gap: 16px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
  }

  .header-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-icon {
    width: 16px;
    height: 16px;
    fill: var(--cio-accent, #2563eb);
    color: var(--cio-accent, #2563eb);
  }

  .header-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--cio-foreground, #0f172a);
  }

  .reviews-count-badge {
    font-size: 0.6875rem;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 9999px;
    background: var(--cio-surface-muted, #f1f5f9);
    color: var(--cio-foreground-muted, #64748b);
  }

  .empty-teacher-state {
    padding: 16px 8px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .empty-msg {
    margin: 0;
    font-weight: 500;
    color: var(--cio-foreground, #0f172a);
  }

  .empty-sub {
    font-size: 0.75rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  /* App Store style rating chart */
  .ratings-chart-container {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 20px;
    align-items: center;
    padding: 4px 0;
  }

  .score-summary {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 4px;
    border-right: 1px solid var(--cio-border, #e2e8f0);
    padding-right: 16px;
  }

  .score-number {
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1;
    color: var(--cio-foreground, #0f172a);
    letter-spacing: -0.03em;
  }

  .score-caption {
    font-size: 0.6875rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  .distribution-bars {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    padding: 2px 4px;
    border-radius: 4px;
    cursor: pointer;
    font: inherit;
    text-align: left;
    transition: background 0.15s ease;
  }

  .bar-row:hover {
    background: var(--cio-surface-muted, #f8fafc);
  }

  .bar-row.active-bar {
    background: var(--cio-surface-muted, #f1f5f9);
  }

  .bar-star-label {
    width: 22px;
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--cio-foreground-muted, #64748b);
  }

  .bar-track {
    flex: 1;
    height: 6px;
    border-radius: 9999px;
    background: var(--cio-border, #e2e8f0);
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: var(--cio-accent, #2563eb);
    border-radius: 9999px;
    transition: width 0.3s ease;
  }

  .bar-count-label {
    width: 20px;
    font-size: 0.6875rem;
    color: var(--cio-foreground-muted, #64748b);
    text-align: right;
  }

  /* Filter chips */
  .filter-chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-top: 4px;
  }

  .chip {
    padding: 3px 9px;
    font-size: 0.6875rem;
    font-weight: 500;
    border-radius: 9999px;
    border: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    color: var(--cio-foreground-muted, #64748b);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .chip:hover {
    border-color: var(--cio-accent, #2563eb);
    color: var(--cio-foreground, #0f172a);
  }

  .chip.active {
    background: var(--cio-accent, #2563eb);
    border-color: var(--cio-accent, #2563eb);
    color: #ffffff;
  }

  /* Reviews list */
  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 380px;
    overflow-y: auto;
    padding-top: 6px;
  }

  .review-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px;
    background: var(--cio-surface-muted, #f8fafc);
    border: 1px solid var(--cio-border, #f1f5f9);
    border-radius: var(--cio-radius-sm, 6px);
  }

  .review-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .reviewer-info {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .reviewer-avatar {
    width: 20px;
    height: 20px;
    border-radius: 9999px;
    background: var(--cio-accent, #2563eb);
    color: #ffffff;
    font-size: 0.625rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reviewer-name {
    font-weight: 600;
    font-size: 0.75rem;
    color: var(--cio-foreground, #0f172a);
  }

  .review-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .review-date {
    font-size: 0.6875rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  .review-comment {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--cio-foreground, #0f172a);
  }

  /* Stars Styling */
  .stars-row {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .stars-row.interactive {
    gap: 6px;
  }

  .star-svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: var(--cio-border, #cbd5e1);
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: fill 0.15s ease, stroke 0.15s ease;
  }

  .star-svg.filled {
    fill: var(--cio-accent, #2563eb);
    stroke: var(--cio-accent, #2563eb);
  }

  .star-svg.lg {
    width: 22px;
    height: 22px;
  }

  .stars-row.xs .star-svg {
    width: 12px;
    height: 12px;
  }

  .star-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    outline: none;
    transition: transform 0.1s ease;
  }

  .star-btn:hover {
    transform: scale(1.15);
  }

  /* Learner Form & Prompt */
  .prompt-header {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .prompt-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--cio-foreground, #0f172a);
  }

  .prompt-sub {
    margin: 0;
    font-size: 0.75rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  .star-picker-section {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
  }

  .rating-descriptor {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--cio-accent, #2563eb);
  }

  .feedback-textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px;
    font-family: inherit;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--cio-foreground, #0f172a);
    background: var(--cio-surface-muted, #f8fafc);
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: var(--cio-radius-sm, 6px);
    resize: vertical;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .feedback-textarea:focus {
    border-color: var(--cio-accent, #2563eb);
    box-shadow: 0 0 0 1px var(--cio-accent, #2563eb);
  }

  .completion-checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: var(--cio-foreground, #0f172a);
    cursor: pointer;
    user-select: none;
  }

  .checkbox-input {
    width: 15px;
    height: 15px;
    accent-color: var(--cio-accent, #2563eb);
    cursor: pointer;
    margin: 0;
  }

  .prompt-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 4px;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: var(--cio-radius-sm, 6px);
    padding: 6px 12px;
    font: inherit;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    transition: opacity 0.15s ease, background 0.15s ease;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  .primary-btn {
    border: 0;
    color: #ffffff;
    background: var(--cio-accent, #2563eb);
  }

  .primary-btn:hover:not(:disabled) {
    opacity: 0.92;
  }

  .secondary-btn {
    border: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    color: var(--cio-foreground, #0f172a);
  }

  .secondary-btn:hover:not(:disabled) {
    background: var(--cio-surface-muted, #f8fafc);
  }

  .secondary-btn.sm {
    padding: 4px 8px;
    font-size: 0.6875rem;
  }

  /* Acknowledged / Submitted view */
  .card.acknowledged {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: var(--cio-surface-muted, #f8fafc);
  }

  .ack-summary {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ack-badge {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .check-icon {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: #16a34a;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .ack-title {
    font-weight: 600;
    font-size: 0.8125rem;
    color: var(--cio-foreground, #0f172a);
  }

  .ack-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: 23px;
  }

  .rating-text-sm {
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--cio-foreground-muted, #64748b);
  }

  .submitted-comment {
    margin: 0;
    font-size: 0.75rem;
    font-style: italic;
    color: var(--cio-foreground, #0f172a);
  }

  .timestamp-sub {
    font-size: 0.6875rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  .error {
    margin: 6px 0 0;
    color: var(--cio-destructive, #ef4444);
    font-size: 0.75rem;
  }

  .skeleton {
    opacity: 0.65;
  }

  .skeleton-line {
    height: 10px;
    border-radius: 4px;
    background: var(--cio-border, #e2e8f0);
  }

  .skeleton-line.sm {
    width: 35%;
  }

  .skeleton-line.lg {
    width: 70%;
  }
</style>
