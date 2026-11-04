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
    <div class="callout-inner">
      <span class="decor-quote">“</span>
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
  </section>
{/if}

<style>
  .atelier-callout {
    padding: 6rem 2rem;
    border-top: 1px solid rgba(214, 211, 209, 0.7);
    background: #f7f5ef;
  }

  .callout-inner {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    position: relative;
  }

  .decor-quote {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 5rem;
    line-height: 1;
    color: #c2410c;
    opacity: 0.6;
    display: block;
    margin-bottom: -1.5rem;
  }

  .heading {
    margin: 0 0 1rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 400;
    line-height: 1.15;
    color: #1c1917;
  }

  .description {
    margin: 0 auto 2.5rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.125rem;
    line-height: 1.7;
    color: #57534e;
    max-width: 580px;
  }

  .action-wrap {
    display: flex;
    justify-content: center;
  }

  .btn-cta {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    padding: 0.85rem 1.75rem;
    border-radius: 4px;
    background: #1c1917;
    color: #fbf9f4;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .btn-cta:hover {
    background: #292524;
  }
</style>
