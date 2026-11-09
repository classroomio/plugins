<script lang="ts">
  import type { PublicLandingCourse, PublicLandingLabels } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  let {
    course,
    labels,
    index = 0
  }: {
    course: PublicLandingCourse;
    labels: PublicLandingLabels;
    index?: number;
  } = $props();

  function open(e: MouseEvent) {
    e.preventDefault();
    requestNavigation(course.href);
  }

  const price = $derived.by(() => {
    if (course.isFree || course.price === 0) return labels.courseFree;
    if (typeof course.price === 'number') return `${course.currency ?? '$'}${course.price}`;
    return labels.courseFree;
  });

  const roman = $derived(String(index + 1).padStart(2, '0'));
</script>

<a class="entry" href={course.href} onclick={open}>
  <span class="no">{roman}</span>

  <div class="main">
    {#if course.tags && course.tags.length > 0}
      <span class="tags">{course.tags.slice(0, 3).join(' · ')}</span>
    {/if}
    <h3>{course.title}</h3>
    {#if course.description}<p>{course.description}</p>{/if}
    <span class="meta">
      {#if typeof course.lessonsCount === 'number'}{course.lessonsCount} {labels.courseLessons}{/if}
      {#if typeof course.lessonsCount === 'number' && typeof course.studentsCount === 'number'} — {/if}
      {#if typeof course.studentsCount === 'number'}{course.studentsCount} {labels.courseStudents}{/if}
    </span>
  </div>

  <div class="plate">
    {#if course.image}<img src={course.image} alt={course.title} />{/if}
  </div>

  <div class="end">
    <span class="price">{price}</span>
    <span class="go">{labels.courseEnroll}<ArrowRight size={14} /></span>
  </div>
</a>

<style>
  .entry {
    display: grid;
    grid-template-columns: 4rem 1fr 11rem 9rem;
    gap: 2rem;
    align-items: center;
    padding: 2rem 0;
    border-top: 1px solid #1a1713;
    color: #1a1713;
    text-decoration: none;
    transition: padding 0.3s ease, background 0.3s ease;
  }

  .entry:hover {
    background: #ece7da;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .no {
    font-family: 'Newsreader', Georgia, serif;
    font-style: italic;
    font-size: 1.5rem;
    color: #a3340f;
  }

  .tags {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-weight: 600;
    color: #6b6355;
  }

  h3 {
    margin: 0 0 0.6rem;
    font-family: 'Newsreader', Georgia, serif;
    font-weight: 400;
    font-size: clamp(1.6rem, 3vw, 2.5rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  p {
    margin: 0 0 0.75rem;
    max-width: 38rem;
    line-height: 1.6;
    color: #3d372e;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    font-size: 0.8rem;
    color: #6b6355;
  }

  .plate {
    aspect-ratio: 4 / 3;
    background: #ddd6c5;
    overflow: hidden;
  }

  .plate img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(0.4);
    transition: filter 0.4s ease, transform 0.6s ease;
  }

  .entry:hover .plate img {
    filter: none;
    transform: scale(1.05);
  }

  .end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
  }

  .price {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.75rem;
    letter-spacing: -0.02em;
  }

  .go {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 600;
  }

  @media (max-width: 860px) {
    .entry {
      grid-template-columns: 2.5rem 1fr;
      gap: 1rem 1.25rem;
    }

    .plate {
      grid-column: 2;
      grid-row: 3;
    }

    .end {
      grid-column: 2;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
