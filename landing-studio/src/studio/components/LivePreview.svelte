<script lang="ts">
  import {
    renderLandingPage,
    type LandingPageCourse,
    type LandingPageDocumentV1,
    type LandingPageOrganization,
    type LandingPageRenderData
  } from '@cio/landing-pages';
  import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
  import TabletIcon from '@lucide/svelte/icons/tablet';
  import MonitorIcon from '@lucide/svelte/icons/monitor';

  interface Props {
    document: LandingPageDocumentV1;
    organization: LandingPageOrganization;
    courses: LandingPageCourse[];
  }

  let { document: doc, organization, courses }: Props = $props();

  let viewport = $state<'desktop' | 'tablet' | 'mobile'>('desktop');

  const renderData = $derived<LandingPageRenderData>({
    organization,
    courses,
    auth: {
      isAuthenticated: false,
      user: null,
      dashboardUrl: '/dashboard',
      loginUrl: '/login',
      signupUrl: '/signup'
    }
  });

  const rendered = $derived.by(() => {
    try {
      return renderLandingPage(doc, renderData);
    } catch (e) {
      console.error('Error rendering landing page in studio preview:', e);
      return {
        html: '<div style="padding: 2rem; color: #ef4444;">Failed to render preview. Check document settings.</div>',
        css: '',
        meta: { title: 'Error' }
      };
    }
  });

  const fullHtml = $derived.by(() => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${rendered.meta.title}</title>
          ${rendered.fontsHref ? `<link rel="stylesheet" href="${rendered.fontsHref}">` : ''}
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; }
            ${rendered.css}
          </style>
        </head>
        <body>
          ${rendered.html}
        </body>
      </html>
    `;
  });

  const viewportWidthClass = $derived(
    viewport === 'mobile' ? 'max-w-[375px]' : viewport === 'tablet' ? 'max-w-[768px]' : 'max-w-full'
  );
</script>

<div class="flex h-full flex-col bg-slate-100 dark:bg-slate-900">
  <!-- Viewport Switcher Toolbar -->
  <div class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-950">
    <span class="text-xs font-medium text-slate-500">Live Preview</span>
    <div class="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        class="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors {viewport === 'desktop' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}"
        onclick={() => (viewport = 'desktop')}
        title="Desktop (100%)"
      >
        <MonitorIcon class="size-3.5" />
        <span>Desktop</span>
      </button>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors {viewport === 'tablet' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}"
        onclick={() => (viewport = 'tablet')}
        title="Tablet (768px)"
      >
        <TabletIcon class="size-3.5" />
        <span>Tablet</span>
      </button>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors {viewport === 'mobile' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}"
        onclick={() => (viewport = 'mobile')}
        title="Mobile (375px)"
      >
        <SmartphoneIcon class="size-3.5" />
        <span>Mobile</span>
      </button>
    </div>
    <span class="text-xs text-slate-400">Updates live</span>
  </div>

  <!-- Preview Frame Wrapper -->
  <div class="flex flex-1 items-start justify-center overflow-auto p-4 md:p-6">
    <div class="h-full w-full transition-all duration-200 {viewportWidthClass} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md dark:border-slate-800">
      <iframe
        title="Landing Page Preview"
        srcdoc={fullHtml}
        class="h-full w-full border-none"
        sandbox="allow-same-origin allow-scripts"
      ></iframe>
    </div>
  </div>
</div>

