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

<section class="neo-courses">
  <div class="courses-container">
    <div class="header-row">
      <div>
        <div class="section-tag">
          <span>Catalog</span>
        </div>
        <h2 class="section-heading">{labels.coursesHeading || 'Featured Courses'}</h2>
        {#if labels.coursesSubheading}
          <p class="section-subheading">{labels.coursesSubheading}</p>
        {/if}
      </div>

      {#if hasMoreCourses}
        <button class="neo-btn-all" onclick={handleViewAll}>
          <span>{labels.coursesViewAll || 'Browse All Courses'}</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      {/if}
    </div>

    {#if !coursesLoaded}
      <div class="loading-state">
        <div class="loader-box">Loading courses...</div>
      </div>
    {:else if courses.length === 0}
      <div class="empty-state">
        <div class="empty-card">
          <span class="empty-icon">🎒</span>
          <h3 class="empty-title">{labels.coursesEmptyTitle || 'No courses available yet'}</h3>
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
  .neo-courses {
    padding: 4rem 1.5rem;
    border-top: 3px solid #18181b;
    background: #fbf9f1;
  }

  .courses-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2.5rem;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .section-tag {
    display: inline-block;
    padding: 0.25rem 0.65rem;
    background: #fde047;
    border: 2px solid #18181b;
    border-radius: 4px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
    box-shadow: 2px 2px 0px #18181b;
  }

  .section-heading {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #18181b;
  }

  .section-subheading {
    margin: 0.5rem 0 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    color: #52525b;
  }

  .neo-btn-all {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9375rem;
    font-weight: 700;
    padding: 0.65rem 1.25rem;
    background: #ffffff;
    border: 2.5px solid #18181b;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #18181b;
    transition: all 0.12s ease;
  }

  .neo-btn-all:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0px #18181b;
  }

  .neo-btn-all:hover {
    background: #f4f4f5;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }

  .loading-state,
  .empty-state {
    padding: 3rem 1rem;
    display: flex;
    justify-content: center;
  }

  .loader-box {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    padding: 1rem 2rem;
    border: 2.5px solid #18181b;
    background: #ffffff;
    box-shadow: 4px 4px 0px #18181b;
  }

  .empty-card {
    border: 3px solid #18181b;
    border-radius: 12px;
    background: #ffffff;
    padding: 3rem 2rem;
    box-shadow: 6px 6px 0px #18181b;
    text-align: center;
    max-width: 440px;
    width: 100%;
  }

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .empty-title {
    margin: 0 0 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
  }

  .empty-desc {
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    color: #71717a;
  }
</style>
