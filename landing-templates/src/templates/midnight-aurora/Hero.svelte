<script lang="ts">
  import type { NormalizedLandingViewModel } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import Sparkles from '@lucide/svelte/icons/sparkles';
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

<section class="obsidian-hero">
  <!-- Radiant ambient glow elements -->
  <div class="mesh-glow mesh-1" aria-hidden="true"></div>
  <div class="mesh-glow mesh-2" aria-hidden="true"></div>

  <div class="hero-container">
    <div class="hero-content">
      {#if hero.eyebrow}
        <div class="eyebrow-pill">
          <span class="pulse-dot" aria-hidden="true"></span>
          <span>{hero.eyebrow}</span>
        </div>
      {/if}

      <h1 class="heading">{hero.heading}</h1>

      {#if hero.subheading}
        <p class="subheading">{hero.subheading}</p>
      {/if}

      <div class="cta-row">
        {#if hero.primaryAction}
          <button
            type="button"
            class="btn-aurora"
            disabled={hero.primaryAction.disabled}
            onclick={(e) => handleAction(hero.primaryAction!.href, e)}
          >
            <Sparkles size={16} />
            <span>{hero.primaryAction.label}</span>
          </button>
        {/if}

        {#if hero.secondaryAction}
          <button
            type="button"
            class="btn-glass"
            onclick={(e) => handleAction(hero.secondaryAction!.href, e)}
          >
            <span>{hero.secondaryAction.label}</span>
            <ArrowRight size={16} />
          </button>
        {/if}
      </div>

      {#if hero.stats && hero.stats.length > 0}
        <div class="stats-grid">
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
        <div class="glass-frame">
          <img src={heroImageSrc} alt={hero.heading} class="image" onerror={handleImageError} />
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .obsidian-hero {
    position: relative;
    padding: 5.5rem 1.5rem 4.5rem;
    overflow: hidden;
  }

  .mesh-glow {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(100px);
    opacity: 0.3;
    z-index: 0;
  }

  .mesh-1 {
    width: 550px;
    height: 550px;
    top: -120px;
    left: 15%;
    background: radial-gradient(circle, #6366f1 0%, transparent 70%);
  }

  .mesh-2 {
    width: 480px;
    height: 480px;
    top: 40px;
    right: 12%;
    background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
  }

  .hero-container {
    position: relative;
    z-index: 1;
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

  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .eyebrow-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.875rem;
    border-radius: 9999px;
    background: rgba(34, 211, 238, 0.08);
    border: 1px solid rgba(34, 211, 238, 0.25);
    color: #22d3ee;
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22d3ee;
    box-shadow: 0 0 8px #22d3ee;
  }

  .heading {
    margin: 0 0 1.25rem;
    font-size: clamp(2.25rem, 4.5vw, 3.75rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.035em;
    color: #ffffff;
  }

  .subheading {
    margin: 0 0 2rem;
    font-size: 1.0625rem;
    line-height: 1.6;
    color: #94a3b8;
    max-width: 540px;
  }

  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .btn-aurora {
    font-size: 0.9375rem;
    font-weight: 700;
    padding: 0.75rem 1.625rem;
    border-radius: 9999px;
    background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);
    color: #ffffff;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    transition: all 0.2s ease;
  }

  .btn-aurora:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px rgba(99, 102, 241, 0.6);
  }

  .btn-aurora:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .btn-glass {
    font-size: 0.9375rem;
    font-weight: 600;
    padding: 0.75rem 1.625rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: #f8fafc;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-glass:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.28);
  }

  .stats-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 0.75rem 1.125rem;
    display: flex;
    flex-direction: column;
    min-width: 110px;
  }

  .stat-value {
    font-family: 'Geist Mono', monospace;
    font-size: 1.375rem;
    font-weight: 700;
    color: #ffffff;
  }

  .stat-label {
    font-size: 0.6875rem;
    font-weight: 500;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .glass-frame {
    border-radius: 16px;
    padding: 6px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  }

  .image {
    width: 100%;
    height: auto;
    border-radius: 10px;
    display: block;
    object-fit: cover;
    max-height: 460px;
  }
</style>
