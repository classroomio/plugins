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
  <section class="vanguard-callout">
    <div class="callout-card">
      <div class="glow-bg"></div>
      <div class="callout-inner">
        <h2 class="heading">{callout.heading}</h2>

        {#if callout.description}
          <p class="description">{callout.description}</p>
        {/if}

        {#if callout.action}
          <div class="action-wrap">
            <button
              class="btn-cta"
              onclick={(e) => handleAction(callout.action!.href, e)}
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
  .vanguard-callout {
    padding: 6rem 2rem;
    background: #ffffff;
  }

  .callout-card {
    max-width: 1040px;
    margin: 0 auto;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    border-radius: 20px;
    padding: 5rem 2.5rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 48px -12px rgba(15, 23, 42, 0.25);
  }

  .glow-bg {
    position: absolute;
    top: -50%;
    right: -20%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
    pointer-events: none;
  }

  .callout-inner {
    max-width: 680px;
    margin: 0 auto;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .heading {
    margin: 0 0 1rem;
    font-size: clamp(2.25rem, 4.5vw, 3.25rem);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #ffffff;
  }

  .description {
    margin: 0 auto 2.5rem;
    font-size: 1.125rem;
    line-height: 1.65;
    color: #cbd5e1;
    max-width: 540px;
  }

  .action-wrap {
    display: flex;
    justify-content: center;
  }

  .btn-cta {
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    color: #ffffff;
    border: none;
    padding: 0.875rem 2rem;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
  }

  .btn-cta:hover {
    background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(79, 70, 229, 0.5);
  }

  @media (max-width: 640px) {
    .vanguard-callout {
      padding: 4rem 1.25rem;
    }

    .callout-card {
      padding: 3.5rem 1.5rem;
    }
  }
</style>
