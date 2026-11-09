<script lang="ts">
  import type { PublicLandingEmbed } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  let { embed }: { embed: PublicLandingEmbed } = $props();

  function handleAction(href: string, e: MouseEvent) {
    e.preventDefault();
    requestNavigation(href);
  }
</script>

{#if embed.enabled !== false}
  <section class="vanguard-embed">
    <div class="embed-container">
      <div class="header">
        <h2 class="title">{embed.title}</h2>
        {#if embed.description}
          <p class="description">{embed.description}</p>
        {/if}
      </div>

      <div class="browser-board">
        <div class="browser-header">
          <div class="traffic-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="browser-title">{embed.title}</div>
        </div>

        <div class="frame-box">
          <iframe
            src={embed.url}
            title={embed.title}
            class="embed-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>

      {#if embed.secondaryAction}
        <div class="action-wrap">
          <button
            class="btn-action"
            onclick={(e) => handleAction(embed.secondaryAction!.href, e)}
          >
            <span>{embed.secondaryAction.label}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .vanguard-embed {
    padding: 5.5rem 2rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .embed-container {
    max-width: 1040px;
    margin: 0 auto;
    text-align: center;
  }

  .header {
    margin-bottom: 2.75rem;
  }

  .title {
    margin: 0 0 0.75rem;
    font-size: clamp(2rem, 3.5vw, 2.75rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #0f172a;
  }

  .description {
    margin: 0 auto;
    font-size: 1.0625rem;
    color: #64748b;
    max-width: 580px;
    line-height: 1.6;
  }

  .browser-board {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 20px 48px -12px rgba(15, 23, 42, 0.12);
  }

  .browser-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    position: relative;
  }

  .traffic-dots {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }

  .dot.red {
    background: #ef4444;
  }

  .dot.yellow {
    background: #f59e0b;
  }

  .dot.green {
    background: #10b981;
  }

  .browser-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    font-weight: 500;
    color: #64748b;
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .frame-box {
    position: relative;
    aspect-ratio: 16 / 9;
    background: #000000;
  }

  .embed-iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }

  .action-wrap {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
  }

  .btn-action {
    background: #ffffff;
    color: #0f172a;
    border: 1px solid #e2e8f0;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }

  .btn-action:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  @media (max-width: 640px) {
    .vanguard-embed {
      padding: 3.5rem 1.25rem;
    }
  }
</style>
