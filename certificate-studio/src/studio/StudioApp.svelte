<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createClassroomIOClient, type ClassroomIOClient } from '@classroomio/plugin-sdk';
  import { StudioApiClient } from '../shared/api';
  import type { OrganizationProfile } from '../shared/types';
  import CertificateTemplatesPage from './components/CertificateTemplatesPage.svelte';
  import CertificateStudioBuilder from './components/CertificateStudioBuilder.svelte';

  const client: ClassroomIOClient = createClassroomIOClient();
  const api = new StudioApiClient(client);

  let currentHash = $state(typeof window !== 'undefined' ? window.location.hash || '#/' : '#/');
  let profile = $state<OrganizationProfile | null>(null);

  function handleHashChange() {
    currentHash = window.location.hash || '#/';
  }

  onMount(async () => {
    window.addEventListener('hashchange', handleHashChange);

    try {
      const currentTheme = await client.theme.get();
      if (currentTheme?.colorScheme) {
        document.documentElement.setAttribute('data-theme', currentTheme.colorScheme);
      }
    } catch {}

    try {
      const ctx = await client.context.get();
      if (ctx?.organization) {
        profile = {
          id: ctx.organization.id,
          name: ctx.organization.name,
          slug: "",
          avatarUrl: ctx.organization.avatarUrl ?? null
        };
      }
    } catch (err: unknown) {
      console.warn('Could not fetch org profile from bridge context:', err);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('hashchange', handleHashChange);
    }
  });

  interface RouteMatch {
    view: 'list' | 'editor';
    templateId?: string | null;
    starterId?: string | null;
  }

  const routeMatch: RouteMatch = $derived.by(() => {
    const raw = currentHash.replace(/^#\/?/, '');
    const [pathPart, queryPart] = raw.split('?');
    const params = new URLSearchParams(queryPart || '');

    if (pathPart.startsWith('editor')) {
      const segments = pathPart.split('/');
      const templateId = segments[1] && segments[1] !== 'new' ? segments[1] : null;
      const starterId = params.get('starter');
      return { view: 'editor', templateId, starterId };
    }

    return { view: 'list' };
  });
</script>

<div class="studio-app">
  {#if routeMatch.view === 'list'}
    <CertificateTemplatesPage {client} {api} {profile} />
  {:else if routeMatch.view === 'editor'}
    <CertificateStudioBuilder
      templateId={routeMatch.templateId}
      starterId={routeMatch.starterId}
      {client}
      {api}
      {profile}
    />
  {/if}
</div>

<style>
  .studio-app {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    margin: 0;
    padding: 0;
    font-family: var(--cio-font-sans, 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
  }
</style>
