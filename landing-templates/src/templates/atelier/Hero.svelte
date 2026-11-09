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
        <div class="eyebrow-wrap">
          <span class="eyebrow">{hero.eyebrow}</span>
        </div>
      {/if}

      <h1 class="heading">{hero.heading}</h1>

      {#if hero.subheading}
        <p class="subheading">{hero.subheading}</p>
      {/if}

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
            <span>{hero.secondaryAction.label}</span>
          </button>
        {/if}
      </div>

      {#if hero.stats && hero.stats.length > 0}
        <div class="stats-grid">
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
        <div class="media-frame">
          <img src={heroImageSrc} alt={hero.heading} class="image" onerror={handleImageError} />
          <div class="media-edge"></div>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .atelier-hero {
    padding: 5rem 2rem 5.5rem;
    position: relative;
  }

  .hero-container {
    max-width: 1240px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 4.5rem;
    align-items: center;
  }

  @media (max-width: 960px) {
    .hero-container {
      grid-template-columns: 1fr;
      gap: 3.5rem;
    }
  }

  .hero-text {
    max-width: 640px;
  }

  .eyebrow-wrap {
    margin-bottom: 1.5rem;
  }

  .eyebrow {
    display: inline-block;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #c2410c;
  }

  .heading {
    margin: 0 0 1.5rem;
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
    font-size: clamp(2.5rem, 5.5vw, 4.25rem);
    font-weight: 400;
    line-height: 1.08;
    letter-spacing: -0.035em;
    color: #111114;
  }

  .subheading {
    margin: 0 0 2.5rem;
    font-size: 1.125rem;
    line-height: 1.7;
    color: #52525b;
    max-width: 540px;
    letter-spacing: -0.01em;
  }

  .cta-row {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
    margin-bottom: 3.5rem;
  }

  .btn-primary {
    background: #111114;
    color: #ffffff;
    border: none;
    padding: 0.875rem 1.75rem;
    border-radius: 9999px;
    font-size: 0.9375rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .btn-primary:hover:not(:disabled) {
    background: #27272a;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(17, 17, 20, 0.15);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: transparent;
    color: #111114;
    border: 1px solid rgba(17, 17, 20, 0.2);
    padding: 0.875rem 1.75rem;
    border-radius: 9999px;
    font-size: 0.9375rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    border-color: #111114;
    background: rgba(17, 17, 20, 0.03);
    transform: translateY(-1px);
  }

  .stats-grid {
    display: flex;
    align-items: flex-start;
    gap: 3rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(17, 17, 20, 0.08);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .stat-val {
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
    font-size: 2.25rem;
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
    color: #111114;
  }

  .stat-lbl {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #71717a;
  }

  .hero-media {
    display: flex;
    justify-content: center;
  }

  .media-frame {
    position: relative;
    width: 100%;
    max-width: 480px;
    border-radius: 12px;
    background: #ffffff;
    border: 1px solid rgba(17, 17, 20, 0.08);
    box-shadow: 0 24px 48px -12px rgba(17, 17, 20, 0.09);
    overflow: hidden;
  }

  .media-edge {
    position: absolute;
    inset: 0;
    border-radius: 12px;
    pointer-events: none;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  }

  .image {
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }

  .media-frame:hover .image {
    transform: scale(1.02);
  }

  @media (max-width: 640px) {
    .atelier-hero {
      padding: 3rem 1.25rem 4rem;
    }

    .stats-grid {
      gap: 2rem;
      flex-wrap: wrap;
    }
  }
</style>
