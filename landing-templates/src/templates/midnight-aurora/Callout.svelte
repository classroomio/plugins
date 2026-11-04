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
  <section class="aurora-callout">
    <div class="callout-card">
      <div class="ambient-glow"></div>

      <div class="content">
        <h2 class="heading">{callout.heading}</h2>
        {#if callout.description}
          <p class="description">{callout.description}</p>
        {/if}
      </div>

      {#if callout.action}
        <div class="action-wrap">
          <button
            class="btn-cta"
            onclick={(e) => handleAction(callout.action.href, e)}
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
  .aurora-callout {
    padding: 4rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: #090a0f;
  }

  .callout-card {
    position: relative;
    max-width: 1100px;
    margin: 0 auto;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%);
    border: 1px solid rgba(34, 211, 238, 0.25);
    padding: 3.5rem 3rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }

  @media (max-width: 768px) {
    .callout-card {
      padding: 2rem 1.5rem;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .ambient-glow {
    position: absolute;
    width: 300px;
    height: 300px;
    top: -50px;
    right: 10%;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%);
    filter: blur(50px);
    pointer-events: none;
  }

  .content {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 280px;
  }

  .heading {
    margin: 0 0 0.5rem;
    font-size: clamp(1.75rem, 3.5vw, 2.25rem);
    font-weight: 800;
    color: #ffffff;
    line-height: 1.15;
  }

  .description {
    margin: 0;
    font-size: 1.0625rem;
    line-height: 1.5;
    color: #94a3b8;
    max-width: 600px;
  }

  .action-wrap {
    position: relative;
    z-index: 1;
  }

  .btn-cta {
    font-size: 1rem;
    font-weight: 700;
    padding: 0.85rem 1.75rem;
    border-radius: 9999px;
    background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);
    color: #ffffff;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: 0 0 25px rgba(6, 182, 212, 0.4);
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(99, 102, 241, 0.6);
  }
</style>
