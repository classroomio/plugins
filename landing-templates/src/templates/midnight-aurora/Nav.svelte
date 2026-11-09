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

<header class="obsidian-nav">
  <div class="nav-container">
    <a href="/" class="brand" onclick={(e) => handleNav('/', e)}>
      {#if organization.logoUrl}
        <img src={organization.logoUrl} alt={organization.name} class="logo" />
      {/if}
      <span class="org-name">{organization.name}</span>
    </a>

    {#if navigation && navigation.length > 0}
      <nav class="links">
        {#each navigation as item}
          <a href={item.href} class="nav-link" onclick={(e) => handleNav(item.href, e)}>
            {item.label}
          </a>
        {/each}
      </nav>
    {/if}

    <div class="nav-actions">
      {#if actions.account}
        <button type="button" class="btn-glow" onclick={handleAuth}>
          <Sparkles size={14} class="glow-icon" />
          <span>{actions.account.label}</span>
        </button>
      {:else if actions.signIn}
        <button type="button" class="btn-glow" onclick={handleAuth}>
          <Sparkles size={14} class="glow-icon" />
          <span>{actions.signIn.label}</span>
        </button>
      {/if}
    </div>
  </div>
</header>

<style>
  .obsidian-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    background: rgba(8, 9, 13, 0.82);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.875rem 1.5rem;
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
    height: 2rem;
    width: auto;
    max-width: 140px;
    object-fit: contain;
    border-radius: 6px;
  }

  .org-name {
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: -0.025em;
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
    color: #ffffff;
  }

  .btn-glow {
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 0.45rem 1rem;
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

  .btn-glow:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 0 16px rgba(99, 102, 241, 0.35);
  }

  :global(.glow-icon) {
    color: #818cf8;
  }
</style>
