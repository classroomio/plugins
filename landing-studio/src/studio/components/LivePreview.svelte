<script lang="ts">
  import {
    renderLandingPage,
    escapeHtml,
    type LandingPageCourse,
    type LandingPageDocumentV1,
    type LandingPageOrganization,
    type LandingPageRenderData
  } from '@cio/landing-pages';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import LockIcon from '@lucide/svelte/icons/lock';
  import Maximize2Icon from '@lucide/svelte/icons/maximize-2';
  import MonitorIcon from '@lucide/svelte/icons/monitor';
  import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
  import TabletIcon from '@lucide/svelte/icons/tablet';
  import XIcon from '@lucide/svelte/icons/x';
  import ZoomInIcon from '@lucide/svelte/icons/zoom-in';
  import ZoomOutIcon from '@lucide/svelte/icons/zoom-out';

  interface Props {
    document: LandingPageDocumentV1;
    organization: LandingPageOrganization;
    courses: LandingPageCourse[];
    isFullPreviewOpen?: boolean;
  }

  let {
    document: doc,
    organization,
    courses,
    isFullPreviewOpen = $bindable(false)
  }: Props = $props();

  type ViewportMode = 'desktop' | 'tablet' | 'mobile';
  type ZoomMode = 'fit' | 'manual';

  let viewport = $state<ViewportMode>('desktop');
  let zoomMode = $state<ZoomMode>('fit');
  let manualZoom = $state<number>(1);
  let stageWidth = $state<number>(800);
  let stageHeight = $state<number>(600);

  const VIEWPORT_SPECS = {
    desktop: { width: 1280, height: 850, label: 'Desktop', note: '1280px' },
    tablet: { width: 768, height: 960, label: 'Tablet', note: '768px' },
    mobile: { width: 375, height: 740, label: 'Mobile', note: '375px' }
  } as const;

  const currentSpec = $derived(VIEWPORT_SPECS[viewport]);

  const autoFitScale = $derived.by(() => {
    if (!stageWidth || stageWidth <= 0) return 0.6;
    const paddingX = 48;
    const availableWidth = Math.max(280, stageWidth - paddingX);
    const targetW = currentSpec.width;

    if (viewport === 'desktop') {
      const fitW = availableWidth / targetW;
      return Math.min(1, Math.max(0.3, Math.round(fitW * 100) / 100));
    }

    if (viewport === 'tablet') {
      const fitW = availableWidth / targetW;
      return Math.min(1, Math.max(0.4, Math.round(fitW * 100) / 100));
    }

    // Mobile: 375px fits natively on most screens
    if (availableWidth >= targetW) {
      return 1;
    }
    return Math.min(1, Math.max(0.5, Math.round((availableWidth / targetW) * 100) / 100));
  });

  const activeScale = $derived(zoomMode === 'fit' ? autoFitScale : manualZoom);

  function handleZoomIn() {
    zoomMode = 'manual';
    manualZoom = Math.min(1.5, Math.round((activeScale + 0.1) * 10) / 10);
  }

  function handleZoomOut() {
    zoomMode = 'manual';
    manualZoom = Math.max(0.3, Math.round((activeScale - 0.1) * 10) / 10);
  }

  function handleZoomReset() {
    zoomMode = 'fit';
  }

  function handleSetZoomPreset(level: number) {
    zoomMode = 'manual';
    manualZoom = level;
  }

  const renderData = $derived<LandingPageRenderData>({
    organization,
    courses,
    auth: {
      isAuthenticated: false,
      user: null,
      action: { label: 'Sign in', href: '/login' }
    }
  });

  const rendered = $derived.by(() => {
    try {
      return renderLandingPage(doc, renderData);
    } catch (e) {
      console.error('Error rendering landing page in studio preview:', e);
      return {
        html: '<div style="padding: 2rem; color: #ef4444; font-family: sans-serif;">Failed to render preview. Check document settings.</div>',
        css: '',
        meta: { title: 'Error' }
      };
    }
  });

  const fullHtml = $derived.by(() => {
    const styleOpen = '<' + 'style>';
    const styleClose = '</' + 'style>';
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${escapeHtml(rendered.meta.title)}</title>
          ${rendered.fontsHref ? `<link rel="stylesheet" href="${rendered.fontsHref}">` : ''}
          ${styleOpen}
            *, *::before, *::after { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; }
            body { pointer-events: none; }
            ${rendered.css}
          ${styleClose}
        </head>
        <body>
          ${rendered.html}
        </body>
      </html>
    `;
  });
</script>

<div class="flex h-full flex-col bg-slate-100 dark:bg-slate-900 select-none">
  <!-- Viewport & Zoom Toolbar (ClassroomIO standard styling) -->
  <div
    class="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 dark:border-slate-800 dark:bg-slate-900 z-10"
  >
    <!-- Viewport Switcher -->
    <div class="flex items-center gap-2">
      <div
        class="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-950"
      >
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all {viewport ===
          'desktop'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
          onclick={() => (viewport = 'desktop')}
          title="Desktop view (1280px)"
        >
          <MonitorIcon class="size-3.5" />
          <span class="hidden sm:inline">Desktop</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all {viewport ===
          'tablet'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
          onclick={() => (viewport = 'tablet')}
          title="Tablet view (768px)"
        >
          <TabletIcon class="size-3.5" />
          <span class="hidden sm:inline">Tablet</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all {viewport ===
          'mobile'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
          onclick={() => (viewport = 'mobile')}
          title="Mobile view (375px)"
        >
          <SmartphoneIcon class="size-3.5" />
          <span class="hidden sm:inline">Mobile</span>
        </button>
      </div>

      <span class="hidden md:inline-flex items-center text-[11px] font-medium text-slate-400">
        {currentSpec.width} × {currentSpec.height}
      </span>
    </div>

    <!-- Zoom & Actions Controls (matching Certificate Studio) -->
    <div class="flex items-center gap-1">
      <div class="flex items-center border border-slate-200 rounded-md bg-slate-50 dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <button
          type="button"
          class="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          onclick={handleZoomOut}
          title="Zoom out"
        >
          <ZoomOutIcon size={13} />
        </button>
        <button
          type="button"
          class="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
          onclick={handleZoomReset}
          title="Click to auto-fit"
        >
          {zoomMode === 'fit' ? `Fit (${Math.round(activeScale * 100)}%)` : `${Math.round(activeScale * 100)}%`}
        </button>
        <button
          type="button"
          class="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          onclick={handleZoomIn}
          title="Zoom in"
        >
          <ZoomInIcon size={13} />
        </button>
      </div>

      <button
        type="button"
        class="hidden sm:flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors {zoomMode === 'fit' ? 'border-blue-300 text-blue-600 dark:border-blue-800 dark:text-blue-400' : ''}"
        onclick={handleZoomReset}
        title="Auto-fit to canvas width"
      >
        <Maximize2Icon size={12} />
        <span>Fit</span>
      </button>

      <button
        type="button"
        class="hidden lg:flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors {zoomMode === 'manual' && manualZoom === 1 ? 'border-blue-300 text-blue-600 dark:border-blue-800 dark:text-blue-400' : ''}"
        onclick={() => handleSetZoomPreset(1)}
        title="100% true scale"
      >
        <span>100%</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
        onclick={() => (isFullPreviewOpen = true)}
        title="Fullscreen preview"
      >
        <EyeIcon size={12} />
        <span class="hidden sm:inline">Fullscreen</span>
      </button>
    </div>
  </div>

  <!-- Responsive Canvas Stage with Studio Dot Grid -->
  <div
    class="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center"
    style="background-color: #f8fafc; background-image: radial-gradient(#dbe3ec 1.2px, transparent 1.2px); background-size: 20px 20px;"
    bind:clientWidth={stageWidth}
    bind:clientHeight={stageHeight}
  >
    <!-- Scaled Bounding Wrapper -->
    <div
      class="transition-all duration-150 ease-out origin-top shrink-0"
      style="width: {currentSpec.width * activeScale}px; height: {currentSpec.height * activeScale}px;"
    >
      <!-- Scaled Inner Frame -->
      <div
        class="origin-top-left transition-transform duration-150 ease-out"
        style="width: {currentSpec.width}px; height: {currentSpec.height}px; transform: scale({activeScale});"
      >
        {#if viewport === 'desktop'}
          <!-- Desktop Browser Mockup -->
          <div
            class="flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            style="box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);"
          >
            <!-- Browser Header Bar -->
            <div
              class="flex h-10 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-100/90 px-4 dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur"
            >
              <!-- Window Traffic Light Dots -->
              <div class="flex items-center gap-1.5">
                <span class="size-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></span>
                <span class="size-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></span>
                <span class="size-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></span>
              </div>

              <!-- Address Bar -->
              <div
                class="flex w-96 max-w-sm items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 shadow-xs dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 font-mono"
              >
                <LockIcon class="size-3 text-slate-400" />
                <span class="truncate">https://{organization.slug || 'academy'}.classroomio.com</span>
              </div>

              <div class="w-12"></div>
            </div>

            <!-- Iframe Container -->
            <div class="flex-1 overflow-hidden bg-white dark:bg-slate-950">
              <iframe
                title="Landing Page Desktop Preview"
                srcdoc={fullHtml}
                class="h-full w-full border-none"
                sandbox=""
              ></iframe>
            </div>
          </div>

        {:else if viewport === 'tablet'}
          <!-- Tablet Mockup Frame -->
          <div
            class="flex h-full w-full flex-col overflow-hidden rounded-[28px] border-[10px] border-slate-850 bg-slate-900 shadow-2xl dark:border-slate-800"
            style="box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);"
          >
            <!-- Tablet Top Bar with Camera -->
            <div class="flex h-6 shrink-0 items-center justify-center bg-slate-900">
              <div class="size-2 rounded-full bg-slate-700"></div>
            </div>

            <!-- Tablet Browser Address Bar -->
            <div class="flex h-9 shrink-0 items-center justify-center border-b border-slate-200 bg-slate-100 px-4 dark:border-slate-800 dark:bg-slate-900">
              <div
                class="flex w-80 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 font-mono"
              >
                <LockIcon class="size-2.5 text-slate-400" />
                <span class="truncate">https://{organization.slug || 'academy'}.classroomio.com</span>
              </div>
            </div>

            <!-- Iframe Container -->
            <div class="flex-1 overflow-hidden bg-white dark:bg-slate-950">
              <iframe
                title="Landing Page Tablet Preview"
                srcdoc={fullHtml}
                class="h-full w-full border-none"
                sandbox=""
              ></iframe>
            </div>
          </div>

        {:else}
          <!-- Mobile Phone Mockup Frame -->
          <div
            class="flex h-full w-full flex-col overflow-hidden rounded-[44px] border-[10px] border-slate-900 bg-slate-900 shadow-2xl dark:border-slate-800"
            style="box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.4);"
          >
            <!-- Phone Dynamic Island Notch -->
            <div class="flex h-7 shrink-0 items-center justify-center bg-slate-900">
              <div class="h-3.5 w-24 rounded-full bg-slate-950"></div>
            </div>

            <!-- Iframe Container -->
            <div class="flex-1 overflow-hidden bg-white dark:bg-slate-950">
              <iframe
                title="Landing Page Mobile Preview"
                srcdoc={fullHtml}
                class="h-full w-full border-none"
                sandbox=""
              ></iframe>
            </div>

            <!-- Phone Home Indicator Bar -->
            <div class="flex h-5 shrink-0 items-center justify-center bg-slate-900">
              <div class="h-1 w-28 rounded-full bg-slate-600/80"></div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Fullscreen Preview Modal (matching Certificate Studio preview modal) -->
{#if isFullPreviewOpen}
  <div
    class="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onkeydown={(e) => {
      if (e.key === 'Escape') isFullPreviewOpen = false;
    }}
  >
    <!-- Modal Header -->
    <div class="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 text-white">
      <div class="flex items-center gap-3">
        <h3 class="text-sm font-bold tracking-tight text-white">{rendered.meta.title || 'Landing Page Preview'}</h3>
        <span class="rounded bg-blue-600/30 px-2 py-0.5 text-[10px] font-semibold text-blue-300">Live Preview</span>
      </div>

      <!-- Device Switcher inside Modal -->
      <div class="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-0.5">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all {viewport === 'desktop'
            ? 'bg-slate-800 text-white'
            : 'text-slate-400 hover:text-white'}"
          onclick={() => (viewport = 'desktop')}
        >
          <MonitorIcon class="size-3.5" />
          <span>Desktop</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all {viewport === 'tablet'
            ? 'bg-slate-800 text-white'
            : 'text-slate-400 hover:text-white'}"
          onclick={() => (viewport = 'tablet')}
        >
          <TabletIcon class="size-3.5" />
          <span>Tablet</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all {viewport === 'mobile'
            ? 'bg-slate-800 text-white'
            : 'text-slate-400 hover:text-white'}"
          onclick={() => (viewport = 'mobile')}
        >
          <SmartphoneIcon class="size-3.5" />
          <span>Mobile</span>
        </button>
      </div>

      <!-- Close button -->
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
        onclick={() => (isFullPreviewOpen = false)}
      >
        <XIcon size={14} />
        <span>Close preview</span>
      </button>
    </div>

    <!-- Modal Content -->
    <div class="flex flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
      <div
        class="h-full transition-all duration-200 overflow-hidden bg-white shadow-2xl {viewport === 'mobile'
          ? 'w-[375px] rounded-[36px] border-[8px] border-slate-800'
          : viewport === 'tablet'
            ? 'w-[768px] rounded-[24px] border-[8px] border-slate-800'
            : 'w-full max-w-[1280px] rounded-xl border border-slate-800'}"
      >
        <iframe
          title="Fullscreen Landing Page Preview"
          srcdoc={fullHtml}
          class="h-full w-full border-none"
        ></iframe>
      </div>
    </div>
  </div>
{/if}
