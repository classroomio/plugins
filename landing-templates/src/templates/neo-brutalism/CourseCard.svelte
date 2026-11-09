<script lang="ts">
  import type { PublicLandingCourse, PublicLandingLabels } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

  let {
    course,
    labels,
    featured = false,
    tone = 0
  }: {
    course: PublicLandingCourse;
    labels: PublicLandingLabels;
    featured?: boolean;
    tone?: number;
  } = $props();

  const gradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #ec4899, #f97316)',
    'linear-gradient(135deg, #06b6d4, #3b82f6)',
    'linear-gradient(135deg, #10b981, #06b6d4)'
  ];

  function open(e: MouseEvent) {
    e.preventDefault();
    requestNavigation(course.href);
  }

  const price = $derived.by(() => {
    if (course.isFree || course.price === 0) return labels.courseFree;
    if (typeof course.price === 'number') return `${course.currency ?? '$'}${course.price}`;
    return labels.courseFree;
  });
</script>

<a class="tile" class:featured href={course.href} onclick={open}>
  <div class="art" style:background={gradients[tone % gradients.length]}>
    {#if course.image}<img src={course.image} alt={course.title} />{/if}
    <div class="shade"></div>
    <span class="price">{price}</span>
    <span class="go"><ArrowUpRight size={18} /></span>
  </div>

  <div class="info">
    {#if course.tags && course.tags.length > 0}
      <div class="tags">
        {#each course.tags.slice(0, featured ? 3 : 2) as tag}<span>{tag}</span>{/each}
      </div>
    {/if}
    <h3>{course.title}</h3>
    {#if course.description}<p>{course.description}</p>{/if}
    {#if typeof course.lessonsCount === 'number' || typeof course.studentsCount === 'number'}
      <div class="meta">
        {#if typeof course.lessonsCount === 'number'}<span>{course.lessonsCount} {labels.courseLessons}</span>{/if}
        {#if typeof course.studentsCount === 'number'}<span>{course.studentsCount} {labels.courseStudents}</span>{/if}
      </div>
    {/if}
  </div>
</a>

<style>
  .tile {
    display: flex;
    flex-direction: column;
    border-radius: 1.5rem;
    overflow: hidden;
    background: #fff;
    color: #0b1020;
    text-decoration: none;
    box-shadow: 0 1px 2px rgba(11, 16, 32, 0.06), 0 10px 30px -12px rgba(11, 16, 32, 0.15);
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;
  }

  .tile:hover {
    transform: translateY(-6px);
    box-shadow: 0 30px 60px -20px rgba(79, 70, 229, 0.35);
  }

  .art {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
  }

  .art img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .tile:hover img {
    transform: scale(1.06);
  }

  .shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 55%, rgba(5, 8, 30, 0.45));
  }

  .price {
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 800;
    background: #fff;
    color: #0b1020;
  }

  .go {
    position: absolute;
    right: 1rem;
    top: 1rem;
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    transition: transform 0.25s ease;
  }

  .tile:hover .go {
    transform: rotate(45deg);
  }

  .info {
    padding: 1.4rem 1.5rem 1.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    flex: 1;
  }

  .tags {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .tags span {
    padding: 0.2rem 0.6rem;
    border-radius: 0.5rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: #4f46e5;
    background: #eef0fb;
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    line-height: 1.2;
    letter-spacing: -0.03em;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.55;
    color: #5b6483;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    margin-top: auto;
    padding-top: 0.5rem;
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #8088a6;
  }

  .featured {
    height: 100%;
  }

  .featured .art {
    flex: 1;
    aspect-ratio: auto;
    min-height: 16rem;
  }

  .featured h3 {
    font-size: 1.9rem;
    letter-spacing: -0.04em;
  }

  .featured p {
    font-size: 1rem;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
</style>
