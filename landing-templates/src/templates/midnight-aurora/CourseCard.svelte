<script lang="ts">
  import type { PublicLandingCourse, PublicLandingLabels } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

  let {
    course,
    labels,
    variant = 'row',
    index = 0
  }: {
    course: PublicLandingCourse;
    labels: PublicLandingLabels;
    variant?: 'feature' | 'row';
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

  const number = $derived(String(index + 1).padStart(2, '0'));
</script>

{#if variant === 'feature'}
  <a class="feature" href={course.href} onclick={open}>
    <div class="media">
      {#if course.image}
        <img src={course.image} alt={course.title} />
      {:else}
        <div class="placeholder"></div>
      {/if}
      <span class="badge">{price}</span>
    </div>
    <div class="body">
      <span class="mono">{number}</span>
      {#if course.tags && course.tags.length > 0}
        <div class="tags">
          {#each course.tags.slice(0, 3) as tag}<span>{tag}</span>{/each}
        </div>
      {/if}
      <h3>{course.title}</h3>
      {#if course.description}<p>{course.description}</p>{/if}
      <div class="foot">
        <span class="meta">
          {#if typeof course.lessonsCount === 'number'}{course.lessonsCount} {labels.courseLessons}{/if}
          {#if typeof course.lessonsCount === 'number' && typeof course.studentsCount === 'number'} · {/if}
          {#if typeof course.studentsCount === 'number'}{course.studentsCount} {labels.courseStudents}{/if}
        </span>
        <span class="cta">{labels.courseEnroll}<ArrowUpRight size={16} /></span>
      </div>
    </div>
  </a>
{:else}
  <a class="row" href={course.href} onclick={open}>
    <span class="mono">{number}</span>
    <div class="thumb">
      {#if course.image}<img src={course.image} alt={course.title} />{:else}<div class="placeholder"></div>{/if}
    </div>
    <div class="text">
      <h4>{course.title}</h4>
      {#if course.description}<p>{course.description}</p>{/if}
    </div>
    <span class="meta">
      {#if typeof course.lessonsCount === 'number'}{course.lessonsCount} {labels.courseLessons}{/if}
    </span>
    <span class="price">{price}</span>
    <span class="arrow"><ArrowUpRight size={18} /></span>
  </a>
{/if}

<style>
  a {
    color: inherit;
    text-decoration: none;
  }

  .mono {
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 0.8rem;
    color: #6366f1;
    letter-spacing: 0.1em;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.5), transparent 60%), #0e1018;
  }

  .feature {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    border-radius: 1.5rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.015));
    transition: border-color 0.3s ease, transform 0.3s ease;
  }

  .feature:hover {
    border-color: rgba(129, 140, 248, 0.5);
    transform: translateY(-3px);
  }

  .media {
    position: relative;
    min-height: 22rem;
  }

  .media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .badge {
    position: absolute;
    top: 1.25rem;
    left: 1.25rem;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    background: rgba(5, 6, 10, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .body {
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .tags {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .tags span {
    font-size: 0.72rem;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    color: #a5b4fc;
    background: rgba(99, 102, 241, 0.12);
  }

  h3 {
    margin: 0;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    line-height: 1.1;
    letter-spacing: -0.035em;
    color: #fff;
  }

  .body p {
    margin: 0;
    color: #9ca3b4;
    line-height: 1.65;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .foot {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .meta {
    font-size: 0.85rem;
    color: #6b7280;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 600;
    color: #e0e7ff;
  }

  .row {
    display: grid;
    grid-template-columns: 2.5rem 5.5rem 1fr auto auto 2rem;
    align-items: center;
    gap: 1.5rem;
    padding: 1.25rem 1.5rem;
    border-radius: 1rem;
    border: 1px solid transparent;
    transition: background 0.25s ease, border-color 0.25s ease;
  }

  .row:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.09);
  }

  .thumb {
    width: 5.5rem;
    height: 3.75rem;
    border-radius: 0.6rem;
    overflow: hidden;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .text h4 {
    margin: 0 0 0.2rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #f3f4f6;
    letter-spacing: -0.02em;
  }

  .text p {
    margin: 0;
    font-size: 0.875rem;
    color: #7b8394;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .price {
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 0.9rem;
    color: #e5e7eb;
    min-width: 4rem;
    text-align: right;
  }

  .arrow {
    color: #6b7280;
    transition: transform 0.25s ease, color 0.25s ease;
  }

  .row:hover .arrow {
    color: #a5b4fc;
    transform: translate(3px, -3px);
  }

  @media (max-width: 860px) {
    .feature {
      grid-template-columns: 1fr;
    }

    .media {
      min-height: 15rem;
    }

    .body {
      padding: 1.5rem;
    }

    .row {
      grid-template-columns: 4.5rem 1fr auto;
    }

    .row .mono,
    .row .meta,
    .row .arrow {
      display: none;
    }

    .thumb {
      width: 4.5rem;
    }
  }
</style>
