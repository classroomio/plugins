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
    <a class="brand" href="/" onclick={(e) => go('/', e)}>
      {#if organization.logoUrl}
        <img src={organization.logoUrl} alt={organization.name} />
      {:else}
        <span class="mark">{organization.name.slice(0, 1)}</span>
      {/if}
      <span class="name">{organization.name}</span>
    </a>

    <nav>
      {#each navigation as item}
        <a href={item.href} onclick={(e) => go(item.href, e)}>{item.label}</a>
      {/each}
    </nav>

    {#if accountAction}
      <button onclick={auth}>{accountAction.label}</button>
    {/if}
  </div>
</header>

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 40;
    padding: 0.9rem 1rem 0;
    background: linear-gradient(#0a0e22, rgba(10, 14, 34, 0));
  }

  .bar {
    max-width: 76rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.6rem 0.75rem 0.6rem 1.1rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(14px);
    box-shadow: 0 8px 30px rgba(5, 8, 30, 0.35);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    text-decoration: none;
    color: #0b1020;
  }

  .brand img {
    height: 1.9rem;
    width: auto;
  }

  .mark {
    display: grid;
    place-items: center;
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 0.55rem;
    color: #fff;
    font-weight: 800;
    background: linear-gradient(135deg, #4f46e5, #ec4899);
  }

  .name {
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  nav {
    margin-left: auto;
    display: flex;
    gap: 0.25rem;
  }

  nav a {
    padding: 0.5rem 0.85rem;
    border-radius: 0.6rem;
    color: #475069;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
  }

  nav a:hover {
    background: #eef0fb;
    color: #4f46e5;
  }

  button {
    font: inherit;
    font-weight: 700;
    font-size: 0.9rem;
    color: #fff;
    border: 0;
    padding: 0.6rem 1.1rem;
    border-radius: 0.7rem;
    background: #0b1020;
    cursor: pointer;
  }

  button:hover {
    background: #4f46e5;
  }

  @media (max-width: 760px) {
    nav {
      display: none;
    }

    button {
      margin-left: auto;
    }
  }
</style>
