<script lang="ts">
  import type { NormalizedLandingViewModel } from '../../shared/types';
  import { requestNavigation, requestAuth } from '../../shared/bridge';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

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
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>

    <div class="nav-actions">
      {#if actions.account}
        <button class="btn-pill" onclick={handleAuth}>
          <span>{actions.account.label}</span>
          <ArrowUpRight size={14} />
        </button>
      {:else if actions.signIn}
        <button class="btn-pill" onclick={handleAuth}>
          <span>{actions.signIn.label}</span>
          <ArrowUpRight size={14} />
        </button>
      {/if}
    </div>
  </div>
</header>

<style>
  .atelier-nav {
    border-bottom: 1px solid rgba(17, 17, 20, 0.08);
    background: rgba(248, 248, 249, 0.9);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    position: sticky;
    top: 0;
    z-index: 50;
    transition: border-color 0.2s ease;
  }

  .nav-container {
    max-width: 1240px;
    margin: 0 auto;
    padding: 1.125rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    text-decoration: none;
    color: #111114;
    transition: opacity 0.2s ease;
  }

  .brand:hover {
    opacity: 0.85;
  }

  .logo {
    height: 2.125rem;
    width: auto;
    max-width: 140px;
    object-fit: contain;
    border-radius: 4px;
  }

  .org-name {
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
    font-size: 1.35rem;
    font-weight: 500;
    letter-spacing: -0.02em;
    color: #111114;
  }

  .links {
    display: flex;
    align-items: center;
    gap: 2.25rem;
  }

  .nav-link {
    color: #52525b;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    position: relative;
    padding: 0.25rem 0;
    transition: color 0.15s ease;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background-color: #111114;
    transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .nav-link:hover {
    color: #111114;
  }

  .nav-link:hover::after {
    width: 100%;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn-pill {
    background: #111114;
    color: #ffffff;
    border: none;
    padding: 0.5625rem 1.25rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .btn-pill:hover {
    background: #27272a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(17, 17, 20, 0.12);
  }

  .btn-pill:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    .nav-container {
      padding: 1rem 1.25rem;
    }

    .links {
      display: none;
    }
  }
</style>
