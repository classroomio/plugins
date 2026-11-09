<script lang="ts">
  import type { NormalizedLandingViewModel } from '../../shared/types';
  import { requestNavigation, requestAuth } from '../../shared/bridge';

  let {
    organization,
    navigation,
    actions
  }: {
    organization: NormalizedLandingViewModel['organization'];
    navigation: NormalizedLandingViewModel['navigation'];
    actions: NormalizedLandingViewModel['actions'];
  } = $props();

  const half = $derived(Math.ceil(navigation.length / 2));
  const leftLinks = $derived(navigation.slice(0, half));
  const rightLinks = $derived(navigation.slice(half));
  const accountAction = $derived(actions.account ?? actions.signIn);

  function go(href: string, e: MouseEvent) {
    e.preventDefault();
    requestNavigation(href);
  }

  function auth(e: MouseEvent) {
    e.preventDefault();
    requestAuth();
  }
</script>

<header>
  <div class="bar">
    <nav class="side left">
      {#each leftLinks as item}
        <a href={item.href} onclick={(e) => go(item.href, e)}>{item.label}</a>
      {/each}
    </nav>

    <a class="brand" href="/" onclick={(e) => go('/', e)}>
      {#if organization.logoUrl}
        <img src={organization.logoUrl} alt={organization.name} />
      {/if}
      <span>{organization.name}</span>
    </a>

    <nav class="side right">
      {#each rightLinks as item}
        <a href={item.href} onclick={(e) => go(item.href, e)}>{item.label}</a>
      {/each}
      {#if accountAction}
        <button onclick={auth}>{accountAction.label}</button>
      {/if}
    </nav>
  </div>
</header>

<style>
  header {
    background: #f6f3ec;
    border-bottom: 3px double #1a1713;
    position: sticky;
    top: 0;
    z-index: 40;
  }

  .bar {
    max-width: 80rem;
    margin: 0 auto;
    padding: 1.4rem 2rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 2rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: #1a1713;
  }

  .brand img {
    height: 2rem;
    width: auto;
  }

  .brand span {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 2rem;
    font-weight: 500;
    font-style: italic;
    letter-spacing: -0.03em;
  }

  .side {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .right {
    justify-content: flex-end;
  }

  .side a {
    color: #3d372e;
    text-decoration: none;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 600;
  }

  .side a:hover {
    color: #a3340f;
  }

  button {
    font: inherit;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 600;
    color: #f6f3ec;
    background: #1a1713;
    border: 0;
    padding: 0.65rem 1.2rem;
    cursor: pointer;
  }

  button:hover {
    background: #a3340f;
  }

  @media (max-width: 800px) {
    .bar {
      grid-template-columns: 1fr auto;
      padding: 1rem 1.25rem;
    }

    .left {
      display: none;
    }

    .right a {
      display: none;
    }

    .brand {
      order: -1;
    }
  }
</style>
