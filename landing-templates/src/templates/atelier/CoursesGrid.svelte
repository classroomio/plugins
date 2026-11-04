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
      <div>
        <span class="kicker">Selected Studies</span>
        <h2 class="section-heading">{labels.coursesHeading || 'Curated Curriculum'}</h2>
        {#if labels.coursesSubheading}
          <p class="section-subheading">{labels.coursesSubheading}</p>
        {/if}
      </div>

      {#if hasMoreCourses}
        <button class="btn-all" onclick={handleViewAll}>
          <span>{labels.coursesViewAll || 'All Courses'} —</span>
        </button>
      {/if}
    </div>

    {#if !coursesLoaded}
      <div class="loading-state">
        <span class="loading-text">Loading atelier curriculum...</span>
      </div>
    {:else if courses.length === 0}
      <div class="empty-state">
        <div class="empty-box">
          <span class="empty-mark">§</span>
          <h3 class="empty-title">{labels.coursesEmptyTitle || 'No courses published yet'}</h3>
          <p class="empty-desc">{labels.coursesEmptyDescription || 'The upcoming studio syllabus will be announced soon.'}</p>
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
    padding: 5rem 2rem;
    border-top: 1px solid rgba(214, 211, 209, 0.7);
    background: #f7f5ef;
  }

  .courses-container {
    max-width: 1200px;
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

  .kicker {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #c2410c;
    display: block;
    margin-bottom: 0.5rem;
  }

  .section-heading {
    margin: 0;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 400;
    color: #1c1917;
  }

  .section-subheading {
    margin: 0.5rem 0 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    color: #57534e;
  }

  .btn-all {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.0625rem;
    font-style: italic;
    background: transparent;
    border: none;
    color: #1c1917;
    cursor: pointer;
    padding: 0.5rem;
    transition: color 0.15s ease;
  }

  .btn-all:hover {
    color: #c2410c;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2.25rem;
  }

  .loading-state,
  .empty-state {
    padding: 4rem 1rem;
    display: flex;
    justify-content: center;
  }

  .loading-text {
    font-family: 'Newsreader', Georgia, serif;
    font-style: italic;
    font-size: 1.125rem;
    color: #78716c;
  }

  .empty-box {
    border: 1px solid rgba(214, 211, 209, 0.8);
    border-radius: 4px;
    background: #ffffff;
    padding: 3.5rem 2.5rem;
    text-align: center;
    max-width: 440px;
    width: 100%;
  }

  .empty-mark {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 2.5rem;
    color: #c2410c;
    display: block;
    margin-bottom: 0.75rem;
  }

  .empty-title {
    margin: 0 0 0.5rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.35rem;
    font-weight: 500;
    color: #1c1917;
  }

  .empty-desc {
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    color: #78716c;
    line-height: 1.5;
  }
</style>
