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

<header class="neo-nav">
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
        <button class="neo-btn neo-btn-sm neo-btn-yellow" onclick={handleAuth}>
          <span>{actions.account.label}</span>
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </button>
      {:else if actions.signIn}
        <button class="neo-btn neo-btn-sm neo-btn-yellow" onclick={handleAuth}>
          <span>{actions.signIn.label}</span>
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </button>
      {/if}
    </div>
  </div>
</header>

<style>
  .neo-nav {
    border-bottom: 3px solid #18181b;
    background: #fefdf8;
    position: sticky;
    top: 0;
    z-index: 50;
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
    color: #18181b;
  }

  .logo {
    height: 2.25rem;
    width: auto;
    object-fit: contain;
    border: 2px solid #18181b;
    border-radius: 4px;
    background: #ffffff;
  }

  .org-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #18181b;
  }

  .links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .links {
      display: none;
    }
  }

  .nav-link {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #18181b;
    text-decoration: none;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background 0.15s ease;
  }

  .nav-link:hover {
    background: #fde047;
  }

  .neo-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    border: 2.5px solid #18181b;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #18181b;
    transition: all 0.12s ease;
  }

  .neo-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0px #18181b;
  }

  .neo-btn-sm {
    padding: 0.4rem 0.85rem;
    font-size: 0.875rem;
  }

  .neo-btn-yellow {
    background: #fde047;
    color: #18181b;
  }

  .neo-btn-yellow:hover {
    background: #fef08a;
  }
</style>
