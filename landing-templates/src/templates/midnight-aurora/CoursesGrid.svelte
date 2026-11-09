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

  const spotlight = $derived(courses[0]);
  const rest = $derived(courses.slice(1));

  function viewAll(e: MouseEvent) {
    e.preventDefault();
    requestNavigation('/courses');
  }
</script>

<section class="courses">
  <div class="wrap">
    <header>
      <div>
        <h2>{labels.coursesHeading}</h2>
        {#if labels.coursesSubheading}<p>{labels.coursesSubheading}</p>{/if}
      </div>
      {#if hasMoreCourses}
        <button onclick={viewAll}>{labels.coursesViewAll}<ArrowRight size={16} /></button>
      {/if}
    </header>

    {#if !coursesLoaded}
      <div class="state"><div class="spinner"></div></div>
    {:else if courses.length === 0}
      <div class="state empty">
        <h3>{labels.coursesEmptyTitle}</h3>
        <p>{labels.coursesEmptyDescription}</p>
      </div>
    {:else}
      <CourseCard course={spotlight} {labels} variant="feature" index={0} />

      {#if rest.length > 0}
        <div class="list">
          {#each rest as course, i (course.id)}
            <CourseCard {course} {labels} variant="row" index={i + 1} />
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</section>

<style>
  .courses {
    padding: 6rem 1.5rem;
  }

  .wrap {
    max-width: 72rem;
    margin: 0 auto;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-bottom: 2.5rem;
  }

  h2 {
    margin: 0 0 0.5rem;
    font-size: clamp(2rem, 4vw, 3rem);
    letter-spacing: -0.04em;
    color: #fff;
  }

  header p {
    margin: 0;
    color: #8b93a5;
    max-width: 34rem;
  }

  button {
    font: inherit;
    font-weight: 600;
    color: #e0e7ff;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    padding: 0.65rem 1.2rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .list {
    margin-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
  }

  .state {
    display: flex;
    justify-content: center;
    padding: 4rem 0;
  }

  .empty {
    flex-direction: column;
    align-items: center;
    text-align: center;
    border: 1px dashed rgba(255, 255, 255, 0.15);
    border-radius: 1.25rem;
    color: #8b93a5;
  }

  .empty h3 {
    margin: 0 0 0.4rem;
    color: #fff;
  }

  .empty p {
    margin: 0;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.12);
    border-top-color: #818cf8;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
