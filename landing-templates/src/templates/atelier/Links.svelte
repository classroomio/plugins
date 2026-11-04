<script lang="ts">
  import type { PublicLandingLinks } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

  let { links }: { links: PublicLandingLinks } = $props();

  function handleAction(href: string, e: MouseEvent) {
    e.preventDefault();
    requestNavigation(href, 'new-tab');
  }
</script>

{#if links.enabled !== false && links.cards && links.cards.length > 0}
  <section class="atelier-links">
    <div class="links-container">
      <div class="header">
        <span class="kicker">Readings & Archive</span>
        <h2 class="heading">{links.heading}</h2>
        {#if links.description}
          <p class="description">{links.description}</p>
        {/if}
      </div>

      <div class="cards-grid">
        {#each links.cards as card}
          <div class="link-card">
            <div>
              <span class="index-num">§</span>
              <h3 class="card-title">{card.title}</h3>
              <p class="card-desc">{card.description}</p>
            </div>
            <button
              class="btn-card-read"
              onclick={(e) => handleAction(card.href, e)}
            >
              <span>Read Edition —</span>
            </button>
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}

<style>
  .atelier-links {
    padding: 5rem 2rem;
    border-top: 1px solid rgba(214, 211, 209, 0.7);
    background: #fbf9f4;
  }

  .links-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 3rem;
  }

  .kicker {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #c2410c;
    display: block;
    margin-bottom: 0.5rem;
  }

  .heading {
    margin: 0 0 0.5rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(2rem, 3.5vw, 2.75rem);
    font-weight: 400;
    color: #1c1917;
  }

  .description {
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    color: #57534e;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .link-card {
    border: 1px solid rgba(214, 211, 209, 0.7);
    border-radius: 4px;
    background: #ffffff;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease;
  }

  .link-card:hover {
    border-color: #a8a29e;
    box-shadow: 0 8px 24px rgba(28, 25, 23, 0.05);
    transform: translateY(-2px);
  }

  .index-num {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.25rem;
    color: #c2410c;
    display: block;
    margin-bottom: 0.5rem;
  }

  .card-title {
    margin: 0 0 0.75rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.25rem;
    font-weight: 500;
    color: #1c1917;
  }

  .card-desc {
    margin: 0 0 1.5rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #57534e;
  }

  .btn-card-read {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1rem;
    font-style: italic;
    background: transparent;
    border: none;
    color: #1c1917;
    cursor: pointer;
    padding: 0;
    align-self: flex-start;
    transition: color 0.15s ease;
  }

  .btn-card-read:hover {
    color: #c2410c;
  }
</style>
