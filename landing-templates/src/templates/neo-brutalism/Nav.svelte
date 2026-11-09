<script lang="ts">
  import type { NormalizedLandingViewModel } from '../../shared/types';
  import { requestNavigation, requestAuth } from '../../shared/bridge';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

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

<header class="vanguard-nav">
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
        <button class="btn-action" onclick={handleAuth}>
          <span>{actions.account.label}</span>
          <ArrowRight size={14} />
        </button>
      {:else if actions.signIn}
        <button class="btn-action" onclick={handleAuth}>
          <span>{actions.signIn.label}</span>
          <ArrowRight size={14} />
        </button>
      {/if}
    </div>
  </div>
</header>

<style>
  .vanguard-nav {
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    position: sticky;
    top: 0;
    z-index: 50;
    transition: all 0.2s ease;
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
    color: #0f172a;
    transition: opacity 0.2s ease;
  }

  .brand:hover {
    opacity: 0.85;
  }

  .logo {
    height: 2.25rem;
    width: auto;
    max-width: 140px;
    object-fit: contain;
    border-radius: 6px;
  }

  .org-name {
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: #0f172a;
  }

  .links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    color: #64748b;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    padding: 0.25rem 0;
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: #4f46e5;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn-action {
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    color: #ffffff;
    border: none;
    padding: 0.5625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
  }

  .btn-action:hover {
    background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
  }

  .btn-action:active {
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
