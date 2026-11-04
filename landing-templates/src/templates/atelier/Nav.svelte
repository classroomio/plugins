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

  function handleNav(href: string, e: MouseEvent) {
    e.preventDefault();
    requestNavigation(href);
  }

  function handleAuth(e: MouseEvent) {
    e.preventDefault();
    requestAuth();
  }
</script>

<header class="atelier-nav">
  <div class="nav-container">
    <a href="/" class="brand" onclick={(e) => handleNav('/', e)}>
      {#if organization.logoUrl}
        <img src={organization.logoUrl} alt={organization.name} class="logo" />
      {/if}
      <span class="org-name">{organization.name}</span>
    </a>

    <nav class="links">
      {#each navigation as item}
        <a href={item.href} class="nav-link" onclick={(e) => handleNav(item.href, e)}>
          {item.label}
        </a>
      {/each}
    </nav>

    <div class="nav-actions">
      {#if actions.account}
        <button class="btn-editorial" onclick={handleAuth}>
          <span>{actions.account.label} —</span>
        </button>
      {:else if actions.signIn}
        <button class="btn-editorial" onclick={handleAuth}>
          <span>{actions.signIn.label} —</span>
        </button>
      {/if}
    </div>
  </div>
</header>

<style>
  .atelier-nav {
    border-bottom: 1px solid rgba(214, 211, 209, 0.7);
    background: #fbf9f4;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.25rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: #1c1917;
  }

  .logo {
    height: 2rem;
    width: auto;
    object-fit: contain;
    border-radius: 2px;
  }

  .org-name {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.35rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: #1c1917;
  }

  .links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  @media (max-width: 768px) {
    .links {
      display: none;
    }
  }

  .nav-link {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: #57534e;
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: #c2410c;
  }

  .btn-editorial {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1rem;
    font-style: italic;
    font-weight: 500;
    background: transparent;
    border: none;
    color: #1c1917;
    cursor: pointer;
    padding: 0.35rem 0.5rem;
    transition: color 0.15s ease;
  }

  .btn-editorial:hover {
    color: #c2410c;
  }
</style>
