<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    NormalizedLandingViewModel,
    PublicLandingCourse,
    PublicLandingLinkItem,
    PublicLandingResourceCard,
    PublicLandingSocialLink
  } from '../shared/types';
  import type { PublicLandingPageViewModel } from '@classroomio/plugin-sdk';
  import { initLandingBridge, sendResize } from '../shared/bridge';
  import NeoBrutalismTemplate from '../templates/neo-brutalism/NeoBrutalismTemplate.svelte';
  import MidnightAuroraTemplate from '../templates/midnight-aurora/MidnightAuroraTemplate.svelte';
  import AtelierTemplate from '../templates/atelier/AtelierTemplate.svelte';
  import { getMessages } from '../shared/i18n';

  let rawViewModel = $state<PublicLandingPageViewModel | null>(null);
  let containerEl = $state<HTMLElement | null>(null);

  onMount(() => {
    const cleanup = initLandingBridge({
      onViewModel: (vm) => {
        rawViewModel = vm;
      }
    });

    return cleanup;
  });

  $effect(() => {
    if (!containerEl || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.ceil(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
        if (height > 0) {
          sendResize(height);
        }
      }
    });

    observer.observe(containerEl);
    return () => observer.disconnect();
  });

  const normalizedViewModel = $derived.by<NormalizedLandingViewModel | null>(() => {
    if (!rawViewModel) return null;

    const vm = rawViewModel;
    const messages = getMessages(vm.locale);
    const navList: PublicLandingLinkItem[] = vm.navigation?.navItems ?? [];
    const signInLabel = vm.navigation?.signInLabel;
    const accountLabel = vm.navigation?.accountLabel;

    const actions = {
      signIn: { label: signInLabel ?? messages.signIn, href: '/login' },
      account: accountLabel ? { label: accountLabel, href: '/profile' } : undefined
    };

    const courses: PublicLandingCourse[] = (vm.courses ?? []).map((c) => ({
      ...c,
      image: c.bannerImage ?? undefined,
      price: c.cost,
      isFree: !c.isPaid
    }));

    const rawCards = vm.links?.cards ?? (vm.links?.items ?? []).map((item) => ({ title: item.label, href: item.href }));
    const linkCards: PublicLandingResourceCard[] = rawCards.map((card) => {
      const desc: string = 'description' in card && typeof card.description === 'string' ? card.description : '';
      const icon: string = 'icon' in card && typeof card.icon === 'string' ? card.icon : '✦';
      return {
        icon,
        title: card.title,
        description: desc,
        href: card.href
      };
    });

    const callout = vm.callout
      ? {
          enabled: true,
          heading: vm.callout.title ?? '',
          description: vm.callout.description ?? '',
          action: vm.callout.action
        }
      : undefined;

    const embed = vm.embed
      ? {
          enabled: true,
          title: vm.embed.title ?? messages.featuredMedia,
          description: vm.embed.description,
          url: vm.embed.url,
          aspectRatio: vm.embed.aspectRatio,
          secondaryAction: vm.embed.secondaryAction
        }
      : undefined;

    const footerLinks = vm.footer?.links ?? [];
    const footerSocials: PublicLandingSocialLink[] = (vm.footer?.socialLinks ?? []).map((s) => ({
      platform: s.platform,
      href: s.href
    }));

    const footer = {
      tagline: vm.footer?.tagline,
      copyright: vm.footer?.copyright,
      socials: footerSocials,
      columns: (vm.footer?.columns ?? []).map((column, index) => ({
        id: `${index}`,
        heading: column.heading,
        links: column.links
      })),
      bottomText: vm.footer?.text,
      bottomLinks: footerLinks
    };

    const labels = {
      coursesHeading: messages.coursesHeading,
      coursesViewAll: messages.coursesViewAll,
      coursesEmptyTitle: messages.coursesEmptyTitle,
      coursesEmptyDescription: messages.coursesEmptyDescription,
      courseFree: messages.courseFree,
      courseEnroll: messages.courseEnroll,
      courseLessons: messages.courseLessons,
      courseStudents: messages.courseStudents
    };

    return {
      templateId: vm.templateId,
      locale: vm.locale,
      organization: {
        id: vm.organization.id,
        name: vm.organization.name,
        siteName: vm.organization.siteName,
        logoUrl: vm.organization.avatarUrl
      },
      hero: {
        heading: vm.hero.heading,
        subheading: vm.hero.subheading ?? '',
        eyebrow: vm.hero.eyebrow,
        image: vm.hero.image,
        stats: vm.hero.stats,
        primaryAction: vm.hero.primaryAction || { label: messages.exploreCourses, href: '/courses' },
        secondaryAction: vm.hero.secondaryAction
      },
      navigation: navList,
      courses,
      coursesLoaded: true,
      hasMoreCourses: vm.hasMoreCourses,
      callout,
      embed,
      links: vm.links
        ? { enabled: true, heading: vm.links.title ?? messages.resources, description: vm.links.description, cards: linkCards }
        : undefined,
      footer,
      labels,
      actions
    };
  });

  const activeTemplateId = $derived(normalizedViewModel?.templateId || 'neo-brutalism');
</script>

<div class="renderer-container" bind:this={containerEl}>
  {#if normalizedViewModel}
    {#if activeTemplateId === 'midnight-aurora'}
      <MidnightAuroraTemplate viewModel={normalizedViewModel} />
    {:else if activeTemplateId === 'atelier'}
      <AtelierTemplate viewModel={normalizedViewModel} />
    {:else}
      <NeoBrutalismTemplate viewModel={normalizedViewModel} />
    {/if}
  {:else}
    <div class="loading-screen">
      <div class="loading-spinner"></div>
    </div>
  {/if}
</div>

<style>
  .renderer-container {
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .loading-screen {
    width: 100%;
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid #e2e8f0;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
