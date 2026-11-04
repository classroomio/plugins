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
  <section class="neo-callout">
    <div class="callout-box">
      <div class="callout-content">
        <h2 class="heading">{callout.heading}</h2>
        {#if callout.description}
          <p class="description">{callout.description}</p>
        {/if}
      </div>

      {#if callout.action}
        <div class="callout-action">
          <button
            class="neo-btn-cta"
            onclick={(e) => handleAction(callout.action.href, e)}
          >
            <span>{callout.action.label}</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .neo-callout {
    padding: 3.5rem 1.5rem;
    border-top: 3px solid #18181b;
    background: #fbf9f1;
  }

  .callout-box {
    max-width: 1100px;
    margin: 0 auto;
    border: 3.5px solid #18181b;
    border-radius: 12px;
    background: #fb7185;
    padding: 3rem 2.5rem;
    box-shadow: 7px 7px 0px #18181b;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .callout-box {
      padding: 2rem 1.5rem;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .callout-content {
    flex: 1;
    min-width: 280px;
  }

  .heading {
    margin: 0 0 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 800;
    color: #18181b;
    line-height: 1.15;
  }

  .description {
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.0625rem;
    line-height: 1.5;
    color: #18181b;
    font-weight: 500;
    max-width: 600px;
  }

  .neo-btn-cta {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.0625rem;
    font-weight: 800;
    padding: 0.85rem 1.75rem;
    background: #ffffff;
    color: #18181b;
    border: 3px solid #18181b;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: 5px 5px 0px #18181b;
    transition: all 0.12s ease;
    white-space: nowrap;
  }

  .neo-btn-cta:active {
    transform: translate(3px, 3px);
    box-shadow: 2px 2px 0px #18181b;
  }

  .neo-btn-cta:hover {
    background: #fde047;
  }
</style>
