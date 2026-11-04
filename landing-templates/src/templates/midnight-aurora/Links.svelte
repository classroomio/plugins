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
  <section class="aurora-links">
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
              <span class="card-dot"></span>
              <h3 class="card-title">{card.title}</h3>
            </div>
            <p class="card-desc">{card.description}</p>
            <button
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
  .aurora-links {
    padding: 5rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: #090a0f;
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
    margin: 0 0 0.5rem;
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 800;
    color: #ffffff;
  }

  .description {
    margin: 0;
    font-size: 1rem;
    color: #94a3b8;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .link-card {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease;
  }

  .link-card:hover {
    border-color: rgba(34, 211, 238, 0.35);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.04);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 0.75rem;
  }

  .card-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22d3ee;
    box-shadow: 0 0 6px #22d3ee;
  }

  .card-title {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 700;
    color: #ffffff;
  }

  .card-desc {
    margin: 0 0 1.25rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #94a3b8;
    flex: 1;
  }

  .btn-card-link {
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 0.45rem 0.85rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #f8fafc;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    align-self: flex-start;
    transition: all 0.15s ease;
  }

  .btn-card-link:hover {
    background: rgba(34, 211, 238, 0.15);
    border-color: rgba(34, 211, 238, 0.4);
    color: #ffffff;
  }
</style>
