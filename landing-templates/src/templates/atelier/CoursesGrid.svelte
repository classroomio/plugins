<script lang="ts">
  import type { PublicLandingCourse, PublicLandingLabels } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import CourseCard from './CourseCard.svelte';

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
      <h2>{labels.coursesHeading}</h2>
      <div class="aside">
        {#if labels.coursesSubheading}<p>{labels.coursesSubheading}</p>{/if}
        {#if hasMoreCourses}
          <button onclick={viewAll}>{labels.coursesViewAll}</button>
        {/if}
      </div>
    </header>

    {#if !coursesLoaded}
      <div class="state"><div class="spinner"></div></div>
    {:else if courses.length === 0}
      <div class="state empty">
        <h3>{labels.coursesEmptyTitle}</h3>
        <p>{labels.coursesEmptyDescription}</p>
      </div>
    {:else}
      <div class="index">
        {#each courses as course, i (course.id)}
          <CourseCard {course} {labels} index={i} />
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  section {
    background: #f6f3ec;
    color: #1a1713;
    padding: 2rem 2rem 6rem;
  }

  .wrap {
    max-width: 80rem;
    margin: 0 auto;
  }

  header {
    display: grid;
    grid-template-columns: 8fr 4fr;
    gap: 4rem;
    align-items: end;
    padding-bottom: 2.5rem;
    border-bottom: 3px double #1a1713;
    margin-bottom: 0;
  }

  h2 {
    margin: 0;
    font-family: 'Newsreader', Georgia, serif;
    font-weight: 400;
    font-size: clamp(2.5rem, 6vw, 5rem);
    line-height: 0.95;
    letter-spacing: -0.045em;
  }

  .aside p {
    margin: 0 0 1rem;
    line-height: 1.6;
    color: #3d372e;
  }

  button {
    font: inherit;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 600;
    background: none;
    border: 0;
    border-bottom: 1px solid #1a1713;
    padding: 0 0 0.25rem;
    cursor: pointer;
    color: #1a1713;
  }

  .index {
    border-bottom: 1px solid #1a1713;
  }

  .index > :global(:first-child) {
    border-top: 0;
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
    margin: 0 0 0.5rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: 2rem;
    font-weight: 400;
  }

  .empty p {
    margin: 0;
    color: #6b6355;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 2px solid rgba(26, 23, 19, 0.15);
    border-top-color: #1a1713;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 860px) {
    header {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>
