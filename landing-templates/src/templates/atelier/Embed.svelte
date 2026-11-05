<script lang="ts">
  import type { PublicLandingEmbed } from '../../shared/types';
  import { requestNavigation } from '../../shared/bridge';

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
            class="btn-editorial-action"
            onclick={(e) => handleAction(embed.secondaryAction!.href, e)}
          >
            <span>{embed.secondaryAction.label} —</span>
          </button>
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .atelier-embed {
    padding: 5rem 2rem;
    border-top: 1px solid rgba(214, 211, 209, 0.7);
    background: #fbf9f4;
  }

  .embed-container {
    max-width: 960px;
    margin: 0 auto;
    text-align: center;
  }

  .header {
    margin-bottom: 2.5rem;
  }

  .title {
    margin: 0 0 0.75rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(2rem, 3.5vw, 2.75rem);
    font-weight: 400;
    color: #1c1917;
  }

  .description {
    margin: 0 auto;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.0625rem;
    color: #57534e;
    max-width: 580px;
  }

  .frame-box {
    border: 1px solid rgba(214, 211, 209, 0.9);
    border-radius: 4px;
    background: #000000;
    overflow: hidden;
    position: relative;
    aspect-ratio: 16 / 9;
    box-shadow: 0 10px 30px rgba(28, 25, 23, 0.06);
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

  .btn-editorial-action {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.0625rem;
    font-style: italic;
    background: transparent;
    border: none;
    color: #1c1917;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .btn-editorial-action:hover {
    color: #c2410c;
  }
</style>
