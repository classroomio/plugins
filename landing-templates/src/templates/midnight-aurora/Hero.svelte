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
    if (hero.image) failedImageSrc = hero.image;
  }
</script>

<section class="hero">
  <div class="beam beam-a"></div>
  <div class="beam beam-b"></div>

  <div class="inner">
    {#if hero.eyebrow}
      <span class="eyebrow"><i></i>{hero.eyebrow}</span>
    {/if}

    <h1>{hero.heading}</h1>

    {#if hero.subheading}
      <p class="sub">{hero.subheading}</p>
    {/if}

    <div class="ctas">
      {#if hero.primaryAction}
        <button class="primary" disabled={hero.primaryAction.disabled} onclick={(e) => handleAction(hero.primaryAction!.href, e)}>
          <span>{hero.primaryAction.label}</span>
          <ArrowRight size={16} />
        </button>
      {/if}
      {#if hero.secondaryAction}
        <button class="ghost" onclick={(e) => handleAction(hero.secondaryAction!.href, e)}>
          {hero.secondaryAction.label}
        </button>
      {/if}
    </div>
  </div>

  {#if heroImageSrc}
    <div class="stage">
      <div class="stage-glow"></div>
      <div class="stage-frame">
        <img src={heroImageSrc} alt={hero.heading} onerror={handleImageError} />
      </div>
    </div>
  {/if}

  {#if hero.stats && hero.stats.length > 0}
    <dl class="stats">
      {#each hero.stats as stat}
        <div>
          <dt>{stat.label}</dt>
          <dd>{stat.value}</dd>
        </div>
      {/each}
    </dl>
  {/if}
</section>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    padding: 9rem 1.5rem 5rem;
    text-align: center;
  }

  .beam {
    position: absolute;
    top: -20%;
    width: 60vw;
    height: 90%;
    filter: blur(90px);
    opacity: 0.55;
    pointer-events: none;
  }

  .beam-a {
    left: -15%;
    background: radial-gradient(closest-side, rgba(99, 102, 241, 0.65), transparent);
  }

  .beam-b {
    right: -15%;
    background: radial-gradient(closest-side, rgba(6, 182, 212, 0.45), transparent);
  }

  .inner {
    position: relative;
    max-width: 62rem;
    margin: 0 auto;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: #a5b4fc;
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    margin-bottom: 2rem;
  }

  .eyebrow i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22d3ee;
    box-shadow: 0 0 12px #22d3ee;
  }

  h1 {
    margin: 0 0 1.75rem;
    font-size: clamp(2.75rem, 8vw, 6.25rem);
    line-height: 0.98;
    font-weight: 700;
    letter-spacing: -0.05em;
    background: linear-gradient(180deg, #ffffff 30%, rgba(255, 255, 255, 0.45));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .sub {
    margin: 0 auto 2.5rem;
    max-width: 40rem;
    font-size: clamp(1rem, 2vw, 1.25rem);
    line-height: 1.65;
    color: #9ca3b4;
  }

  .ctas {
    display: flex;
    justify-content: center;
    gap: 0.875rem;
    flex-wrap: wrap;
  }

  .primary,
  .ghost {
    font: inherit;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 0.9rem 1.6rem;
    border-radius: 999px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .primary {
    border: 0;
    color: #05060a;
    background: linear-gradient(180deg, #ffffff, #c7d2fe);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4), 0 10px 40px rgba(129, 140, 248, 0.45);
  }

  .primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6), 0 16px 56px rgba(129, 140, 248, 0.6);
  }

  .primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ghost {
    color: #e5e7eb;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.14);
  }

  .ghost:hover {
    background: rgba(255, 255, 255, 0.09);
  }

  .stage {
    position: relative;
    max-width: 68rem;
    margin: 5rem auto 0;
    perspective: 1600px;
  }

  .stage-glow {
    position: absolute;
    inset: 10% 8% -8%;
    background: radial-gradient(closest-side, rgba(99, 102, 241, 0.55), transparent);
    filter: blur(60px);
  }

  .stage-frame {
    position: relative;
    transform: rotateX(9deg);
    transform-origin: top center;
    border-radius: 1.25rem;
    padding: 0.5rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.03));
    box-shadow: 0 40px 120px rgba(0, 0, 0, 0.6);
    -webkit-mask-image: linear-gradient(180deg, #000 70%, transparent);
    mask-image: linear-gradient(180deg, #000 70%, transparent);
  }

  .stage-frame img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 0.9rem;
  }

  .stats {
    position: relative;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin: 3rem auto 0;
    max-width: 60rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .stats > div {
    flex: 1 1 10rem;
    padding: 2rem 1rem 0;
  }

  .stats > div + div {
    border-left: 1px solid rgba(255, 255, 255, 0.08);
  }

  dt {
    order: 2;
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #6b7280;
  }

  dd {
    margin: 0 0 0.35rem;
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 2.25rem;
    font-weight: 500;
    color: #f9fafb;
  }

  .stats > div {
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 640px) {
    .hero {
      padding-top: 6rem;
    }

    .stage-frame {
      transform: none;
    }
  }
</style>
