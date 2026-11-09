<script lang="ts">
  import type { NormalizedLandingViewModel } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  let { hero }: { hero: NormalizedLandingViewModel['hero'] } = $props();

  let failedImageSrc = $state<string | null>(null);
  const heroImageSrc = $derived(hero.image && hero.image !== failedImageSrc ? hero.image : undefined);

  function go(href: string, e: MouseEvent) {
    e.preventDefault();
    requestNavigation(href);
  }

  function imageFailed() {
    if (hero.image) failedImageSrc = hero.image;
  }
</script>

<section>
  <div class="blob b1"></div>
  <div class="blob b2"></div>

  <div class="grid" class:solo={!heroImageSrc}>
    <div class="copy">
      {#if hero.eyebrow}<span class="eyebrow">{hero.eyebrow}</span>{/if}
      <h1>{hero.heading}</h1>
      {#if hero.subheading}<p>{hero.subheading}</p>{/if}

      <div class="ctas">
        {#if hero.primaryAction}
          <button class="primary" disabled={hero.primaryAction.disabled} onclick={(e) => go(hero.primaryAction!.href, e)}>
            {hero.primaryAction.label}<ArrowRight size={18} />
          </button>
        {/if}
        {#if hero.secondaryAction}
          <button class="secondary" onclick={(e) => go(hero.secondaryAction!.href, e)}>
            {hero.secondaryAction.label}
          </button>
        {/if}
      </div>
    </div>

    {#if heroImageSrc}
      <div class="visual">
        <div class="tilt">
          <img src={heroImageSrc} alt={hero.heading} onerror={imageFailed} />
        </div>
        {#if hero.stats && hero.stats[0]}
          <div class="chip c1">
            <b>{hero.stats[0].value}</b>
            <span>{hero.stats[0].label}</span>
          </div>
        {/if}
        {#if hero.stats && hero.stats[1]}
          <div class="chip c2">
            <b>{hero.stats[1].value}</b>
            <span>{hero.stats[1].label}</span>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if hero.stats && hero.stats.length > 0 && !heroImageSrc}
    <div class="strip">
      {#each hero.stats as stat}
        <div><b>{stat.value}</b><span>{stat.label}</span></div>
      {/each}
    </div>
  {/if}
</section>

<style>
  section {
    position: relative;
    overflow: hidden;
    margin-top: -4.6rem;
    padding: 10rem 1.5rem 9rem;
    background: #0a0e22;
    color: #fff;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
  }

  .b1 {
    width: 36rem;
    height: 36rem;
    top: -10rem;
    left: -8rem;
    background: rgba(79, 70, 229, 0.7);
  }

  .b2 {
    width: 30rem;
    height: 30rem;
    bottom: -12rem;
    right: -6rem;
    background: rgba(236, 72, 153, 0.45);
  }

  .grid {
    position: relative;
    max-width: 76rem;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    gap: 4rem;
    align-items: center;
  }

  .grid.solo {
    grid-template-columns: minmax(0, 52rem);
  }

  .eyebrow {
    display: inline-block;
    padding: 0.4rem 0.9rem;
    margin-bottom: 1.5rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 700;
    color: #fbcfe8;
    background: rgba(236, 72, 153, 0.16);
    border: 1px solid rgba(236, 72, 153, 0.35);
  }

  h1 {
    margin: 0 0 1.5rem;
    font-size: clamp(2.6rem, 6vw, 5rem);
    line-height: 1.02;
    font-weight: 800;
    letter-spacing: -0.045em;
  }

  p {
    margin: 0 0 2.25rem;
    max-width: 34rem;
    font-size: 1.15rem;
    line-height: 1.65;
    color: #b6bcd6;
  }

  .ctas {
    display: flex;
    gap: 0.9rem;
    flex-wrap: wrap;
  }

  .primary,
  .secondary {
    font: inherit;
    font-weight: 700;
    padding: 0.95rem 1.6rem;
    border-radius: 0.9rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .primary {
    border: 0;
    color: #fff;
    background: linear-gradient(135deg, #6366f1, #ec4899);
    box-shadow: 0 12px 40px rgba(236, 72, 153, 0.35);
  }

  .primary:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .secondary:hover {
    background: rgba(255, 255, 255, 0.14);
  }

  .visual {
    position: relative;
  }

  .tilt {
    transform: rotate(2.5deg);
    border-radius: 1.5rem;
    padding: 0.6rem;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
  }

  .tilt img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: 1.1rem;
  }

  .chip {
    position: absolute;
    display: flex;
    flex-direction: column;
    padding: 0.9rem 1.2rem;
    border-radius: 1rem;
    background: #fff;
    color: #0b1020;
    box-shadow: 0 16px 50px rgba(0, 0, 0, 0.35);
  }

  .chip b {
    font-size: 1.6rem;
    letter-spacing: -0.03em;
  }

  .chip span {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6a7391;
  }

  .c1 {
    left: -1.5rem;
    bottom: 2.5rem;
  }

  .c2 {
    right: -1rem;
    top: 2rem;
  }

  .strip {
    position: relative;
    max-width: 52rem;
    margin: 4rem auto 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 1rem;
  }

  .strip div {
    display: flex;
    flex-direction: column;
    padding: 1.1rem 1.3rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.14);
  }

  .strip b {
    font-size: 1.8rem;
    letter-spacing: -0.03em;
  }

  .strip span {
    font-size: 0.78rem;
    color: #aab1cf;
  }

  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }

    .c1 {
      left: 0.5rem;
    }

    .c2 {
      right: 0.5rem;
    }

    section {
      padding-bottom: 6rem;
    }
  }
</style>
