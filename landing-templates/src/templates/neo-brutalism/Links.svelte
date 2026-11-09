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
  <section class="vanguard-links">
    <div class="links-container">
      <div class="header">
        <div class="section-badge">Resources</div>
        <h2 class="heading">{links.heading}</h2>
        {#if links.description}
          <p class="description">{links.description}</p>
        {/if}
      </div>

      <div class="cards-grid">
        {#each links.cards as card}
          <div class="link-card">
            <div class="card-content">
              <span class="card-icon">✦</span>
              <h3 class="card-title">{card.title}</h3>
              {#if card.description}
                <p class="card-desc">{card.description}</p>
              {/if}
            </div>
            <button
              class="btn-card-read"
              onclick={(e) => handleAction(card.href, e)}
            >
              <span>Explore</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}

<style>
  .vanguard-links {
    padding: 5.5rem 2rem;
    border-top: 1px solid #e2e8f0;
    background: #ffffff;
  }

  .links-container {
    max-width: 1240px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 3rem;
  }

  .section-badge {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #4f46e5;
    margin-bottom: 0.5rem;
  }

  .heading {
    margin: 0 0 0.5rem;
    font-size: clamp(2rem, 3.5vw, 2.75rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #0f172a;
  }

  .description {
    margin: 0;
    font-size: 1.0625rem;
    color: #64748b;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.75rem;
  }

  .link-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #ffffff;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  }

  .link-card:hover {
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.08);
  }

  .card-icon {
    font-size: 1.25rem;
    color: #4f46e5;
    display: block;
    margin-bottom: 1rem;
  }

  .card-title {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #0f172a;
  }

  .card-desc {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #64748b;
  }

  .btn-card-read {
    margin-top: 1.5rem;
    align-self: flex-start;
    background: transparent;
    color: #4f46e5;
    border: none;
    padding: 0;
    font-size: 0.875rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    transition: gap 0.15s ease;
  }

  .btn-card-read:hover {
    gap: 0.5rem;
  }

  @media (max-width: 640px) {
    .vanguard-links {
      padding: 3.5rem 1.25rem;
    }
  }
</style>
