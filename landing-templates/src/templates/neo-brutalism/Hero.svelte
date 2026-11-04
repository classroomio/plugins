<script lang="ts">
  import type { NormalizedLandingViewModel } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  let { hero }: { hero: NormalizedLandingViewModel['hero'] } = $props();

  let failedImageSrc = $state<string | null>(null);
  const heroImageSrc = $derived(
    hero.image && hero.image !== failedImageSrc ? hero.image : FALLBACK_IMAGE
  );

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

<section class="neo-hero">
  <div class="hero-container">
    <div class="hero-text">
      {#if hero.eyebrow}
        <div class="eyebrow-sticker">
          <span>{hero.eyebrow}</span>
        </div>
      {/if}

      <h1 class="heading">{hero.heading}</h1>
      <p class="subheading">{hero.subheading}</p>

      <div class="cta-row">
        {#if hero.primaryAction}
          <button
            class="neo-btn neo-btn-lg neo-btn-cyan"
            disabled={hero.primaryAction.disabled}
            onclick={(e) => handleAction(hero.primaryAction!.href, e)}
          >
            <span>{hero.primaryAction.label}</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        {/if}

        {#if hero.secondaryAction}
          <button
            class="neo-btn neo-btn-lg neo-btn-white"
            onclick={(e) => handleAction(hero.secondaryAction!.href, e)}
          >
            <span>{hero.secondaryAction.label}</span>
          </button>
        {/if}
      </div>

      {#if hero.stats && hero.stats.length > 0}
        <div class="stats-row">
          {#each hero.stats as stat}
            <div class="stat-card">
              <span class="stat-value">{stat.value}</span>
              <span class="stat-label">{stat.label}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    {#if heroImageSrc}
      <div class="hero-media">
        <div class="image-frame">
          <img src={heroImageSrc} alt={hero.heading} class="image" onerror={handleImageError} />
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .neo-hero {
    padding: 4rem 1.5rem 3.5rem;
    position: relative;
  }

  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 3.5rem;
    align-items: center;
  }

  @media (max-width: 900px) {
    .hero-container {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
  }

  .hero-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .eyebrow-sticker {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    background: #a3e635;
    color: #18181b;
    border: 2.5px solid #18181b;
    border-radius: 6px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transform: rotate(-2deg);
    margin-bottom: 1.25rem;
    box-shadow: 2px 2px 0px #18181b;
  }

  .heading {
    margin: 0 0 1.25rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.25rem, 4.5vw, 3.75rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: #18181b;
  }

  .subheading {
    margin: 0 0 2rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.125rem;
    line-height: 1.6;
    color: #3f3f46;
    max-width: 580px;
  }

  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .neo-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    border: 3px solid #18181b;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: 5px 5px 0px #18181b;
    transition: all 0.12s ease;
  }

  .neo-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 2px 2px 0px #18181b;
  }

  .neo-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 5px 5px 0px #18181b;
  }

  .neo-btn-lg {
    padding: 0.875rem 1.75rem;
    font-size: 1.0625rem;
  }

  .neo-btn-cyan {
    background: #38bdf8;
    color: #18181b;
  }

  .neo-btn-cyan:hover {
    background: #7dd3fc;
  }

  .neo-btn-white {
    background: #ffffff;
    color: #18181b;
  }

  .neo-btn-white:hover {
    background: #f4f4f5;
  }

  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
  }

  .stat-card {
    border: 2.5px solid #18181b;
    border-radius: 6px;
    background: #ffffff;
    padding: 0.75rem 1.25rem;
    box-shadow: 3px 3px 0px #18181b;
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: #18181b;
  }

  .stat-label {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .hero-media {
    position: relative;
  }

  .image-frame {
    border: 3px solid #18181b;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 7px 7px 0px #18181b;
    overflow: hidden;
  }

  .image {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    max-height: 480px;
  }
</style>
