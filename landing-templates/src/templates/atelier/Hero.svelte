<script lang="ts">
  import type { NormalizedLandingViewModel } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  let { hero }: { hero: NormalizedLandingViewModel['hero'] } = $props();

  let failedImageSrc = $state<string | null>(null);
  const heroImageSrc = $derived(hero.image && hero.image !== failedImageSrc ? hero.image : undefined);

  function handleAction(href: string, e: MouseEvent) {
    e.preventDefault();
    requestNavigation(href);
  }

  function handleImageError() {
    if (hero.image) {
      failedImageSrc = hero.image;
    }
  }
</script>

<section class="atelier-hero">
  <div class="hero-container">
    <div class="hero-text">
      {#if hero.eyebrow}
        <span class="eyebrow">{hero.eyebrow}</span>
      {:else}
        <span class="eyebrow">A Master Study in Practice</span>
      {/if}

      <h1 class="heading">{hero.heading}</h1>
      <p class="subheading">{hero.subheading}</p>

      <div class="cta-row">
        {#if hero.primaryAction}
          <button
            class="btn-primary"
            disabled={hero.primaryAction.disabled}
            onclick={(e) => handleAction(hero.primaryAction!.href, e)}
          >
            <span>{hero.primaryAction.label}</span>
            <ArrowRight size={16} />
          </button>
        {/if}

        {#if hero.secondaryAction}
          <button
            class="btn-secondary"
            onclick={(e) => handleAction(hero.secondaryAction!.href, e)}
          >
            <span>{hero.secondaryAction.label} —</span>
          </button>
        {/if}
      </div>

      {#if hero.stats && hero.stats.length > 0}
        <div class="stats-row">
          {#each hero.stats as stat}
            <div class="stat-item">
              <span class="stat-val">{stat.value}</span>
              <span class="stat-lbl">{stat.label}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    {#if heroImageSrc}
      <div class="hero-media">
        <div class="book-frame">
          <img src={heroImageSrc} alt={hero.heading} class="image" onerror={handleImageError} />
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .atelier-hero {
    padding: 5.5rem 2rem 4.5rem;
  }

  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 4rem;
    align-items: center;
  }

  @media (max-width: 900px) {
    .hero-container {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
  }

  .hero-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .eyebrow {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #c2410c;
    margin-bottom: 1.25rem;
    display: block;
  }

  .heading {
    margin: 0 0 1.5rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(2.5rem, 5vw, 4.25rem);
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: #1c1917;
  }

  .subheading {
    margin: 0 0 2.5rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.125rem;
    line-height: 1.7;
    color: #57534e;
    max-width: 540px;
  }

  .cta-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }

  .btn-primary {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    padding: 0.875rem 1.75rem;
    border-radius: 4px;
    background: #1c1917;
    color: #fbf9f4;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .btn-primary:hover {
    background: #292524;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
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

  .btn-secondary:hover {
    color: #c2410c;
  }

  .stats-row {
    display: flex;
    gap: 2.5rem;
    border-top: 1px solid rgba(214, 211, 209, 0.7);
    padding-top: 1.5rem;
    width: 100%;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
  }

  .stat-val {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 2rem;
    font-weight: 500;
    color: #1c1917;
    line-height: 1;
  }

  .stat-lbl {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #78716c;
    margin-top: 0.25rem;
  }

  .book-frame {
    border: 1px solid rgba(214, 211, 209, 0.8);
    border-radius: 6px;
    padding: 12px;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(28, 25, 23, 0.05);
  }

  .image {
    width: 100%;
    height: auto;
    border-radius: 2px;
    display: block;
    object-fit: cover;
    max-height: 500px;
  }
</style>
