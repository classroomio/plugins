<script lang="ts">
  import { onMount } from 'svelte';
  import {
    renderLandingPage,
    escapeHtml,
    type LandingPageCourse,
    type LandingPageDocumentV1,
    type LandingPageOrganization,
    type LandingPageRenderData
  } from '@cio/landing-pages';
  import LockIcon from '@lucide/svelte/icons/lock';
  import MonitorIcon from '@lucide/svelte/icons/monitor';
  import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
  import TabletIcon from '@lucide/svelte/icons/tablet';
  import XIcon from '@lucide/svelte/icons/x';

  interface Props {
    document: LandingPageDocumentV1;
    organization: LandingPageOrganization;
    courses: LandingPageCourse[];
    viewport?: 'desktop' | 'tablet' | 'mobile';
    zoom?: number;
    selectedSectionId?: string | null;
    selectedTargetType?: 'heading' | 'subtitle' | 'button' | 'video' | 'courses' | 'contact' | 'section' | 'global';
    onSelectElement?: (sectionId: string, targetType: any, text: string) => void;
    isFullPreviewOpen?: boolean;
  }

  let {
    document: doc,
    organization,
    courses,
    viewport = 'desktop',
    zoom = 1,
    selectedSectionId = null,
    selectedTargetType = 'global',
    onSelectElement,
    isFullPreviewOpen = $bindable(false)
  }: Props = $props();

  let canvasIframe = $state<HTMLIFrameElement | null>(null);
  let modalIframe = $state<HTMLIFrameElement | null>(null);

  const VIEWPORT_SPECS = {
    desktop: { width: 1280, label: 'Desktop', note: '1280px' },
    tablet: { width: 768, label: 'Tablet', note: '768px' },
    mobile: { width: 375, label: 'Mobile', note: '375px' }
  } as const;

  const currentSpec = $derived(VIEWPORT_SPECS[viewport]);

  onMount(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'cio-studio:element-selected') {
        const { sectionId, targetType, text } = event.data;
        onSelectElement?.(sectionId, targetType, text);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  });

  function syncSelectionToIframe() {
    const targetIframes = [canvasIframe, modalIframe];
    for (const ifr of targetIframes) {
      if (ifr?.contentWindow) {
        ifr.contentWindow.postMessage(
          {
            type: 'cio-studio:set-selection',
            sectionId: selectedSectionId,
            targetType: selectedTargetType
          },
          '*'
        );
      }
    }
  }

  $effect(() => {
    // When selection changes, update highlights in iframe
    syncSelectionToIframe();
  });

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

  const interactiveHelperScript = `
    <style>
      .cio-builder-hover {
        outline: 2px dashed #3b82f6 !important;
        outline-offset: 3px !important;
        cursor: pointer !important;
      }
      .cio-builder-selected {
        outline: 2.5px solid #2563eb !important;
        outline-offset: 4px !important;
        position: relative !important;
        cursor: pointer !important;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15) !important;
      }
      .cio-builder-handle {
        position: absolute;
        width: 7px;
        height: 7px;
        background: #ffffff;
        border: 2px solid #2563eb;
        border-radius: 1.5px;
        z-index: 9999;
        pointer-events: none;
      }
      .cio-builder-handle-tl { top: -8px; left: -8px; }
      .cio-builder-handle-tr { top: -8px; right: -8px; }
      .cio-builder-handle-bl { bottom: -8px; left: -8px; }
      .cio-builder-handle-br { bottom: -8px; right: -8px; }
      .cio-builder-tag {
        position: absolute;
        top: -24px;
        left: -4px;
        background: #2563eb;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
        z-index: 10000;
        pointer-events: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      }
    </style>
    <script>
      (function() {
        var activeHandles = [];
        var activeTag = null;

        function clearOverlays() {
          activeHandles.forEach(function(h) { if (h.parentNode) h.parentNode.removeChild(h); });
          activeHandles = [];
          if (activeTag && activeTag.parentNode) {
            activeTag.parentNode.removeChild(activeTag);
            activeTag = null;
          }
          document.querySelectorAll('.cio-builder-selected').forEach(function(el) {
            el.classList.remove('cio-builder-selected');
          });
        }

        function createSelectionBox(targetEl, label) {
          clearOverlays();
          if (!targetEl) return;
          targetEl.classList.add('cio-builder-selected');

          var positions = ['tl', 'tr', 'bl', 'br'];
          positions.forEach(function(pos) {
            var handle = document.createElement('div');
            handle.className = 'cio-builder-handle cio-builder-handle-' + pos;
            targetEl.appendChild(handle);
            activeHandles.push(handle);
          });

          var tag = document.createElement('div');
          tag.className = 'cio-builder-tag';
          tag.innerText = label || 'Element';
          targetEl.appendChild(tag);
          activeTag = tag;
        }

        function setupCanvasInteractions() {
          document.addEventListener('click', function(e) {
            var anchor = e.target.closest('a');
            if (anchor) e.preventDefault();
          }, true);

          document.addEventListener('submit', function(e) {
            e.preventDefault();
          }, true);

          // Find interactive elements
          var headings = document.querySelectorAll('h1, h2, h3, .cio-lp-hero-title, .cio-lp-section-title');
          var subs = document.querySelectorAll('.cio-lp-hero-sub, .cio-lp-section-sub');
          var buttons = document.querySelectorAll('.cio-lp-btn-primary, .cio-lp-btn-secondary, button');
          var videos = document.querySelectorAll('.cio-lp-video-wrapper, .cio-lp-video-section');
          var forms = document.querySelectorAll('.cio-lp-contact-form, .cio-lp-contact-section');
          var courses = document.querySelectorAll('.cio-lp-courses-section, .cio-lp-course-card');
          var sections = document.querySelectorAll('.cio-lp-section, .cio-lp-hero, header.cio-lp-header');

          function attachElement(el, targetType, label) {
            el.style.cursor = 'pointer';
            el.addEventListener('mouseenter', function() {
              if (!el.classList.contains('cio-builder-selected')) {
                el.classList.add('cio-builder-hover');
              }
            });
            el.addEventListener('mouseleave', function() {
              el.classList.remove('cio-builder-hover');
            });
            el.addEventListener('click', function(e) {
              e.stopPropagation();
              var sec = el.closest('.cio-lp-section') || el.closest('.cio-lp-hero');
              var sectionId = sec ? (sec.id || (sec.classList.contains('cio-lp-hero') ? 'hero' : '')) : 'hero';
              createSelectionBox(el, label);
              window.parent.postMessage({
                type: 'cio-studio:element-selected',
                sectionId: sectionId,
                targetType: targetType,
                text: el.innerText || ''
              }, '*');
            });
          }

          headings.forEach(function(h) {
            var isHero = h.closest('.cio-lp-hero');
            attachElement(h, 'heading', isHero ? 'Hero Heading 1' : 'Section Title');
          });

          subs.forEach(function(p) {
            attachElement(p, 'subtitle', 'Subtitle / Text');
          });

          buttons.forEach(function(b) {
            attachElement(b, 'button', 'Action Button');
          });

          videos.forEach(function(v) {
            attachElement(v, 'video', 'Video Player');
          });

          forms.forEach(function(f) {
            attachElement(f, 'contact', 'Contact Form');
          });

          sections.forEach(function(s) {
            s.addEventListener('click', function(e) {
              if (e.target === s || e.target.classList.contains('cio-lp-container')) {
                var secId = s.id || (s.classList.contains('cio-lp-hero') ? 'hero' : '');
                createSelectionBox(s, secId === 'hero' ? 'Hero Section' : 'Section Container');
                window.parent.postMessage({
                  type: 'cio-studio:element-selected',
                  sectionId: secId,
                  targetType: 'section',
                  text: ''
                }, '*');
              }
            });
          });

          window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'cio-studio:set-selection') {
              var sectionId = event.data.sectionId;
              var targetType = event.data.targetType;

              if (!sectionId && targetType === 'global') {
                clearOverlays();
                return;
              }

              var target = null;
              var label = 'Selected';

              if (sectionId === 'hero') {
                if (targetType === 'heading') {
                  target = document.querySelector('.cio-lp-hero h1, .cio-lp-hero-title');
                  label = 'Hero Heading 1';
                } else if (targetType === 'subtitle') {
                  target = document.querySelector('.cio-lp-hero p, .cio-lp-hero-sub');
                  label = 'Hero Subtitle';
                } else {
                  target = document.querySelector('.cio-lp-hero');
                  label = 'Hero Section';
                }
              } else if (sectionId) {
                target = document.getElementById(sectionId);
                label = 'Section';
              }

              if (target) {
                createSelectionBox(target, label);
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          });
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupCanvasInteractions);
        } else {
          setupCanvasInteractions();
        }
      })();
    </` + `script>
  `;

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
            ${rendered.css}
          ${styleClose}
        </head>
        <body>
          ${rendered.html}
          ${interactiveHelperScript}
        </body>
      </html>
    `;
  });
</script>

<!-- Responsive Canvas Frame -->
<div
  class="w-full flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center"
  style="background-color: #f8fafc; background-image: radial-gradient(#dbe3ec 1.2px, transparent 1.2px); background-size: 20px 20px;"
>
  <!-- Responsive Scaled Container -->
  <div
    class="transition-all duration-200 ease-out origin-top shrink-0"
    style="width: {currentSpec.width * zoom}px;"
  >
    <!-- Scaled Inner Browser Mockup -->
    <div
      class="origin-top-left transition-transform duration-200 ease-out overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      style="width: {currentSpec.width}px; transform: scale({zoom}); min-height: 820px; box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);"
    >
      <!-- Browser Top Navigation Chrome -->
      <div
        class="flex h-10 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-100/90 px-4 dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur"
      >
        <!-- Traffic Light Window Controls -->
        <div class="flex items-center gap-1.5">
          <span class="size-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></span>
          <span class="size-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></span>
          <span class="size-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></span>
        </div>

        <!-- Centered URL bar -->
        <div
          class="flex w-96 max-w-sm items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 shadow-xs dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 font-mono"
        >
          <LockIcon class="size-3 text-slate-400" />
          <span class="truncate">https://{organization.slug || 'coursera-test'}.classroomio.com</span>
        </div>

        <div class="w-12"></div>
      </div>

      <!-- Iframe Rendering Engine -->
      <div class="w-full min-h-[780px] bg-white dark:bg-slate-950">
        <iframe
          bind:this={canvasIframe}
          title="Landing Page Canvas Viewport"
          srcdoc={fullHtml}
          sandbox="allow-scripts allow-same-origin"
          class="h-[880px] w-full border-none"
          onload={syncSelectionToIframe}
        ></iframe>
      </div>
    </div>
  </div>
</div>

<!-- Fullscreen Preview Modal -->
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
    <div class="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 text-white">
      <div class="flex items-center gap-3">
        <h3 class="text-sm font-bold text-white">{rendered.meta.title || 'Landing Page Preview'}</h3>
        <span class="rounded bg-blue-600/30 px-2 py-0.5 text-[10px] font-semibold text-blue-300">Live Preview</span>
      </div>

      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
        onclick={() => (isFullPreviewOpen = false)}
      >
        <XIcon size={14} />
        <span>Close preview</span>
      </button>
    </div>

    <div class="flex flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
      <div
        class="h-full w-full max-w-[1280px] rounded-xl border border-slate-800 overflow-hidden bg-white shadow-2xl"
      >
        <iframe
          bind:this={modalIframe}
          title="Fullscreen Landing Page Preview"
          srcdoc={fullHtml}
          sandbox="allow-scripts allow-same-origin"
          class="h-full w-full border-none"
        ></iframe>
      </div>
    </div>
  </div>
{/if}
