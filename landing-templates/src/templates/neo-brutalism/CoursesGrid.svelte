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

<section class="vanguard-courses">
  <div class="courses-container">
    <div class="header-row">
      <div class="title-col">
        <div class="section-badge">Curriculum</div>
        <h2 class="section-heading">{labels.coursesHeading || 'Featured Courses'}</h2>
        {#if labels.coursesSubheading}
          <p class="section-subheading">{labels.coursesSubheading}</p>
        {/if}
      </div>

      {#if hasMoreCourses}
        <button class="btn-all" onclick={handleViewAll}>
          <span>{labels.coursesViewAll || 'Explore All Courses'}</span>
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
          <span class="empty-icon">✦</span>
          <h3 class="empty-title">{labels.coursesEmptyTitle || 'No courses published yet'}</h3>
          <p class="empty-desc">{labels.coursesEmptyDescription || 'Check back soon for upcoming courses.'}</p>
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
  .vanguard-courses {
    padding: 5.5rem 2rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
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

  .section-badge {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #4f46e5;
    margin-bottom: 0.5rem;
  }

  .section-heading {
    margin: 0 0 0.5rem;
    font-size: clamp(2rem, 4vw, 2.75rem);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.03em;
    color: #0f172a;
  }

  .section-subheading {
    margin: 0;
    font-size: 1.0625rem;
    line-height: 1.6;
    color: #64748b;
  }

  .btn-all {
    background: #ffffff;
    color: #0f172a;
    border: 1px solid #e2e8f0;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }

  .btn-all:hover {
    border-color: #cbd5e1;
    background: #f1f5f9;
    transform: translateY(-1px);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
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
    border: 2px solid #e2e8f0;
    border-top-color: #4f46e5;
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
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  }

  .empty-icon {
    font-size: 2rem;
    color: #6366f1;
    display: block;
    margin-bottom: 0.75rem;
  }

  .empty-title {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
  }

  .empty-desc {
    margin: 0;
    font-size: 0.9375rem;
    color: #64748b;
    line-height: 1.6;
  }

  @media (max-width: 640px) {
    .vanguard-courses {
      padding: 3.5rem 1.25rem;
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
