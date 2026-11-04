<script lang="ts">
  import type { PublicLandingCourse, PublicLandingLabels } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  let {
    course,
    labels
  }: {
    course: PublicLandingCourse;
    labels: PublicLandingLabels;
  } = $props();

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    requestNavigation(course.href);
  }

  const formattedPrice = $derived.by(() => {
    if (course.isFree || course.price === 0) {
      return labels.courseFree || 'Complimentary';
    }
    if (typeof course.price === 'number') {
      const currency = course.currency ?? '$';
      return `${currency}${course.price}`;
    }
    return labels.courseFree || 'Complimentary';
  });
</script>

<div class="atelier-card">
  <div class="banner-box">
    {#if course.image}
      <img src={course.image} alt={course.title} class="banner-img" />
    {:else}
      <div class="banner-linen">
        <span class="linen-monogram">¶</span>
      </div>
    {/if}
  </div>

  <div class="card-body">
    {#if course.tags && course.tags.length > 0}
      <div class="tags-row">
        {#each course.tags.slice(0, 2) as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    {/if}

    <h3 class="title">{course.title}</h3>
    {#if course.description}
      <p class="description">{course.description}</p>
    {/if}

    <div class="meta-row">
      {#if typeof course.lessonsCount === 'number'}
        <span>{course.lessonsCount} {labels.courseLessons || 'lessons'}</span>
      {/if}
      {#if typeof course.lessonsCount === 'number' && typeof course.studentsCount === 'number'}
        <span class="sep">•</span>
      {/if}
      {#if typeof course.studentsCount === 'number'}
        <span>{course.studentsCount} {labels.courseStudents || 'students'}</span>
      {/if}
    </div>

    <div class="action-wrap">
      <button class="btn-enroll" onclick={handleClick}>
        <span class="btn-text">{labels.courseEnroll || 'Enroll'} — {formattedPrice}</span>
        <ArrowRight size={14} />
      </button>
    </div>
  </div>
</div>

<style>
  .atelier-card {
    border: 1px solid rgba(214, 211, 209, 0.7);
    border-radius: 4px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .atelier-card:hover {
    border-color: #a8a29e;
    box-shadow: 0 8px 24px rgba(28, 25, 23, 0.06);
    transform: translateY(-2px);
  }

  .banner-box {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    background: #f5f5f4;
    overflow: hidden;
    border-bottom: 1px solid rgba(214, 211, 209, 0.5);
  }

  .banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .banner-linen {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f7f5ef;
    color: #a8a29e;
    font-size: 2.25rem;
    font-family: 'Newsreader', Georgia, serif;
    font-style: italic;
  }

  .card-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .tags-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .tag {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #78716c;
  }

  .title {
    margin: 0 0 0.5rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.35rem;
    font-weight: 500;
    line-height: 1.25;
    color: #1c1917;
  }

  .description {
    margin: 0 0 1.25rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #57534e;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem;
    color: #78716c;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(214, 211, 209, 0.5);
    margin-bottom: 1rem;
  }

  .sep {
    color: #d6d3d1;
  }

  .action-wrap {
    margin-top: auto;
  }

  .btn-enroll {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1px solid #1c1917;
    border-radius: 4px;
    background: transparent;
    color: #1c1917;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.15s ease;
  }

  .btn-enroll:hover {
    background: #1c1917;
    color: #fbf9f4;
  }
</style>
