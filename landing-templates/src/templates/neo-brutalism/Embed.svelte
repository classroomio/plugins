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
  <section class="neo-embed">
    <div class="embed-container">
      <div class="embed-header">
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
        <div class="action-row">
          <button
            class="neo-btn-action"
            onclick={(e) => handleAction(embed.secondaryAction!.href, e)}
          >
            <span>{embed.secondaryAction.label}</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .neo-embed {
    padding: 4rem 1.5rem;
    border-top: 3px solid #18181b;
    background: #fefdf8;
  }

  .embed-container {
    max-width: 1000px;
    margin: 0 auto;
    text-align: center;
  }

  .embed-header {
    margin-bottom: 2.5rem;
  }

  .title {
    margin: 0 0 0.75rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 800;
    color: #18181b;
  }

  .description {
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.0625rem;
    color: #52525b;
    max-width: 600px;
    margin: 0 auto;
  }

  .frame-box {
    border: 3px solid #18181b;
    border-radius: 12px;
    background: #000000;
    box-shadow: 7px 7px 0px #18181b;
    overflow: hidden;
    position: relative;
    aspect-ratio: 16 / 9;
    width: 100%;
  }

  .embed-iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }

  .action-row {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
  }

  .neo-btn-action {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    padding: 0.75rem 1.5rem;
    background: #fde047;
    border: 2.5px solid #18181b;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #18181b;
    transition: all 0.12s ease;
  }

  .neo-btn-action:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #18181b;
  }
</style>
