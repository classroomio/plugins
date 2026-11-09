<script lang="ts">
  import type { PublicLandingCourse, PublicLandingLabels } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import CourseCard from './CourseCard.svelte';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  let {
    courses,
    coursesLoaded,
    hasMoreCourses,
    labels
  }: {
    courses: PublicLandingCourse[];
    coursesLoaded: boolean;
    hasMoreCourses: boolean;
    labels: PublicLandingLabels;
  } = $props();

  function handleViewAll(e: MouseEvent) {
    e.preventDefault();
    requestNavigation('/courses');
  }
</script>

<section class="atelier-courses">
  <div class="courses-container">
    <div class="header-row">
      <div class="title-col">
        <h2 class="section-heading">{labels.coursesHeading || 'Curated Curriculum'}</h2>
        {#if labels.coursesSubheading}
          <p class="section-subheading">{labels.coursesSubheading}</p>
        {/if}
      </div>

      {#if hasMoreCourses}
        <button class="btn-all" onclick={handleViewAll}>
          <span>{labels.coursesViewAll || 'All Courses'}</span>
          <ArrowRight size={14} />
        </button>
      {/if}
    </div>

    {#if !coursesLoaded}
      <div class="loading-state">
        <div class="spinner"></div>
      </div>
    {:else if courses.length === 0}
      <div class="empty-state">
        <div class="empty-box">
          <span class="empty-mark">§</span>
          <h3 class="empty-title">{labels.coursesEmptyTitle || 'No courses published yet'}</h3>
          <p class="empty-desc">{labels.coursesEmptyDescription || 'The upcoming syllabus will be announced soon.'}</p>
        </div>
      </div>
    {:else}
      <div class="grid">
        {#each courses as course (course.id)}
          <CourseCard {course} {labels} />
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  .atelier-courses {
    padding: 5.5rem 2rem;
    border-top: 1px solid rgba(17, 17, 20, 0.08);
    background: #f4f4f5;
  }

  .courses-container {
    max-width: 1240px;
    margin: 0 auto;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 3rem;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .title-col {
    max-width: 600px;
  }

  .section-heading {
    margin: 0 0 0.5rem;
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #111114;
  }

  .section-subheading {
    margin: 0;
    font-size: 1.0625rem;
    line-height: 1.6;
    color: #52525b;
  }

  .btn-all {
    background: #ffffff;
    color: #111114;
    border: 1px solid rgba(17, 17, 20, 0.12);
    padding: 0.625rem 1.25rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  .btn-all:hover {
    border-color: #111114;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(17, 17, 20, 0.08);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }

  .loading-state {
    padding: 5rem 0;
    display: flex;
    justify-content: center;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid rgba(17, 17, 20, 0.1);
    border-top-color: #111114;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .empty-state {
    padding: 4rem 1rem;
    display: flex;
    justify-content: center;
  }

  .empty-box {
    text-align: center;
    max-width: 440px;
    background: #ffffff;
    padding: 3rem 2rem;
    border-radius: 12px;
    border: 1px solid rgba(17, 17, 20, 0.08);
  }

  .empty-mark {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 2.5rem;
    color: #a1a1aa;
    display: block;
    margin-bottom: 0.75rem;
  }

  .empty-title {
    margin: 0 0 0.5rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.5rem;
    font-weight: 500;
    color: #111114;
  }

  .empty-desc {
    margin: 0;
    font-size: 0.9375rem;
    color: #71717a;
    line-height: 1.6;
  }

  @media (max-width: 640px) {
    .atelier-courses {
      padding: 3.5rem 1.25rem;
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
