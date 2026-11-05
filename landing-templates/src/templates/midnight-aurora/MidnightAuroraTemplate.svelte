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

<div class="midnight-aurora-theme">
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
  .midnight-aurora-theme {
    background-color: #090a0f;
    color: #f8fafc;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
</style>
