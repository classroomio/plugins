<script lang="ts">
  import type { PublicLandingCourse, PublicLandingLabels } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import Users from '@lucide/svelte/icons/users';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

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
      return labels.courseFree || 'Free';
    }
    if (typeof course.price === 'number') {
      const currency = course.currency ?? '$';
      return `${currency}${course.price}`;
    }
    return labels.courseFree || 'Free';
  });
</script>

<div class="course-card">
  <div class="banner-wrap">
    {#if course.image}
      <img src={course.image} alt={course.title} class="banner-img" />
    {:else}
      <div class="banner-placeholder">
        <span class="placeholder-icon">✦</span>
      </div>
    {/if}

    <div class="price-sticker">
      <span>{formattedPrice}</span>
    </div>
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
        <div class="meta-item">
          <BookOpen size={14} />
          <span>{course.lessonsCount} {labels.courseLessons || 'lessons'}</span>
        </div>
      {/if}

      {#if typeof course.studentsCount === 'number'}
        <div class="meta-item">
          <Users size={14} />
          <span>{course.studentsCount} {labels.courseStudents || 'students'}</span>
        </div>
      {/if}
    </div>

    <div class="action-wrap">
      <button class="neo-btn-enroll" onclick={handleClick}>
        <span>{labels.courseEnroll || 'Enroll Now'}</span>
        <ArrowUpRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  </div>
</div>

<style>
  .course-card {
    border: 3px solid #18181b;
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 5px 5px 0px #18181b;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.15s ease;
  }

  .course-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0px #18181b;
  }

  .banner-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-bottom: 3px solid #18181b;
    background: #fde047;
    overflow: hidden;
  }

  .banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .banner-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fb7185;
    color: #18181b;
    font-size: 2.5rem;
    font-weight: 800;
  }

  .placeholder-icon {
    transform: rotate(12deg);
  }

  .price-sticker {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    background: #fde047;
    border: 2px solid #18181b;
    border-radius: 4px;
    padding: 0.25rem 0.625rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.875rem;
    font-weight: 800;
    color: #18181b;
    box-shadow: 2px 2px 0px #18181b;
  }

  .card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
  }

  .tag {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    background: #f4f4f5;
    border: 1.5px solid #18181b;
    border-radius: 3px;
    padding: 0.125rem 0.45rem;
    color: #18181b;
  }

  .title {
    margin: 0 0 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    color: #18181b;
  }

  .description {
    margin: 0 0 1rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #52525b;
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
    gap: 1rem;
    padding: 0.75rem 0;
    border-top: 1.5px dashed #e4e4e7;
    margin-bottom: 0.875rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    color: #71717a;
  }

  .action-wrap {
    margin-top: auto;
  }

  .neo-btn-enroll {
    width: 100%;
    padding: 0.65rem 1rem;
    border: 2.5px solid #18181b;
    border-radius: 6px;
    background: #38bdf8;
    color: #18181b;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 3px 3px 0px #18181b;
    transition: all 0.12s ease;
  }

  .neo-btn-enroll:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0px #18181b;
  }

  .neo-btn-enroll:hover {
    background: #7dd3fc;
  }
</style>
