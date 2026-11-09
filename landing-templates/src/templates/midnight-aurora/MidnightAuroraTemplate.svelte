<script lang="ts">
  import type { NormalizedLandingViewModel } from '../../shared/types';
  import Nav from './Nav.svelte';
  import Hero from './Hero.svelte';
  import CoursesGrid from './CoursesGrid.svelte';
  import Embed from './Embed.svelte';
  import Callout from './Callout.svelte';
  import Links from './Links.svelte';
  import Footer from './Footer.svelte';

  let { viewModel }: { viewModel: NormalizedLandingViewModel } = $props();
</script>

<div class="obsidian-theme">
  <!-- Subtle micro-grid background pattern -->
  <div class="bg-grid-overlay" aria-hidden="true"></div>

  <Nav
    organization={viewModel.organization}
    navigation={viewModel.navigation}
    actions={viewModel.actions}
  />

  <main>
    <Hero hero={viewModel.hero} />

    <CoursesGrid
      courses={viewModel.courses}
      coursesLoaded={viewModel.coursesLoaded}
      hasMoreCourses={viewModel.hasMoreCourses}
      labels={viewModel.labels}
    />

    {#if viewModel.embed}
      <Embed embed={viewModel.embed} />
    {/if}

    {#if viewModel.callout}
      <Callout callout={viewModel.callout} />
    {/if}

    {#if viewModel.links}
      <Links links={viewModel.links} />
    {/if}
  </main>

  <Footer
    organization={viewModel.organization}
    footer={viewModel.footer}
    locale={viewModel.locale}
  />
</div>

<style>
  .obsidian-theme {
    position: relative;
    background-color: #08090d;
    color: #f8fafc;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  .bg-grid-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: radial-gradient(ellipse at 50% 0%, rgba(0, 0, 0, 0.7) 0%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse at 50% 0%, rgba(0, 0, 0, 0.7) 0%, transparent 80%);
    z-index: 0;
  }

  main {
    position: relative;
    z-index: 1;
  }
</style>
