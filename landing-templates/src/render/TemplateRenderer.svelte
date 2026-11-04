<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    NormalizedLandingViewModel,
    PublicLandingCourse,
    PublicLandingLinkItem,
    PublicLandingPageViewModel,
    PublicLandingSocialLink
  } from '../shared/types';
  import { initLandingBridge, sendResize } from '../shared/bridge';
  import NeoBrutalismTemplate from '../templates/neo-brutalism/NeoBrutalismTemplate.svelte';
  import MidnightAuroraTemplate from '../templates/midnight-aurora/MidnightAuroraTemplate.svelte';
  import AtelierTemplate from '../templates/atelier/AtelierTemplate.svelte';

  const DEFAULT_HERO_IMAGES: Record<string, string> = {
    'neo-brutalism':
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'midnight-aurora':
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    atelier:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  };

  let rawViewModel = $state<PublicLandingPageViewModel | null>(null);
  let containerEl = $state<HTMLElement | null>(null);

  // Read initial templateId from URL query param if present
  let urlTemplateId = $state<string>('');

  onMount(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      urlTemplateId = params.get('templateId') || '';
    }

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

  // Normalizes model into canonical format expected by template components
  const normalizedViewModel = $derived.by<NormalizedLandingViewModel | null>(() => {
    if (!rawViewModel) return null;

    const vm = rawViewModel;
    const templateId = vm.templateId || vm.theme || urlTemplateId || 'neo-brutalism';

    // Normalize navigation items
    let navList: PublicLandingLinkItem[] = [];
    let signInLabel: string | undefined;
    let accountLabel: string | undefined;

    if (Array.isArray(vm.navigation)) {
      navList = vm.navigation;
    } else if (vm.navigation && typeof vm.navigation === 'object') {
      navList = vm.navigation.navItems ?? [];
      signInLabel = vm.navigation.signInLabel;
      accountLabel = vm.navigation.accountLabel;
    }

    const actions = {
      signIn: vm.actions?.signIn ?? (signInLabel ? { label: signInLabel, href: '/login' } : { label: 'Sign In', href: '/login' }),
      account: vm.actions?.account ?? (accountLabel ? { label: accountLabel, href: '/profile' } : undefined)
    };

    // Normalize courses
    const courses: PublicLandingCourse[] = (vm.courses ?? []).map((c) => ({
      ...c,
      image: c.image ?? c.bannerImage ?? undefined,
      price: typeof c.price === 'number' ? c.price : c.cost,
      isFree: c.isFree ?? !c.isPaid
    }));

    // Normalize links cards
    let linkCards: Array<{ icon: string; title: string; description: string; href: string }> = [];
    if (vm.links?.cards) {
      linkCards = vm.links.cards.map((c) => ({
        icon: c.icon ?? '✦',
        title: c.title,
        description: c.description,
        href: c.href
      }));
    } else if (vm.links?.items) {
      linkCards = vm.links.items.map((item) => ({
        icon: '✦',
        title: item.label,
        description: '',
        href: item.href
      }));
    }

    // Normalize callout
    const callout = vm.callout
      ? {
          enabled: vm.callout.enabled !== false,
          heading: vm.callout.heading || vm.callout.title || '',
          description: vm.callout.description || '',
          action: vm.callout.action || { label: 'Get Started', href: '/courses' }
        }
      : undefined;

    // Normalize embed
    let embed = undefined;
    if (vm.embed && vm.embed.enabled !== false) {
      const embedUrl = vm.embed.url || '';
      const embedCode = vm.embed.code || (embedUrl ? `<iframe src="${embedUrl}" class="w-full h-full border-0"></iframe>` : '');
      embed = {
        enabled: true,
        title: vm.embed.title || 'Featured Media',
        description: vm.embed.description,
        code: embedCode,
        secondaryAction: vm.embed.secondaryAction
      };
    }

    // Normalize footer
    const footerLinks = vm.footer?.bottomLinks || vm.footer?.links || [];
    const footerSocials: PublicLandingSocialLink[] = (vm.footer?.socials || vm.footer?.socialLinks || []).map((s) => ({
      platform: s.platform,
      href: s.href
    }));

    const footerColumns = (vm.footer?.columns || []).map((col) => ({
      id: col.id,
      heading: col.heading,
      links: col.links
    }));

    const footer = {
      tagline: vm.footer?.tagline,
      copyright: vm.footer?.copyright,
      socials: footerSocials,
      columns: footerColumns,
      bottomText: vm.footer?.bottomText || vm.footer?.text,
      bottomLinks: footerLinks
    };

    const labels = {
      coursesHeading: vm.labels?.coursesHeading || 'Featured Courses',
      coursesSubheading: vm.labels?.coursesSubheading,
      coursesViewAll: vm.labels?.coursesViewAll || 'Browse All Courses',
      coursesEmptyTitle: vm.labels?.coursesEmptyTitle || 'No courses available yet',
      coursesEmptyDescription: vm.labels?.coursesEmptyDescription || 'Check back soon for upcoming courses.',
      courseFree: vm.labels?.courseFree || 'Free',
      courseEnroll: vm.labels?.courseEnroll || 'Enroll Now',
      courseLessons: vm.labels?.courseLessons || 'lessons',
      courseStudents: vm.labels?.courseStudents || 'students'
    };

    const templateDefaultHeroImage =
      DEFAULT_HERO_IMAGES[templateId] ?? DEFAULT_HERO_IMAGES['neo-brutalism'];
    const resolvedHeroImage =
      vm.hero.image && vm.hero.image.trim().length > 0 ? vm.hero.image.trim() : templateDefaultHeroImage;

    return {
      templateId,
      organization: {
        id: vm.organization.id,
        name: vm.organization.name,
        siteName: vm.organization.siteName,
        logoUrl: vm.organization.logoUrl || vm.organization.avatarUrl || undefined
      },
      hero: {
        heading: vm.hero.heading,
        subheading: vm.hero.subheading || '',
        eyebrow: vm.hero.eyebrow,
        image: resolvedHeroImage,
        stats: vm.hero.stats,
        primaryAction: vm.hero.primaryAction || { label: 'Explore Courses', href: '/courses' },
        secondaryAction: vm.hero.secondaryAction
      },
      navigation: navList,
      courses,
      coursesLoaded: vm.coursesLoaded ?? true,
      hasMoreCourses: vm.hasMoreCourses ?? false,
      callout,
      embed,
      links: vm.links ? { enabled: vm.links.enabled !== false, heading: vm.links.heading || vm.links.title || 'Resources', description: vm.links.description, cards: linkCards } : undefined,
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
