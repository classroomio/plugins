<script lang="ts">
  import type { NormalizedLandingViewModel } from '../../shared/types';
  import { requestNavigation, requestAuth } from '../../shared/bridge';
  import Sparkles from '@lucide/svelte/icons/sparkles';

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

<header class="aurora-nav">
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
        <button class="aurora-btn-glow" onclick={handleAuth}>
          <Sparkles size={14} class="glow-icon" />
          <span>{actions.account.label}</span>
        </button>
      {:else if actions.signIn}
        <button class="aurora-btn-glow" onclick={handleAuth}>
          <Sparkles size={14} class="glow-icon" />
          <span>{actions.signIn.label}</span>
        </button>
      {/if}
    </div>
  </div>
</header>

<style>
  .aurora-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(20px);
    background: rgba(9, 10, 15, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: #f8fafc;
  }

  .logo {
    height: 2.25rem;
    width: auto;
    object-fit: contain;
    border-radius: 6px;
  }

  .org-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.1875rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #ffffff;
  }

  .links {
    display: flex;
    align-items: center;
    gap: 1.75rem;
  }

  @media (max-width: 768px) {
    .links {
      display: none;
    }
  }

  .nav-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: #f8fafc;
  }

  .aurora-btn-glow {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #f8fafc;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .aurora-btn-glow:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(34, 211, 238, 0.5);
    box-shadow: 0 0 16px rgba(34, 211, 238, 0.25);
  }

  :global(.glow-icon) {
    color: #22d3ee;
  }
</style>
