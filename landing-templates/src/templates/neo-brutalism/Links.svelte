<script lang="ts">
  import type { PublicLandingLinks } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ExternalLink from '@lucide/svelte/icons/external-link';

  let { links }: { links: PublicLandingLinks } = $props();

  function handleAction(href: string, e: MouseEvent) {
    e.preventDefault();
    requestNavigation(href, 'new-tab');
  }
</script>

{#if links.enabled !== false && links.cards && links.cards.length > 0}
  <section class="neo-links">
    <div class="links-container">
      <div class="header">
        <h2 class="heading">{links.heading}</h2>
        {#if links.description}
          <p class="description">{links.description}</p>
        {/if}
      </div>

      <div class="cards-grid">
        {#each links.cards as card}
          <div class="link-card">
            <div class="card-top">
              <span class="icon">✦</span>
              <h3 class="card-title">{card.title}</h3>
            </div>
            <p class="card-desc">{card.description}</p>
            <button
              class="neo-btn-link"
              onclick={(e) => handleAction(card.href, e)}
            >
              <span>Explore Resource</span>
              <ExternalLink size={14} strokeWidth={2.5} />
            </button>
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}

<style>
  .neo-links {
    padding: 4rem 1.5rem;
    border-top: 3px solid #18181b;
    background: #fefdf8;
  }

  .links-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 2.5rem;
  }

  .heading {
    margin: 0 0 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 800;
    color: #18181b;
  }

  .description {
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    color: #52525b;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .link-card {
    border: 3px solid #18181b;
    border-radius: 8px;
    background: #ffffff;
    padding: 1.5rem;
    box-shadow: 4px 4px 0px #18181b;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.12s ease;
  }

  .link-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #18181b;
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 0.75rem;
  }

  .icon {
    font-size: 1.25rem;
    color: #fb7185;
  }

  .card-title {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.125rem;
    font-weight: 700;
    color: #18181b;
  }

  .card-desc {
    margin: 0 0 1.25rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #52525b;
    flex: 1;
  }

  .neo-btn-link {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    padding: 0.5rem 0.875rem;
    background: #a3e635;
    color: #18181b;
    border: 2px solid #18181b;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #18181b;
    transition: all 0.12s ease;
    align-self: flex-start;
  }

  .neo-btn-link:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px #18181b;
  }
</style>
