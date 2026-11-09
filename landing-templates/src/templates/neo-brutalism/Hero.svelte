<script lang="ts">
  import type { NormalizedLandingViewModel } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';
  import Sparkles from '@lucide/svelte/icons/sparkles';

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

<section class="vanguard-hero">
  <div class="hero-bg-glow"></div>

  <div class="hero-container">
    <div class="hero-text">
      {#if hero.eyebrow}
        <div class="eyebrow-badge">
          <Sparkles size={14} class="eyebrow-icon" />
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
        <div class="stats-row">
          {#each hero.stats as stat}
            <div class="stat-card">
              <span class="stat-val">{stat.value}</span>
              <span class="stat-lbl">{stat.label}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    {#if heroImageSrc}
      <div class="hero-media">
        <div class="browser-board">
          <div class="browser-header">
            <div class="traffic-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="browser-address">
              <span class="address-lock">🔒</span>
              <span class="address-text">academy.preview</span>
            </div>
          </div>
          <div class="browser-body">
            <img src={heroImageSrc} alt={hero.heading} class="image" onerror={handleImageError} />
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .vanguard-hero {
    position: relative;
    padding: 5.5rem 2rem 5rem;
    overflow: hidden;
    background: radial-gradient(circle at 50% 0%, rgba(238, 242, 255, 0.7) 0%, rgba(255, 255, 255, 0) 70%);
  }

  .hero-bg-glow {
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .hero-container {
    max-width: 1240px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 4rem;
    align-items: center;
    position: relative;
    z-index: 1;
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

  .eyebrow-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.875rem;
    border-radius: 9999px;
    background: #eef2ff;
    border: 1px solid #e0e7ff;
    color: #4f46e5;
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    letter-spacing: -0.01em;
  }

  :global(.eyebrow-icon) {
    color: #4f46e5;
  }

  .heading {
    margin: 0 0 1.25rem;
    font-size: clamp(2.5rem, 5.5vw, 4.25rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.035em;
    color: #0f172a;
  }

  .subheading {
    margin: 0 0 2.25rem;
    font-size: 1.125rem;
    line-height: 1.65;
    color: #475569;
    max-width: 540px;
  }

  .cta-row {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
    margin-bottom: 3rem;
  }

  .btn-primary {
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    color: #ffffff;
    border: none;
    padding: 0.875rem 1.75rem;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #ffffff;
    color: #0f172a;
    border: 1px solid #e2e8f0;
    padding: 0.875rem 1.75rem;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .btn-secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }

  .stats-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-val {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    color: #0f172a;
  }

  .stat-lbl {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
  }

  .hero-media {
    display: flex;
    justify-content: center;
  }

  .browser-board {
    width: 100%;
    max-width: 520px;
    border-radius: 12px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .browser-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 0.625rem 0.875rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .traffic-dots {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }

  .dot.red {
    background: #ef4444;
  }

  .dot.yellow {
    background: #f59e0b;
  }

  .dot.green {
    background: #10b981;
  }

  .browser-address {
    flex: 1;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.2rem 0.625rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.6875rem;
    color: #64748b;
    max-width: 220px;
  }

  .address-lock {
    font-size: 0.625rem;
  }

  .browser-body {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    overflow: hidden;
  }

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }

  .browser-board:hover .image {
    transform: scale(1.02);
  }

  @media (max-width: 640px) {
    .vanguard-hero {
      padding: 3.5rem 1.25rem 3.5rem;
    }
  }
</style>
