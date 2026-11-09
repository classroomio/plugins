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
  <section class="obsidian-embed">
    <div class="embed-container">
      <div class="header">
        <h2 class="title">{embed.title}</h2>
        {#if embed.description}
          <p class="description">{embed.description}</p>
        {/if}
      </div>

      <div class="frame-wrap">
        <div class="frame-glow" aria-hidden="true"></div>
        <div class="frame-surface">
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
            type="button"
            class="btn-action"
            onclick={(e) => handleAction(embed.secondaryAction!.href, e)}
          >
            <span>{embed.secondaryAction.label}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .obsidian-embed {
    padding: 5rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: #08090d;
  }

  .embed-container {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .title {
    margin: 0 0 0.5rem;
    font-size: clamp(1.75rem, 3.5vw, 2.375rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    color: #ffffff;
  }

  .description {
    margin: 0;
    font-size: 1rem;
    color: #94a3b8;
  }

  .frame-wrap {
    position: relative;
    width: 100%;
    border-radius: 16px;
  }

  .frame-glow {
    position: absolute;
    inset: -2px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(6, 182, 212, 0.35));
    filter: blur(12px);
    opacity: 0.5;
    pointer-events: none;
  }

  .frame-surface {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 16px;
    overflow: hidden;
    background: #0d0f17;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .embed-iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }

  .action-wrap {
    margin-top: 2rem;
  }

  .btn-action {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.65rem 1.25rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-action:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(99, 102, 241, 0.45);
  }
</style>
