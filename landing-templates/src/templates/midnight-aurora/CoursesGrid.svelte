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

<section class="obsidian-courses">
  <div class="courses-container">
    <div class="header-row">
      <div>
        <span class="section-kicker">✦ Curriculum</span>
        <h2 class="section-heading">{labels.coursesHeading || 'Featured Tracks & Courses'}</h2>
        {#if labels.coursesSubheading}
          <p class="section-subheading">{labels.coursesSubheading}</p>
        {/if}
      </div>

      {#if hasMoreCourses}
        <button type="button" class="btn-browse-all" onclick={handleViewAll}>
          <span>{labels.coursesViewAll || 'Explore All Courses'}</span>
          <ArrowRight size={15} />
        </button>
      {/if}
    </div>

    {#if !coursesLoaded}
      <div class="loading-box">
        <span class="pulse-text">Loading curriculum...</span>
      </div>
    {:else if courses.length === 0}
      <div class="empty-box">
        <div class="empty-inner">
          <span class="empty-glyph">✧</span>
          <h3 class="empty-title">{labels.coursesEmptyTitle || 'No courses published yet'}</h3>
          <p class="empty-desc">{labels.coursesEmptyDescription || 'New tracks will be announced shortly.'}</p>
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
  .obsidian-courses {
    padding: 5rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: #08090d;
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

  .section-kicker {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #22d3ee;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 0.5rem;
  }

  .section-heading {
    margin: 0;
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    color: #ffffff;
  }

  .section-subheading {
    margin: 0.5rem 0 0;
    font-size: 1rem;
    color: #94a3b8;
  }

  .btn-browse-all {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.65rem 1.25rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-browse-all:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(99, 102, 241, 0.45);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }

  .loading-box,
  .empty-box {
    padding: 4rem 1rem;
    display: flex;
    justify-content: center;
  }

  .pulse-text {
    font-family: 'Geist Mono', monospace;
    font-size: 0.875rem;
    color: #64748b;
  }

  .empty-inner {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 3rem 2rem;
    text-align: center;
    max-width: 440px;
    width: 100%;
  }

  .empty-glyph {
    font-size: 2.5rem;
    color: #22d3ee;
    display: block;
    margin-bottom: 0.75rem;
  }

  .empty-title {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    font-weight: 700;
    color: #ffffff;
  }

  .empty-desc {
    margin: 0;
    font-size: 0.875rem;
    color: #64748b;
  }
</style>
