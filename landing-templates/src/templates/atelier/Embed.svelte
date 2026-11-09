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
  <section class="atelier-embed">
    <div class="embed-container">
      <div class="header">
        <h2 class="title">{embed.title}</h2>
        {#if embed.description}
          <p class="description">{embed.description}</p>
        {/if}
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
  .atelier-embed {
    padding: 5.5rem 2rem;
    border-top: 1px solid rgba(17, 17, 20, 0.08);
    background: #f8f8f9;
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
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
    font-size: clamp(2rem, 3.5vw, 2.75rem);
    font-weight: 400;
    letter-spacing: -0.03em;
    color: #111114;
  }

  .description {
    margin: 0 auto;
    font-size: 1.0625rem;
    color: #52525b;
    max-width: 580px;
    line-height: 1.6;
  }

  .frame-box {
    border: 1px solid rgba(17, 17, 20, 0.1);
    border-radius: 12px;
    background: #000000;
    overflow: hidden;
    position: relative;
    aspect-ratio: 16 / 9;
    box-shadow: 0 20px 48px -12px rgba(17, 17, 20, 0.12);
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
    background: transparent;
    color: #111114;
    border: 1px solid rgba(17, 17, 20, 0.2);
    padding: 0.625rem 1.25rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-action:hover {
    border-color: #111114;
    background: rgba(17, 17, 20, 0.03);
  }

  @media (max-width: 640px) {
    .atelier-embed {
      padding: 3.5rem 1.25rem;
    }
  }
</style>
