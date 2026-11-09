<script lang="ts">
  import type { PublicLandingCourse, PublicLandingLabels } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import Users from '@lucide/svelte/icons/users';

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

<div class="atelier-card">
  <div class="banner-box">
    {#if course.image}
      <img src={course.image} alt={course.title} class="banner-img" />
    {:else}
      <div class="banner-fallback">
        <span class="fallback-monogram">¶</span>
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

    <h3 class="title">
      <a href={course.href} onclick={handleClick} class="title-link">
        {course.title}
      </a>
    </h3>

    {#if course.description}
      <p class="description">{course.description}</p>
    {/if}

    {#if typeof course.lessonsCount === 'number' || typeof course.studentsCount === 'number'}
      <div class="meta-row">
        {#if typeof course.lessonsCount === 'number'}
          <span class="meta-item">
            <BookOpen size={13} />
            <span>{course.lessonsCount} {labels.courseLessons || 'lessons'}</span>
          </span>
        {/if}

        {#if typeof course.lessonsCount === 'number' && typeof course.studentsCount === 'number'}
          <span class="meta-dot">·</span>
        {/if}

        {#if typeof course.studentsCount === 'number'}
          <span class="meta-item">
            <Users size={13} />
            <span>{course.studentsCount} {labels.courseStudents || 'students'}</span>
          </span>
        {/if}
      </div>
    {/if}

    <div class="action-wrap">
      <button class="btn-enroll" onclick={handleClick}>
        <span class="btn-text">{labels.courseEnroll || 'Enroll'}</span>
        <ArrowRight size={14} />
      </button>
    </div>
  </div>
</div>

<style>
  .atelier-card {
    border: 1px solid rgba(17, 17, 20, 0.08);
    border-radius: 10px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .atelier-card:hover {
    border-color: rgba(17, 17, 20, 0.2);
    box-shadow: 0 16px 36px -8px rgba(17, 17, 20, 0.08);
    transform: translateY(-3px);
  }

  .banner-box {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    background: #f4f4f5;
    overflow: hidden;
  }

  .banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .atelier-card:hover .banner-img {
    transform: scale(1.03);
  }

  .banner-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f4f4f5 0%, #ebebeb 100%);
  }

  .fallback-monogram {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 2.5rem;
    color: #a1a1aa;
    opacity: 0.6;
  }

  .price-pill {
    position: absolute;
    bottom: 0.875rem;
    right: 0.875rem;
    background: rgba(17, 17, 20, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    letter-spacing: -0.01em;
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
    flex-wrap: wrap;
    margin-bottom: 0.875rem;
  }

  .tag {
    font-size: 0.6875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.2rem 0.55rem;
    background: #f4f4f5;
    color: #52525b;
    border-radius: 9999px;
  }

  .title {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: -0.02em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .title-link {
    color: #111114;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .title-link:hover {
    color: #c2410c;
  }

  .description {
    margin: 0 0 1.25rem;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #71717a;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #71717a;
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid rgba(17, 17, 20, 0.06);
  }

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .meta-dot {
    color: #a1a1aa;
  }

  .action-wrap {
    margin-top: 1rem;
  }

  .btn-enroll {
    width: 100%;
    background: #f4f4f5;
    color: #111114;
    border: none;
    padding: 0.65rem 1rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-enroll:hover {
    background: #111114;
    color: #ffffff;
  }
</style>
