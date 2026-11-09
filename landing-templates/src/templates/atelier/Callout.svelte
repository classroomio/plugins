<script lang="ts">
  import type { PublicLandingCallout } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  let { callout }: { callout: PublicLandingCallout } = $props();

  function handleAction(href: string, e: MouseEvent) {
    e.preventDefault();
    requestNavigation(href);
  }
</script>

{#if callout.enabled !== false}
  <section class="atelier-callout">
    <div class="callout-card">
      <div class="callout-inner">
        <h2 class="heading">{callout.heading}</h2>

        {#if callout.description}
          <p class="description">{callout.description}</p>
        {/if}

        {#if callout.action}
          <div class="action-wrap">
            <button
              class="btn-cta"
              onclick={(e) => handleAction(callout.action.href, e)}
            >
              <span>{callout.action.label}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        {/if}
      </div>
    </div>
  </section>
{/if}

<style>
  .atelier-callout {
    padding: 6rem 2rem;
    background: #f6f3ec;
  }

  .callout-card {
    max-width: 980px;
    margin: 0 auto;
    background: #ffffff;
    border: 1px solid rgba(26, 23, 19, 0.08);
    border-radius: 0;
    padding: 4.5rem 2.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  }

  .callout-inner {
    max-width: 680px;
    margin: 0 auto;
    text-align: center;
  }

  .heading {
    margin: 0 0 1rem;
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
    font-size: clamp(2.25rem, 4.5vw, 3.25rem);
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #1a1713;
  }

  .description {
    margin: 0 auto 2.5rem;
    font-size: 1.125rem;
    line-height: 1.7;
    color: #52525b;
    max-width: 540px;
  }

  .action-wrap {
    display: flex;
    justify-content: center;
  }

  .btn-cta {
    background: #1a1713;
    color: #ffffff;
    border: none;
    padding: 0.875rem 2rem;
    border-radius: 0;
    font-size: 0.9375rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .btn-cta:hover {
    background: #a3340f;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(26, 23, 19, 0.15);
  }

  @media (max-width: 640px) {
    .atelier-callout {
      padding: 4rem 1.25rem;
    }

    .callout-card {
      padding: 3rem 1.5rem;
    }
  }
</style>
