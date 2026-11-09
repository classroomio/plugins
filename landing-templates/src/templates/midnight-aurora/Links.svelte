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
  <section class="obsidian-links">
    <div class="links-container">
      <div class="header">
        <span class="kicker">✦ Ecosystem</span>
        <h2 class="heading">{links.heading}</h2>
        {#if links.description}
          <p class="description">{links.description}</p>
        {/if}
      </div>

      <div class="cards-grid">
        {#each links.cards as card}
          <div class="link-card">
            <div class="card-head">
              <span class="card-dot" aria-hidden="true"></span>
              <h3 class="card-title">{card.title}</h3>
            </div>
            {#if card.description}
              <p class="card-desc">{card.description}</p>
            {/if}
            <button
              type="button"
              class="btn-card-link"
              onclick={(e) => handleAction(card.href, e)}
            >
              <span>Explore Resource</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}

<style>
  .obsidian-links {
    padding: 5rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: #08090d;
  }

  .links-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 2.5rem;
  }

  .kicker {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #22d3ee;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 0.5rem;
  }

  .heading {
    margin: 0;
    font-size: clamp(1.75rem, 3.5vw, 2.375rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    color: #ffffff;
  }

  .description {
    margin: 0.5rem 0 0;
    font-size: 0.9375rem;
    color: #94a3b8;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .link-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease;
  }

  .link-card:hover {
    border-color: rgba(99, 102, 241, 0.4);
    background: rgba(255, 255, 255, 0.04);
    transform: translateY(-2px);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 0.625rem;
  }

  .card-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #818cf8;
    box-shadow: 0 0 6px #818cf8;
  }

  .card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
  }

  .card-desc {
    margin: 0 0 1.25rem;
    font-size: 0.84375rem;
    line-height: 1.5;
    color: #94a3b8;
    flex: 1;
  }

  .btn-card-link {
    margin-top: auto;
    background: transparent;
    border: none;
    padding: 0;
    color: #a5b4fc;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: color 0.15s ease;
  }

  .btn-card-link:hover {
    color: #ffffff;
  }
</style>
