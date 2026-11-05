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
  <section class="aurora-embed">
    <div class="embed-container">
      <div class="header">
        <h2 class="title">{embed.title}</h2>
        {#if embed.description}
          <p class="description">{embed.description}</p>
        {/if}
      </div>

      <div class="frame-wrap">
        <div class="frame-glow"></div>
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
  .aurora-embed {
    padding: 5rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: #090a0f;
  }

  .embed-container {
    max-width: 1000px;
    margin: 0 auto;
    text-align: center;
  }

  .header {
    margin-bottom: 2.5rem;
  }

  .title {
    margin: 0 0 0.75rem;
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 800;
    color: #ffffff;
  }

  .description {
    margin: 0 auto;
    font-size: 1.0625rem;
    color: #94a3b8;
    max-width: 600px;
  }

  .frame-wrap {
    position: relative;
    width: 100%;
  }

  .frame-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(6, 182, 212, 0.25) 0%, transparent 70%);
    filter: blur(40px);
    pointer-events: none;
  }

  .frame-surface {
    position: relative;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: #000000;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
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
    font-size: 0.9375rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #f8fafc;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-action:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(34, 211, 238, 0.5);
  }
</style>
