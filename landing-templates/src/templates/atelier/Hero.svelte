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
  <div class="wrap">
    {#if hero.eyebrow}
      <p class="eyebrow"><span></span>{hero.eyebrow}</p>
    {/if}

    <h1>{hero.heading}</h1>

    <div class="spread" class:solo={!heroImageSrc}>
      <aside>
        {#if hero.subheading}
          <p class="lede">{hero.subheading}</p>
        {/if}

        <div class="ctas">
          {#if hero.primaryAction}
            <button class="solid" disabled={hero.primaryAction.disabled} onclick={(e) => go(hero.primaryAction!.href, e)}>
              {hero.primaryAction.label}<ArrowRight size={16} />
            </button>
          {/if}
          {#if hero.secondaryAction}
            <button class="link" onclick={(e) => go(hero.secondaryAction!.href, e)}>
              {hero.secondaryAction.label}
            </button>
          {/if}
        </div>

        {#if hero.stats && hero.stats.length > 0}
          <dl>
            {#each hero.stats as stat}
              <div>
                <dd>{stat.value}</dd>
                <dt>{stat.label}</dt>
              </div>
            {/each}
          </dl>
        {/if}
      </aside>

      {#if heroImageSrc}
        <figure>
          <img src={heroImageSrc} alt={hero.heading} onerror={imageFailed} />
        </figure>
      {/if}
    </div>
  </div>
</section>

<style>
  section {
    background: #f6f3ec;
    color: #1a1713;
    padding: 4rem 2rem 5rem;
  }

  .wrap {
    max-width: 80rem;
    margin: 0 auto;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0 0 2rem;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-weight: 600;
    color: #a3340f;
  }

  .eyebrow span {
    width: 3rem;
    height: 1px;
    background: #a3340f;
  }

  h1 {
    margin: 0 0 4rem;
    font-family: 'Newsreader', Georgia, serif;
    font-weight: 400;
    font-size: clamp(3.25rem, 10vw, 9rem);
    line-height: 0.92;
    letter-spacing: -0.05em;
  }

  .spread {
    display: grid;
    grid-template-columns: 4fr 8fr;
    gap: 4rem;
    border-top: 1px solid #1a1713;
    padding-top: 2.5rem;
    align-items: start;
  }

  .spread.solo {
    grid-template-columns: minmax(0, 40rem);
  }

  .lede {
    margin: 0 0 2rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.4rem;
    line-height: 1.5;
    color: #3d372e;
  }

  .ctas {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .solid {
    font: inherit;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 600;
    background: #1a1713;
    color: #f6f3ec;
    border: 0;
    padding: 1rem 1.6rem;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: background 0.2s ease, gap 0.2s ease;
  }

  .solid:hover:not(:disabled) {
    background: #a3340f;
    gap: 1.1rem;
  }

  .solid:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .link {
    font: inherit;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 600;
    background: none;
    border: 0;
    border-bottom: 1px solid #1a1713;
    padding: 0 0 0.25rem;
    color: #1a1713;
    cursor: pointer;
  }

  dl {
    margin: 3rem 0 0;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(26, 23, 19, 0.2);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
    gap: 1.5rem;
  }

  dd {
    margin: 0;
    font-family: 'Newsreader', Georgia, serif;
    font-size: 2.75rem;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  dt {
    margin-top: 0.4rem;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #6b6355;
  }

  figure {
    margin: 0;
  }

  img {
    display: block;
    width: 100%;
    aspect-ratio: 3 / 2;
    object-fit: cover;
    filter: saturate(0.9) contrast(1.02);
  }

  @media (max-width: 860px) {
    .spread {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }

    h1 {
      margin-bottom: 2.5rem;
    }
  }
</style>
