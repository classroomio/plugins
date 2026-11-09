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

  function viewAll(e: MouseEvent) {
    e.preventDefault();
    requestNavigation('/courses');
  }
</script>

<section>
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
      <div class="bento">
        {#each courses as course, i (course.id)}
          <div class="cell" class:hero={i === 0 && courses.length > 2}>
            <CourseCard {course} {labels} featured={i === 0 && courses.length > 2} tone={i} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  section {
    position: relative;
    margin-top: -3rem;
    padding: 0 1.5rem 6rem;
    border-radius: 2.5rem 2.5rem 0 0;
    background: #f3f4fb;
    padding-top: 5rem;
  }

  .wrap {
    max-width: 76rem;
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
    font-size: clamp(2rem, 4vw, 3.25rem);
    font-weight: 800;
    letter-spacing: -0.045em;
    color: #0b1020;
  }

  header p {
    margin: 0;
    color: #5b6483;
    max-width: 34rem;
  }

  button {
    font: inherit;
    font-weight: 700;
    padding: 0.75rem 1.3rem;
    border-radius: 0.85rem;
    border: 0;
    color: #fff;
    background: #0b1020;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  button:hover {
    background: #4f46e5;
  }

  .bento {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
    gap: 1.25rem;
  }

  .cell.hero {
    grid-column: span 2;
    grid-row: span 2;
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
  }

  .empty h3 {
    margin: 0 0 0.4rem;
    color: #0b1020;
  }

  .empty p {
    margin: 0;
    color: #5b6483;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 2px solid #dfe2f3;
    border-top-color: #4f46e5;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    .cell.hero {
      grid-column: span 1;
      grid-row: span 1;
    }
  }
</style>
