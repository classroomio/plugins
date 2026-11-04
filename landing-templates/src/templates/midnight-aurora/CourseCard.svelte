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

<div class="aurora-card">
  <div class="banner-wrap">
    {#if course.image}
      <img src={course.image} alt={course.title} class="banner-img" />
    {:else}
      <div class="banner-placeholder">
        <span class="placeholder-glow">✦</span>
      </div>
    {/if}

    <div class="price-pill">
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
      <button class="btn-enroll" onclick={handleClick}>
        <span>{labels.courseEnroll || 'Enroll Now'}</span>
        <ArrowUpRight size={15} />
      </button>
    </div>
  </div>
</div>

<style>
  .aurora-card {
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.25s ease;
  }

  .aurora-card:hover {
    border-color: rgba(34, 211, 238, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 211, 238, 0.15);
  }

  .banner-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #111420;
    overflow: hidden;
  }

  .banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: 0.9;
  }

  .banner-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #181926 0%, #0d0f17 100%);
    color: #22d3ee;
    font-size: 2rem;
  }

  .placeholder-glow {
    filter: drop-shadow(0 0 8px #22d3ee);
  }

  .price-pill {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    background: rgba(9, 10, 15, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(34, 211, 238, 0.3);
    border-radius: 9999px;
    padding: 0.2rem 0.65rem;
    font-family: 'Geist Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    color: #22d3ee;
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
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0.15rem 0.45rem;
    color: #94a3b8;
  }

  .title {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    color: #ffffff;
  }

  .description {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #94a3b8;
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
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 0.875rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: 'Geist Mono', monospace;
    font-size: 0.75rem;
    color: #64748b;
  }

  .action-wrap {
    margin-top: auto;
  }

  .btn-enroll {
    width: 100%;
    padding: 0.65rem 1rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #f8fafc;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    transition: all 0.2s ease;
  }

  .btn-enroll:hover {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.2));
    border-color: rgba(34, 211, 238, 0.5);
    color: #ffffff;
  }
</style>
