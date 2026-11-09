<script lang="ts">
  import type { PublicLandingCallout } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import Sparkles from '@lucide/svelte/icons/sparkles';

  let { callout }: { callout: PublicLandingCallout } = $props();

  function handleAction(href: string, e: MouseEvent) {
    e.preventDefault();
    requestNavigation(href);
  }
</script>

{#if callout.enabled !== false}
  <section class="obsidian-callout">
    <div class="callout-card">
      <div class="ambient-glow" aria-hidden="true"></div>

      <div class="content">
        <h2 class="heading">{callout.heading}</h2>
        {#if callout.description}
          <p class="description">{callout.description}</p>
        {/if}
      </div>

      {#if callout.action}
        <div class="action-wrap">
          <button
            type="button"
            class="btn-cta"
            onclick={(e) => handleAction(callout.action!.href, e)}
          >
            <Sparkles size={16} />
            <span>{callout.action.label}</span>
          </button>
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .obsidian-callout {
    padding: 4.5rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: #08090d;
  }

  .callout-card {
    position: relative;
    max-width: 1100px;
    margin: 0 auto;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%);
    border: 1px solid rgba(99, 102, 241, 0.28);
    padding: 3rem 2.5rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  @media (max-width: 768px) {
    .callout-card {
      flex-direction: column;
      align-items: flex-start;
      padding: 2.25rem 1.75rem;
    }
  }

  .ambient-glow {
    position: absolute;
    width: 350px;
    height: 350px;
    top: -100px;
    right: -50px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
    pointer-events: none;
    border-radius: 50%;
  }

  .content {
    position: relative;
    z-index: 1;
    max-width: 650px;
  }

  .heading {
    margin: 0 0 0.5rem;
    font-size: clamp(1.5rem, 3vw, 2.125rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    color: #ffffff;
  }

  .description {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.55;
    color: #94a3b8;
  }

  .action-wrap {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }

  .btn-cta {
    font-size: 0.9375rem;
    font-weight: 700;
    padding: 0.8125rem 1.75rem;
    border-radius: 9999px;
    background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);
    color: #ffffff;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    transition: all 0.2s ease;
  }

  .btn-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px rgba(99, 102, 241, 0.6);
  }
</style>
