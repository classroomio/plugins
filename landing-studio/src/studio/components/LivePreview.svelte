<script lang="ts">
  import {
    generateLandingPageCss,
    type LandingPageCourse,
    type LandingPageDocumentV1,
    type LandingPageHeroElement,
    type LandingPageOrganization,
    type LandingPageSectionV1
  } from '@cio/landing-pages';
  import LockIcon from '@lucide/svelte/icons/lock';
  import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
  import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
  import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
  import CopyIcon from '@lucide/svelte/icons/copy';
  import TrashIcon from '@lucide/svelte/icons/trash-2';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import VideoIcon from '@lucide/svelte/icons/video';
  import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
  import MailIcon from '@lucide/svelte/icons/mail';
  import SparklesIcon from '@lucide/svelte/icons/sparkles';
  import MessageSquareIcon from '@lucide/svelte/icons/message-square';
  import CircleHelpIcon from '@lucide/svelte/icons/circle-help';
  import MegaphoneIcon from '@lucide/svelte/icons/megaphone';
  import ChartBarIcon from '@lucide/svelte/icons/chart-bar';
  import XIcon from '@lucide/svelte/icons/x';

  interface Props {
    document: LandingPageDocumentV1;
    organization: LandingPageOrganization;
    courses: LandingPageCourse[];
    viewport?: 'desktop' | 'tablet' | 'mobile';
    zoom?: number;
    selectedSectionId?: string | null;
    selectedTargetType?: string;
    onSelectElement?: (sectionId: string, targetType: any, text: string) => void;
    onAddSectionAtIndex?: (index: number) => void;
    onChange?: () => void;
    isFullPreviewOpen?: boolean;
  }

  let {
    document: doc,
    organization,
    courses = [],
    viewport = 'desktop',
    zoom = 1,
    selectedSectionId = 'hero',
    selectedTargetType = 'heading',
    onSelectElement,
    onAddSectionAtIndex,
    onChange = () => {},
    isFullPreviewOpen = $bindable(false)
  }: Props = $props();

  let hoveredSectionId = $state<string | null>(null);
  let draggedSectionIndex = $state<number | null>(null);
  let dropTargetIndex = $state<number | null>(null);
  let editingInlineTarget = $state<string | null>(null);

  const VIEWPORT_WIDTHS = {
    desktop: 1100,
    tablet: 768,
    mobile: 375
  } as const;

  const currentWidth = $derived(VIEWPORT_WIDTHS[viewport]);
  const pageCss = $derived(generateLandingPageCss(doc));

  const isHeroSelected = $derived(selectedSectionId === 'hero' && selectedTargetType === 'section');
  const isHeadlineSelected = $derived(selectedSectionId === 'hero' && selectedTargetType === 'heading');
  const isBadgeSelected = $derived(selectedSectionId === 'hero' && (selectedTargetType === 'subtitle' || selectedTargetType === 'badge') && !!doc.hero.badge);
  const isSubheadlineSelected = $derived(selectedSectionId === 'hero' && selectedTargetType === 'subtitle' && !doc.hero.badge);
  const isPrimaryActionSelected = $derived(selectedSectionId === 'hero' && selectedTargetType === 'button');
  const isHeroMediaSelected = $derived(selectedSectionId === 'hero' && selectedTargetType === 'image');

  const DEFAULT_HERO_ORDER: LandingPageHeroElement[] = ['badge', 'headline', 'subheadline', 'actions'];
  const heroElementOrder = $derived<LandingPageHeroElement[]>(doc.hero.elementOrder ?? DEFAULT_HERO_ORDER);
  const heroMediaPosition = $derived(doc.hero.mediaPosition ?? 'right');
  const heroAlignment = $derived(doc.hero.alignment ?? 'left');
  const heroReverseActions = $derived(!!doc.hero.reverseActions);

  function moveHeroElement(elementKey: 'badge' | 'headline' | 'subheadline' | 'actions', direction: 'up' | 'down', e: MouseEvent | null = null) {
    e?.stopPropagation();
    const currentOrder: LandingPageHeroElement[] = [...heroElementOrder];
    const idx = currentOrder.indexOf(elementKey);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;
    const temp = currentOrder[idx];
    currentOrder[idx] = currentOrder[targetIdx];
    currentOrder[targetIdx] = temp;
    doc.hero.elementOrder = currentOrder;
    onChange();
  }

  function setHeroMediaPosition(pos: 'left' | 'right' | 'bottom', e: MouseEvent | null = null) {
    e?.stopPropagation();
    doc.hero.mediaPosition = pos;
    onChange();
  }

  function toggleReverseActions(e: MouseEvent | null = null) {
    e?.stopPropagation();
    doc.hero.reverseActions = !doc.hero.reverseActions;
    onChange();
  }

  function moveSectionItem(sec: any, fromIdx: number, direction: 'prev' | 'next', e: MouseEvent | null = null) {
    e?.stopPropagation();
    if (!sec.items) return;
    const toIdx = direction === 'prev' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= sec.items.length) return;
    const item = sec.items[fromIdx];
    sec.items.splice(fromIdx, 1);
    sec.items.splice(toIdx, 0, item);
    onChange();
  }

  function duplicateSectionItem(sec: any, fromIdx: number, e: MouseEvent | null = null) {
    e?.stopPropagation();
    if (!sec.items) return;
    const cloned = JSON.parse(JSON.stringify(sec.items[fromIdx]));
    cloned.id = `${sec.type}-${Date.now()}`;
    if ('title' in cloned) cloned.title = `${cloned.title} (Copy)`;
    sec.items.splice(fromIdx + 1, 0, cloned);
    onChange();
  }

  function deleteSectionItem(sec: any, fromIdx: number, e: MouseEvent | null = null) {
    e?.stopPropagation();
    if (!sec.items || sec.items.length <= 1) return;
    sec.items.splice(fromIdx, 1);
    onChange();
  }

  function selectElement(secId: string, targetType: any, text = '') {
    onSelectElement?.(secId, targetType, text);
  }

  // Section Action handlers
  function moveSectionUp(index: number, e: MouseEvent) {
    e.stopPropagation();
    if (index <= 0) return;
    const item = doc.sections[index];
    doc.sections.splice(index, 1);
    doc.sections.splice(index - 1, 0, item);
    onChange();
  }

  function moveSectionDown(index: number, e: MouseEvent) {
    e.stopPropagation();
    if (index >= doc.sections.length - 1) return;
    const item = doc.sections[index];
    doc.sections.splice(index, 1);
    doc.sections.splice(index + 1, 0, item);
    onChange();
  }

  function duplicateSection(sec: LandingPageSectionV1, index: number, e: MouseEvent) {
    e.stopPropagation();
    const cloned = JSON.parse(JSON.stringify(sec)) as LandingPageSectionV1;
    cloned.id = `sec-${Date.now()}`;
    if ('title' in cloned && typeof cloned.title === 'string') {
      cloned.title = `${cloned.title} (Copy)`;
    }
    doc.sections.splice(index + 1, 0, cloned);
    selectElement(cloned.id, 'section');
    onChange();
  }

  function deleteSection(index: number, e: MouseEvent) {
    e.stopPropagation();
    const sec = doc.sections[index];
    if (window.confirm(`Delete "${'title' in sec && sec.title ? sec.title : sec.type}" section?`)) {
      doc.sections.splice(index, 1);
      selectElement(doc.sections[0]?.id ?? 'hero', 'section');
      onChange();
    }
  }

  function toggleSectionVisibility(sec: LandingPageSectionV1, e: MouseEvent) {
    e.stopPropagation();
    sec.enabled = !sec.enabled;
    onChange();
  }

  // Drag and Drop
  function handleDragStart(e: DragEvent, index: number) {
    draggedSectionIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    dropTargetIndex = index;
  }

  function handleDrop(e: DragEvent, targetIndex: number) {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === targetIndex) {
      draggedSectionIndex = null;
      dropTargetIndex = null;
      return;
    }
    const item = doc.sections[draggedSectionIndex];
    doc.sections.splice(draggedSectionIndex, 1);
    doc.sections.splice(targetIndex, 0, item);
    draggedSectionIndex = null;
    dropTargetIndex = null;
    onChange();
  }

  function handleDragEnd() {
    draggedSectionIndex = null;
    dropTargetIndex = null;
  }

  interface ActiveResizeState {
    targetKey: string;
    type: 'image' | 'text' | 'box';
    direction: 'nw' | 'ne' | 'sw' | 'se' | 'e' | 'w' | 's' | 'n';
    startX: number;
    startY: number;
    initialSize: number;
    currentSize: number;
  }

  let activeResize = $state<ActiveResizeState | null>(null);

  function startResize(
    e: PointerEvent,
    targetKey: string,
    type: 'image' | 'text' | 'box',
    direction: 'nw' | 'ne' | 'sw' | 'se' | 'e' | 'w' | 's' | 'n'
  ) {
    e.stopPropagation();
    e.preventDefault();

    let initialSize = 48;
    if (type === 'image') {
      initialSize = doc.hero.mediaWidth ?? doc.elementStyles?.[targetKey]?.width ?? 520;
    } else if (type === 'text') {
      if (targetKey === 'hero-headline') {
        initialSize = doc.hero.headlineSize ?? doc.elementStyles?.['hero-headline']?.fontSize ?? 48;
      } else if (targetKey === 'hero-subheadline') {
        initialSize = doc.hero.subheadlineSize ?? doc.elementStyles?.['hero-subheadline']?.fontSize ?? 18;
      } else if (targetKey === 'hero-badge') {
        initialSize = doc.hero.badgeSize ?? doc.elementStyles?.['hero-badge']?.fontSize ?? 12;
      } else {
        initialSize = doc.elementStyles?.[targetKey]?.fontSize ?? 30;
      }
    } else {
      initialSize = doc.elementStyles?.[targetKey]?.width ?? 320;
    }

    activeResize = {
      targetKey,
      type,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initialSize,
      currentSize: initialSize
    };

    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', handleResizeUp);
    window.addEventListener('pointercancel', handleResizeUp);
  }

  function handleResizeMove(e: PointerEvent) {
    if (!activeResize) return;
    const { targetKey, type, direction, startX, startY, initialSize } = activeResize;
    const deltaX = (e.clientX - startX) / (zoom || 1);
    const deltaY = (e.clientY - startY) / (zoom || 1);

    if (type === 'image') {
      let change = deltaX;
      if (direction === 'nw' || direction === 'w' || direction === 'sw') {
        change = -deltaX;
      } else if (direction === 's') {
        change = deltaY * 1.4;
      }
      const newWidth = Math.max(160, Math.min(1000, Math.round(initialSize + change)));
      activeResize.currentSize = newWidth;

      if (targetKey === 'hero-image' || targetKey === 'hero') {
        doc.hero.mediaWidth = newWidth;
      }
      if (!doc.elementStyles) doc.elementStyles = {};
      doc.elementStyles[targetKey] = {
        ...(doc.elementStyles[targetKey] ?? {}),
        width: newWidth,
        maxWidth: newWidth
      };
      onChange();
    } else if (type === 'text') {
      let delta = (direction === 'e' || direction === 'w') ? deltaX : (deltaX + deltaY) / 2;
      if (direction === 'nw' || direction === 'w' || direction === 'sw') {
        delta = -delta;
      }
      const step = Math.round(delta / 3.5);
      let minSize = 12;
      let maxSize = 96;
      if (targetKey.includes('badge')) {
        minSize = 9;
        maxSize = 24;
      } else if (targetKey.includes('sub')) {
        minSize = 12;
        maxSize = 36;
      }

      const newFontSize = Math.max(minSize, Math.min(maxSize, Math.round(initialSize + step)));
      activeResize.currentSize = newFontSize;

      if (targetKey === 'hero-headline') {
        doc.hero.headlineSize = newFontSize;
      } else if (targetKey === 'hero-subheadline') {
        doc.hero.subheadlineSize = newFontSize;
      } else if (targetKey === 'hero-badge') {
        doc.hero.badgeSize = newFontSize;
      }

      if (!doc.elementStyles) doc.elementStyles = {};
      doc.elementStyles[targetKey] = {
        ...(doc.elementStyles[targetKey] ?? {}),
        fontSize: newFontSize
      };
      onChange();
    } else {
      let change = deltaX;
      if (direction === 'nw' || direction === 'w' || direction === 'sw') change = -deltaX;
      const newWidth = Math.max(120, Math.min(800, Math.round(initialSize + change)));
      activeResize.currentSize = newWidth;
      if (!doc.elementStyles) doc.elementStyles = {};
      doc.elementStyles[targetKey] = {
        ...(doc.elementStyles[targetKey] ?? {}),
        width: newWidth
      };
      onChange();
    }
  }

  function handleResizeUp() {
    window.removeEventListener('pointermove', handleResizeMove);
    window.removeEventListener('pointerup', handleResizeUp);
    window.removeEventListener('pointercancel', handleResizeUp);
    activeResize = null;
    onChange();
  }
</script>

<!-- Embedded Landing Page CSS Scoped Directly to Canvas -->
{@html '<' + 'style>' + pageCss + '<' + '/style>'}

<style>
  /* Figma/Webflow Selection Overlays */
  :global(.builder-outline-hover) {
    outline: 2px dashed #3b82f6 !important;
    outline-offset: 3px !important;
    cursor: pointer !important;
  }
  :global(.builder-selected-box) {
    outline: 2.5px solid #2563eb !important;
    outline-offset: 4px !important;
    position: relative !important;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2) !important;
  }
  :global(.builder-handle) {
    position: absolute;
    width: 9px;
    height: 9px;
    background: #ffffff !important;
    border: 2px solid #2563eb !important;
    border-radius: 2px;
    pointer-events: auto !important;
    z-index: 60;
    transition: transform 0.1s ease, background-color 0.1s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  }
  :global(.builder-handle:hover) {
    transform: scale(1.3);
    background-color: #2563eb !important;
    border-color: #ffffff !important;
  }
  :global(.builder-handle-tl) { top: -6px; left: -6px; cursor: nwse-resize !important; }
  :global(.builder-handle-tr) { top: -6px; right: -6px; cursor: nesw-resize !important; }
  :global(.builder-handle-bl) { bottom: -6px; left: -6px; cursor: nesw-resize !important; }
  :global(.builder-handle-br) { bottom: -6px; right: -6px; cursor: nwse-resize !important; }

  :global(.builder-handle-e) {
    top: 50%;
    right: -6px;
    transform: translateY(-50%);
    width: 6px;
    height: 14px;
    border-radius: 3px;
    cursor: ew-resize !important;
  }
  :global(.builder-handle-e:hover) {
    transform: translateY(-50%) scale(1.25);
  }
  :global(.builder-handle-w) {
    top: 50%;
    left: -6px;
    transform: translateY(-50%);
    width: 6px;
    height: 14px;
    border-radius: 3px;
    cursor: ew-resize !important;
  }
  :global(.builder-handle-w:hover) {
    transform: translateY(-50%) scale(1.25);
  }
  :global(.builder-handle-s) {
    left: 50%;
    bottom: -6px;
    transform: translateX(-50%);
    width: 14px;
    height: 6px;
    border-radius: 3px;
    cursor: ns-resize !important;
  }
  :global(.builder-handle-s:hover) {
    transform: translateX(-50%) scale(1.25);
  }

  :global(.builder-tag) {
    position: absolute;
    top: -24px;
    left: -4px;
    background: #2563eb !important;
    color: #ffffff !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    padding: 2px 7px !important;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 60;
    pointer-events: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  }
</style>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#snippet resizeOverlay(targetKey: string, type: 'image' | 'text' | 'box', tagLabel: string, currentDisplaySize: string = '')}
  <div
    class="builder-handle builder-handle-tl"
    data-resize-handle="nw"
    onpointerdown={(e) => startResize(e, targetKey, type, 'nw')}
  ></div>
  <div
    class="builder-handle builder-handle-tr"
    data-resize-handle="ne"
    onpointerdown={(e) => startResize(e, targetKey, type, 'ne')}
  ></div>
  <div
    class="builder-handle builder-handle-bl"
    data-resize-handle="sw"
    onpointerdown={(e) => startResize(e, targetKey, type, 'sw')}
  ></div>
  <div
    class="builder-handle builder-handle-br"
    data-resize-handle="se"
    onpointerdown={(e) => startResize(e, targetKey, type, 'se')}
  ></div>

  <div
    class="builder-handle builder-handle-e"
    data-resize-handle="e"
    onpointerdown={(e) => startResize(e, targetKey, type, 'e')}
  ></div>
  <div
    class="builder-handle builder-handle-w"
    data-resize-handle="w"
    onpointerdown={(e) => startResize(e, targetKey, type, 'w')}
  ></div>
  <div
    class="builder-handle builder-handle-s"
    data-resize-handle="s"
    onpointerdown={(e) => startResize(e, targetKey, type, 's')}
  ></div>

  <div class="builder-tag flex items-center gap-1.5">
    <span>{tagLabel}</span>
    {#if activeResize && activeResize.targetKey === targetKey}
      <span class="rounded bg-blue-700 px-1 py-0.2 text-[9px] font-mono font-bold text-white">
        {activeResize.currentSize}px
      </span>
    {:else if currentDisplaySize}
      <span class="rounded bg-blue-700 px-1 py-0.2 text-[9px] font-mono text-white">
        {currentDisplaySize}
      </span>
    {/if}
  </div>
{/snippet}

<!-- Canvas Stage Container -->
<div
  class="w-full flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center select-none"
  style="background-color: #f8fafc; background-image: radial-gradient(#dbe3ec 1.2px, transparent 1.2px); background-size: 20px 20px;"
  role="presentation"
  onclick={() => selectElement('', 'global')}
>
  <!-- Responsive Scaled Wrapper -->
  <div
    class="transition-all duration-200 ease-out origin-top shrink-0"
    style="width: {currentWidth * zoom}px;"
    role="presentation"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Browser Mockup Window Frame -->
    <div
      class="origin-top-left transition-transform duration-200 ease-out overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      style="width: {currentWidth}px; transform: scale({zoom}); min-height: 820px; box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);"
    >
      <!-- Browser Top Chrome Header -->
      <div
        class="flex h-10 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-100/90 px-4 dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur"
      >
        <div class="flex items-center gap-1.5">
          <span class="size-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></span>
          <span class="size-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></span>
          <span class="size-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></span>
        </div>

        <div
          class="flex w-80 max-w-sm items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-0.5 text-xs text-slate-500 shadow-xs dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 font-mono"
        >
          <LockIcon class="size-3 text-slate-400" />
          <span class="truncate">https://{organization.slug || 'coursera-test'}.classroomio.com</span>
        </div>

        <div class="w-12"></div>
      </div>

      <!-- LIVE INTERACTIVE LANDING PAGE DOM -->
      <div class="cio-landing-page relative text-slate-900 bg-white">
        
        <!-- 1. Header / Navbar -->
        <header class="cio-lp-header" role="presentation" onclick={() => selectElement('hero', 'section')}>
          <div class="cio-lp-container cio-lp-header-inner">
            <div class="cio-lp-brand">
              {#if doc.navigation.showLogo && organization.logoUrl}
                <img src={organization.logoUrl} alt={organization.name} class="cio-lp-logo" />
              {/if}
              <span class="cio-lp-org-name">{organization.name}</span>
            </div>

            {#if doc.navigation.customLinks.length > 0}
              <div class="cio-lp-nav-links">
                {#each doc.navigation.customLinks as link}
                  <span class="cio-lp-nav-link">{link.label}</span>
                {/each}
              </div>
            {/if}

            {#if doc.navigation.showAuthAction}
              <div class="cio-lp-nav-auth">
                <span class="cio-lp-btn-primary">Sign in</span>
              </div>
            {/if}
          </div>
        </header>

        <!-- 2. Hero Section (Fully Interactive & Selectable) -->
        <section
          class="cio-lp-hero relative transition-all group {isHeroSelected ? 'builder-selected-box ring-2 ring-blue-600' : 'hover:outline-blue-400'}"
          role="presentation"
          onclick={(e) => { e.stopPropagation(); selectElement('hero', 'section'); }}
        >
          <!-- Floating Action Ribbon for Hero -->
          {#if isHeroSelected || hoveredSectionId === 'hero'}
            <div class="absolute top-3 right-6 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
              <span class="flex items-center gap-1 px-2 text-[10px] font-bold tracking-wider uppercase bg-blue-700/50 rounded">
                Hero Section
              </span>
              <button
                type="button"
                class="p-1 hover:bg-blue-700 rounded"
                title="Move down"
                onclick={(e) => moveSectionDown(0, e)}
              >
                <ChevronDownIcon size={13} />
              </button>
            </div>
          {/if}

          <div class="cio-lp-container cio-lp-hero-grid {doc.hero.mediaType === 'none' || !doc.hero.mediaUrl ? 'no-media' : heroMediaPosition === 'left' ? 'media-left' : heroMediaPosition === 'bottom' ? 'media-bottom' : ''}">
            <!-- Media column if positioned on LEFT -->
            {#if heroMediaPosition === 'left' && doc.hero.mediaType === 'image' && doc.hero.mediaUrl}
              <div
                class="cio-lp-hero-media cursor-pointer relative group {isHeroMediaSelected ? 'builder-selected-box ring-2 ring-blue-600' : 'hover:outline-dashed hover:outline-blue-400'}"
                style="max-width: {doc.hero.mediaWidth ?? doc.elementStyles?.['hero-image']?.width ?? 520}px; width: 100%;"
                role="presentation"
                onclick={(e) => { e.stopPropagation(); selectElement('hero', 'image', 'Hero Image'); }}
              >
                {#if isHeroMediaSelected}
                  <div class="absolute -top-3.5 right-3 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                    <span class="text-[10px] font-bold px-1.5 uppercase">Media</span>
                    <button type="button" class="px-1.5 py-0.5 text-[10px] font-bold hover:bg-blue-700 rounded" onclick={(e) => setHeroMediaPosition('right', e)}>Move Right</button>
                    <button type="button" class="px-1.5 py-0.5 text-[10px] font-bold hover:bg-blue-700 rounded" onclick={(e) => setHeroMediaPosition('bottom', e)}>Move Bottom</button>
                  </div>
                  {@render resizeOverlay('hero-image', 'image', 'Hero Image (Left)', `${doc.hero.mediaWidth ?? doc.elementStyles?.['hero-image']?.width ?? 520}px`)}
                {/if}
                <img src={doc.hero.mediaUrl} alt={doc.hero.headline} class="cio-lp-hero-img" />
              </div>
            {/if}

            <!-- Hero Content Column with Dynamic Block Ordering -->
            <div class="cio-lp-hero-content {heroAlignment === 'center' ? 'text-center' : heroAlignment === 'right' ? 'text-right' : ''}">
              {#each heroElementOrder as elementKey, blockIdx}
                <!-- 1. Hero Badge -->
                {#if elementKey === 'badge' && doc.hero.badge}
                  <div
                    class="cio-lp-hero-badge inline-block cursor-pointer transition-all relative {isBadgeSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
                    style="font-size: {doc.hero.badgeSize ?? doc.elementStyles?.['hero-badge']?.fontSize ?? 12}px;"
                    role="presentation"
                    contenteditable={editingInlineTarget === 'hero-badge'}
                    onclick={(e) => { e.stopPropagation(); selectElement('hero', 'badge', doc.hero.badge ?? ''); }}
                    ondblclick={(e) => { e.stopPropagation(); editingInlineTarget = 'hero-badge'; }}
                    onblur={(e) => {
                      editingInlineTarget = null;
                      doc.hero.badge = (e.currentTarget as HTMLElement).innerText.trim();
                      onChange();
                    }}
                    onkeydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).blur();
                      }
                    }}
                  >
                    <span class="cio-lp-badge-text">{doc.hero.badge}</span>
                    {#if isBadgeSelected}
                      <div class="absolute -top-3.5 right-0 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                        <button type="button" class="p-1 hover:bg-blue-700 rounded disabled:opacity-30" disabled={blockIdx === 0} onclick={(e) => moveHeroElement('badge', 'up', e)} title="Move Up">
                          <ChevronUpIcon size={11} />
                        </button>
                        <button type="button" class="p-1 hover:bg-blue-700 rounded disabled:opacity-30" disabled={blockIdx === heroElementOrder.length - 1} onclick={(e) => moveHeroElement('badge', 'down', e)} title="Move Down">
                          <ChevronDownIcon size={11} />
                        </button>
                      </div>
                      {@render resizeOverlay('hero-badge', 'text', 'Badge', `${doc.hero.badgeSize ?? doc.elementStyles?.['hero-badge']?.fontSize ?? 12}px`)}
                    {/if}
                  </div>

                <!-- 2. Hero Headline -->
                {:else if elementKey === 'headline'}
                  <h1
                    class="cio-lp-hero-title cursor-pointer transition-all relative {isHeadlineSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
                    style="font-size: {doc.hero.headlineSize ?? doc.elementStyles?.['hero-headline']?.fontSize ?? 48}px;"
                    role="presentation"
                    contenteditable={editingInlineTarget === 'hero-headline'}
                    onclick={(e) => { e.stopPropagation(); selectElement('hero', 'heading', doc.hero.headline); }}
                    ondblclick={(e) => { e.stopPropagation(); editingInlineTarget = 'hero-headline'; }}
                    onblur={(e) => {
                      editingInlineTarget = null;
                      doc.hero.headline = (e.currentTarget as HTMLElement).innerText.trim();
                      onChange();
                    }}
                    onkeydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).blur();
                      }
                    }}
                  >
                    {doc.hero.headline}
                    {#if isHeadlineSelected}
                      <div class="absolute -top-3.5 right-0 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                        <button type="button" class="p-1 hover:bg-blue-700 rounded disabled:opacity-30" disabled={blockIdx === 0} onclick={(e) => moveHeroElement('headline', 'up', e)} title="Move Up">
                          <ChevronUpIcon size={11} />
                        </button>
                        <button type="button" class="p-1 hover:bg-blue-700 rounded disabled:opacity-30" disabled={blockIdx === heroElementOrder.length - 1} onclick={(e) => moveHeroElement('headline', 'down', e)} title="Move Down">
                          <ChevronDownIcon size={11} />
                        </button>
                      </div>
                      {@render resizeOverlay('hero-headline', 'text', 'Hero Section > Heading 1', `${doc.hero.headlineSize ?? doc.elementStyles?.['hero-headline']?.fontSize ?? 48}px`)}
                    {/if}
                  </h1>

                <!-- 3. Hero Subheadline -->
                {:else if elementKey === 'subheadline' && doc.hero.subheadline}
                  <p
                    class="cio-lp-hero-sub cursor-pointer transition-all relative {isSubheadlineSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
                    style="font-size: {doc.hero.subheadlineSize ?? doc.elementStyles?.['hero-subheadline']?.fontSize ?? 18}px;"
                    role="presentation"
                    contenteditable={editingInlineTarget === 'hero-sub'}
                    onclick={(e) => { e.stopPropagation(); selectElement('hero', 'subtitle', doc.hero.subheadline); }}
                    ondblclick={(e) => { e.stopPropagation(); editingInlineTarget = 'hero-sub'; }}
                    onblur={(e) => {
                      editingInlineTarget = null;
                      doc.hero.subheadline = (e.currentTarget as HTMLElement).innerText.trim();
                      onChange();
                    }}
                    onkeydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).blur();
                      }
                    }}
                  >
                    {doc.hero.subheadline}
                    {#if isSubheadlineSelected}
                      <span class="absolute -top-3.5 right-0 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                        <button type="button" class="p-1 hover:bg-blue-700 rounded disabled:opacity-30" disabled={blockIdx === 0} onclick={(e) => moveHeroElement('subheadline', 'up', e)} title="Move Up">
                          <ChevronUpIcon size={11} />
                        </button>
                        <button type="button" class="p-1 hover:bg-blue-700 rounded disabled:opacity-30" disabled={blockIdx === heroElementOrder.length - 1} onclick={(e) => moveHeroElement('subheadline', 'down', e)} title="Move Down">
                          <ChevronDownIcon size={11} />
                        </button>
                      </span>
                      {@render resizeOverlay('hero-subheadline', 'text', 'Hero Subtitle', `${doc.hero.subheadlineSize ?? doc.elementStyles?.['hero-subheadline']?.fontSize ?? 18}px`)}
                    {/if}
                  </p>

                <!-- 4. Hero Action Buttons Group -->
                {:else if elementKey === 'actions'}
                  <div class="cio-lp-hero-actions relative {heroAlignment === 'center' ? 'justify-center' : heroAlignment === 'right' ? 'justify-end' : ''}">
                    {#if !heroReverseActions}
                      <!-- Standard Order: Primary -> Secondary -->
                      <div class="relative inline-block">
                        <button
                          type="button"
                          class="cio-lp-btn-primary cio-lp-btn-lg cursor-pointer transition-all {isPrimaryActionSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
                          contenteditable={editingInlineTarget === 'hero-btn'}
                          onclick={(e) => { e.stopPropagation(); selectElement('hero', 'button', doc.hero.primaryAction.label); }}
                          ondblclick={(e) => { e.stopPropagation(); editingInlineTarget = 'hero-btn'; }}
                          onblur={(e) => {
                            editingInlineTarget = null;
                            doc.hero.primaryAction.label = (e.currentTarget as HTMLElement).innerText.trim();
                            onChange();
                          }}
                          onkeydown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.currentTarget as HTMLElement).blur();
                            }
                          }}
                        >
                          {doc.hero.primaryAction.label}
                        </button>
                        {#if isPrimaryActionSelected}
                          <div class="absolute -top-3.5 right-0 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                            <button type="button" class="p-1 hover:bg-blue-700 rounded disabled:opacity-30" disabled={blockIdx === 0} onclick={(e) => moveHeroElement('actions', 'up', e)} title="Move Group Up">
                              <ChevronUpIcon size={11} />
                            </button>
                            <button type="button" class="p-1 hover:bg-blue-700 rounded disabled:opacity-30" disabled={blockIdx === heroElementOrder.length - 1} onclick={(e) => moveHeroElement('actions', 'down', e)} title="Move Group Down">
                              <ChevronDownIcon size={11} />
                            </button>
                            {#if doc.hero.secondaryAction}
                              <button type="button" class="px-1.5 py-0.5 text-[10px] font-bold hover:bg-blue-700 rounded flex items-center gap-1" onclick={toggleReverseActions} title="Swap button positions">
                                <ArrowLeftRightIcon size={10} /> Swap
                              </button>
                            {/if}
                          </div>
                          {@render resizeOverlay('hero-btn', 'box', 'Primary Button')}
                        {/if}
                      </div>

                      {#if doc.hero.secondaryAction}
                        <button
                          type="button"
                          class="cio-lp-btn-secondary cursor-pointer"
                          onclick={(e) => { e.stopPropagation(); selectElement('hero', 'button', doc.hero.secondaryAction?.label ?? ''); }}
                        >
                          {doc.hero.secondaryAction.label}
                        </button>
                      {/if}
                    {:else}
                      <!-- Reversed Order: Secondary -> Primary -->
                      {#if doc.hero.secondaryAction}
                        <button
                          type="button"
                          class="cio-lp-btn-secondary cursor-pointer"
                          onclick={(e) => { e.stopPropagation(); selectElement('hero', 'button', doc.hero.secondaryAction?.label ?? ''); }}
                        >
                          {doc.hero.secondaryAction.label}
                        </button>
                      {/if}

                      <div class="relative inline-block">
                        <button
                          type="button"
                          class="cio-lp-btn-primary cio-lp-btn-lg cursor-pointer transition-all {isPrimaryActionSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
                          contenteditable={editingInlineTarget === 'hero-btn'}
                          onclick={(e) => { e.stopPropagation(); selectElement('hero', 'button', doc.hero.primaryAction.label); }}
                          ondblclick={(e) => { e.stopPropagation(); editingInlineTarget = 'hero-btn'; }}
                          onblur={(e) => {
                            editingInlineTarget = null;
                            doc.hero.primaryAction.label = (e.currentTarget as HTMLElement).innerText.trim();
                            onChange();
                          }}
                          onkeydown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.currentTarget as HTMLElement).blur();
                            }
                          }}
                        >
                          {doc.hero.primaryAction.label}
                        </button>
                        {#if isPrimaryActionSelected}
                          <div class="absolute -top-3.5 right-0 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                            <button type="button" class="p-1 hover:bg-blue-700 rounded disabled:opacity-30" disabled={blockIdx === 0} onclick={(e) => moveHeroElement('actions', 'up', e)} title="Move Group Up">
                              <ChevronUpIcon size={11} />
                            </button>
                            <button type="button" class="p-1 hover:bg-blue-700 rounded disabled:opacity-30" disabled={blockIdx === heroElementOrder.length - 1} onclick={(e) => moveHeroElement('actions', 'down', e)} title="Move Group Down">
                              <ChevronDownIcon size={11} />
                            </button>
                            <button type="button" class="px-1.5 py-0.5 text-[10px] font-bold hover:bg-blue-700 rounded flex items-center gap-1" onclick={toggleReverseActions} title="Swap button positions">
                              <ArrowLeftRightIcon size={10} /> Swap
                            </button>
                          </div>
                          {@render resizeOverlay('hero-btn', 'box', 'Primary Button')}
                        {/if}
                      </div>
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>

            <!-- Media column if positioned on RIGHT or BOTTOM -->
            {#if (heroMediaPosition === 'right' || heroMediaPosition === 'bottom') && doc.hero.mediaType === 'image' && doc.hero.mediaUrl}
              <div
                class="cio-lp-hero-media cursor-pointer relative group {isHeroMediaSelected ? 'builder-selected-box ring-2 ring-blue-600' : 'hover:outline-dashed hover:outline-blue-400'}"
                style="max-width: {doc.hero.mediaWidth ?? doc.elementStyles?.['hero-image']?.width ?? 520}px; width: 100%;"
                role="presentation"
                onclick={(e) => { e.stopPropagation(); selectElement('hero', 'image', 'Hero Image'); }}
              >
                {#if isHeroMediaSelected}
                  <div class="absolute -top-3.5 right-3 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                    <span class="text-[10px] font-bold px-1.5 uppercase">Media</span>
                    <button type="button" class="px-1.5 py-0.5 text-[10px] font-bold hover:bg-blue-700 rounded" onclick={(e) => setHeroMediaPosition('left', e)}>Move Left</button>
                    <button type="button" class="px-1.5 py-0.5 text-[10px] font-bold hover:bg-blue-700 rounded" onclick={(e) => setHeroMediaPosition('bottom', e)}>Move Bottom</button>
                  </div>
                  {@render resizeOverlay('hero-image', 'image', 'Hero Image', `${doc.hero.mediaWidth ?? doc.elementStyles?.['hero-image']?.width ?? 520}px`)}
                {/if}
                <img src={doc.hero.mediaUrl} alt={doc.hero.headline} class="cio-lp-hero-img" />
              </div>
            {/if}
          </div>
        </section>

        <!-- Insertion Zone below Hero -->
        <div
          class="group relative py-2 flex items-center justify-center cursor-pointer transition-all opacity-0 hover:opacity-100"
          role="presentation"
          onclick={() => onAddSectionAtIndex?.(0)}
        >
          <div class="absolute inset-x-8 border-t-2 border-dashed border-blue-400"></div>
          <span class="relative z-10 flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-md hover:bg-blue-700">
            <PlusIcon size={12} />
            <span>Add Section Here</span>
          </span>
        </div>

        <!-- 3. Dynamic Interactive Sections Array -->
        {#each doc.sections as sec, index (sec.id)}
          {@const isSecSelected = selectedSectionId === sec.id}
          {@const isDraggingThis = draggedSectionIndex === index}
          {@const isDropTarget = dropTargetIndex === index}

          <div
            class="relative transition-all {isDropTarget ? 'border-t-4 border-blue-600' : ''} {isDraggingThis ? 'opacity-30' : ''}"
            draggable="true"
            ondragstart={(e) => handleDragStart(e, index)}
            ondragover={(e) => handleDragOver(e, index)}
            ondrop={(e) => handleDrop(e, index)}
            ondragend={handleDragEnd}
            role="presentation"
          >
            <!-- SECTION CONTAINER -->
            <section
              id={sec.id}
              class="cio-lp-section relative transition-all cursor-pointer {isSecSelected
                ? 'builder-selected-box ring-2 ring-blue-600'
                : 'hover:outline-dashed hover:outline-blue-400'} {sec.enabled ? '' : 'opacity-50'}"
              role="presentation"
              onclick={(e) => { e.stopPropagation(); selectElement(sec.id, sec.type); }}
              onmouseenter={() => (hoveredSectionId = sec.id)}
              onmouseleave={() => (hoveredSectionId = null)}
            >
              <!-- Floating Action Ribbon for Selected / Hovered Section -->
              {#if isSecSelected || hoveredSectionId === sec.id}
                <div class="absolute -top-3.5 right-6 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                  <span class="cursor-grab flex items-center gap-1 px-2 text-[10px] font-bold tracking-wider uppercase bg-blue-700/50 rounded">
                    <GripVerticalIcon size={12} />
                    <span>{sec.type} Section</span>
                  </span>

                  <button
                    type="button"
                    class="p-1 hover:bg-blue-700 rounded disabled:opacity-30"
                    disabled={index === 0}
                    onclick={(e) => moveSectionUp(index, e)}
                    title="Move Up"
                  >
                    <ChevronUpIcon size={13} />
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-blue-700 rounded disabled:opacity-30"
                    disabled={index >= doc.sections.length - 1}
                    onclick={(e) => moveSectionDown(index, e)}
                    title="Move Down"
                  >
                    <ChevronDownIcon size={13} />
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-blue-700 rounded"
                    onclick={(e) => duplicateSection(sec, index, e)}
                    title="Duplicate Section"
                  >
                    <CopyIcon size={12} />
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-blue-700 rounded"
                    onclick={(e) => toggleSectionVisibility(sec, e)}
                    title={sec.enabled ? 'Hide Section' : 'Show Section'}
                  >
                    {#if sec.enabled}
                      <EyeIcon size={12} />
                    {:else}
                      <EyeOffIcon size={12} />
                    {/if}
                  </button>
                  <button
                    type="button"
                    class="p-1 hover:bg-red-500 rounded"
                    onclick={(e) => deleteSection(index, e)}
                    title="Delete Section"
                  >
                    <TrashIcon size={12} />
                  </button>
                </div>
              {/if}

              <!-- SELECTION HANDLES & CORNER TAG -->
              {#if isSecSelected}
                <div class="builder-handle builder-handle-tl"></div>
                <div class="builder-handle builder-handle-tr"></div>
                <div class="builder-handle builder-handle-bl"></div>
                <div class="builder-handle builder-handle-br"></div>
                <div class="builder-tag">{sec.type.toUpperCase()} Section</div>
              {/if}

              <div class="cio-lp-container">
                <!-- Section Header (Title & Subtitle) -->
                {#if 'title' in sec && sec.title}
                  {@const isSecTitleSelected = selectedSectionId === sec.id && selectedTargetType === 'heading'}
                  {@const isSecSubSelected = selectedSectionId === sec.id && selectedTargetType === 'subtitle'}
                  <div class="cio-lp-section-header">
                    <h2
                      class="cio-lp-section-title cursor-pointer transition-all {isSecTitleSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
                      style="font-size: {doc.elementStyles?.[`${sec.id}-title`]?.fontSize ?? 30}px;"
                      role="presentation"
                      contenteditable={editingInlineTarget === `${sec.id}-title`}
                      onclick={(e) => { e.stopPropagation(); selectElement(sec.id, 'heading', sec.title); }}
                      ondblclick={(e) => { e.stopPropagation(); editingInlineTarget = `${sec.id}-title`; }}
                      onblur={(e) => {
                        editingInlineTarget = null;
                        sec.title = (e.currentTarget as HTMLElement).innerText.trim();
                        onChange();
                      }}
                      onkeydown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          (e.currentTarget as HTMLElement).blur();
                        }
                      }}
                    >
                      {sec.title}
                      {#if isSecTitleSelected}
                        {@render resizeOverlay(`${sec.id}-title`, 'text', `${sec.type.toUpperCase()} > Title`, `${doc.elementStyles?.[`${sec.id}-title`]?.fontSize ?? 30}px`)}
                      {/if}
                    </h2>
                    {#if 'subtitle' in sec && sec.subtitle}
                      <p
                        class="cio-lp-section-sub cursor-pointer transition-all {isSecSubSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
                        style="font-size: {doc.elementStyles?.[`${sec.id}-sub`]?.fontSize ?? 16}px;"
                        role="presentation"
                        contenteditable={editingInlineTarget === `${sec.id}-sub`}
                        onclick={(e) => { e.stopPropagation(); selectElement(sec.id, 'subtitle', sec.subtitle); }}
                        ondblclick={(e) => { e.stopPropagation(); editingInlineTarget = `${sec.id}-sub`; }}
                        onblur={(e) => {
                          editingInlineTarget = null;
                          sec.subtitle = (e.currentTarget as HTMLElement).innerText.trim();
                          onChange();
                        }}
                        onkeydown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            (e.currentTarget as HTMLElement).blur();
                          }
                        }}
                      >
                        {sec.subtitle}
                        {#if isSecSubSelected}
                          {@render resizeOverlay(`${sec.id}-sub`, 'text', `${sec.type.toUpperCase()} > Subtitle`, `${doc.elementStyles?.[`${sec.id}-sub`]?.fontSize ?? 16}px`)}
                        {/if}
                      </p>
                    {/if}
                  </div>
                {/if}

                <!-- VIDEO SECTION CONTENT -->
                {#if sec.type === 'video'}
                  <div
                    class="cio-lp-video-wrapper mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 flex items-center justify-center relative cursor-pointer"
                    style="max-width: 900px; aspect-ratio: {sec.aspectRatio || '16/9'};"
                  >
                    {#if sec.provider === 'youtube'}
                      <iframe
                        src="https://www.youtube-nocookie.com/embed/{sec.videoId}?rel=0&modestbranding=1"
                        title={sec.title || 'Video'}
                        class="size-full border-0 pointer-events-none"
                      ></iframe>
                    {:else}
                      <iframe
                        src="https://player.vimeo.com/video/{sec.videoId}?dnt=1"
                        title={sec.title || 'Video'}
                        class="size-full border-0 pointer-events-none"
                      ></iframe>
                    {/if}
                  </div>

                <!-- CONTACT FORM CONTENT -->
                {:else if sec.type === 'contact'}
                  <div class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <form class="space-y-3.5" onsubmit={(e) => e.preventDefault()}>
                      {#each sec.fields as f}
                        <div class="space-y-1 text-left">
                          <span class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {f.label} {#if f.required}<span class="text-red-500">*</span>{/if}
                          </span>
                          {#if f.type === 'textarea'}
                            <textarea
                              rows="3"
                              placeholder={f.placeholder || ''}
                              class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs pointer-events-none bg-slate-50 dark:bg-slate-950"
                            ></textarea>
                          {:else}
                            <input
                              type={f.type}
                              placeholder={f.placeholder || ''}
                              class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs pointer-events-none bg-slate-50 dark:bg-slate-950"
                            />
                          {/if}
                        </div>
                      {/each}
                      <button
                        type="button"
                        class="cio-lp-btn-primary w-full py-2.5 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        {sec.submitLabel || 'Send Message'}
                      </button>
                    </form>
                  </div>

                <!-- COURSES SHOWCASE CONTENT -->
                {:else if sec.type === 'courses'}
                  {@const visibleCourses = (sec.selectedCourseIds && sec.selectedCourseIds.length > 0)
                    ? courses.filter((c) => sec.selectedCourseIds?.includes(c.id)).slice(0, sec.maxItems ?? 6)
                    : courses.slice(0, sec.maxItems ?? 6)}
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {#if visibleCourses.length === 0}
                      <div class="col-span-full py-8 text-center text-xs text-slate-400">
                        No courses to display. Configure courses in the right inspector.
                      </div>
                    {:else}
                      {#each visibleCourses as c}
                        <div class="cio-lp-course-card rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow bg-white">
                          {#if c.image}
                            <img src={c.image} alt={c.title} class="h-36 w-full object-cover" />
                          {:else}
                            <div class="h-36 w-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <GraduationCapIcon size={32} />
                            </div>
                          {/if}
                          <div class="p-4">
                            <h3 class="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h3>
                            <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">{c.description || 'Comprehensive curriculum engineered for mastery.'}</p>
                            <div class="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                              <span class="font-bold text-blue-600">{c.isPricing && c.cost ? `$${c.cost}` : 'Free'}</span>
                              <span class="text-slate-400 text-[10px]">Enroll →</span>
                            </div>
                          </div>
                        </div>
                      {/each}
                    {/if}
                  </div>

                  {#if sec.viewAllLabel}
                    <div class="mt-6 text-center">
                      <span class="cio-lp-btn-secondary inline-block text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer">
                        {sec.viewAllLabel}
                      </span>
                    </div>
                  {/if}

                <!-- FEATURES SECTION CONTENT -->
                {:else if sec.type === 'features'}
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {#each sec.items as item, itemIdx (item.id)}
                      {@const isItemSelected = selectedSectionId === sec.id && selectedTargetType === item.id}
                      <div
                        class="cio-lp-feature-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs relative transition-all cursor-pointer {isItemSelected ? 'builder-selected-box ring-2 ring-blue-600' : 'hover:outline-dashed hover:outline-blue-400'}"
                        role="presentation"
                        onclick={(e) => { e.stopPropagation(); selectElement(sec.id, item.id, item.title); }}
                      >
                        {#if isItemSelected}
                          <div class="absolute -top-3.5 right-3 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded disabled:opacity-30"
                              disabled={itemIdx === 0}
                              onclick={(e) => moveSectionItem(sec, itemIdx, 'prev', e)}
                              title="Move Left"
                            >
                              <ChevronLeftIcon size={12} />
                            </button>
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded disabled:opacity-30"
                              disabled={itemIdx >= sec.items.length - 1}
                              onclick={(e) => moveSectionItem(sec, itemIdx, 'next', e)}
                              title="Move Right"
                            >
                              <ChevronRightIcon size={12} />
                            </button>
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded"
                              onclick={(e) => duplicateSectionItem(sec, itemIdx, e)}
                              title="Duplicate Item"
                            >
                              <CopyIcon size={11} />
                            </button>
                            <button
                              type="button"
                              class="p-1 hover:bg-red-500 rounded disabled:opacity-30"
                              disabled={sec.items.length <= 1}
                              onclick={(e) => deleteSectionItem(sec, itemIdx, e)}
                              title="Delete Item"
                            >
                              <TrashIcon size={11} />
                            </button>
                          </div>
                          {@render resizeOverlay(item.id, 'box', `Feature #${itemIdx + 1}`)}
                        {/if}
                        <div class="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                          <SparklesIcon size={16} />
                        </div>
                        <h3 class="text-xs font-bold text-slate-900">{item.title}</h3>
                        <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                      </div>
                    {/each}
                  </div>

                <!-- TESTIMONIALS SECTION CONTENT -->
                {:else if sec.type === 'testimonials'}
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {#each sec.items as t, tIdx (t.id)}
                      {@const isItemSelected = selectedSectionId === sec.id && selectedTargetType === t.id}
                      <div
                        class="cio-lp-testimonial-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 relative transition-all cursor-pointer {isItemSelected ? 'builder-selected-box ring-2 ring-blue-600' : 'hover:outline-dashed hover:outline-blue-400'}"
                        role="presentation"
                        onclick={(e) => { e.stopPropagation(); selectElement(sec.id, t.id, t.name); }}
                      >
                        {#if isItemSelected}
                          <div class="absolute -top-3.5 right-3 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded disabled:opacity-30"
                              disabled={tIdx === 0}
                              onclick={(e) => moveSectionItem(sec, tIdx, 'prev', e)}
                              title="Move Left"
                            >
                              <ChevronLeftIcon size={12} />
                            </button>
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded disabled:opacity-30"
                              disabled={tIdx >= sec.items.length - 1}
                              onclick={(e) => moveSectionItem(sec, tIdx, 'next', e)}
                              title="Move Right"
                            >
                              <ChevronRightIcon size={12} />
                            </button>
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded"
                              onclick={(e) => duplicateSectionItem(sec, tIdx, e)}
                              title="Duplicate Item"
                            >
                              <CopyIcon size={11} />
                            </button>
                            <button
                              type="button"
                              class="p-1 hover:bg-red-500 rounded disabled:opacity-30"
                              disabled={sec.items.length <= 1}
                              onclick={(e) => deleteSectionItem(sec, tIdx, e)}
                              title="Delete Item"
                            >
                              <TrashIcon size={11} />
                            </button>
                          </div>
                          {@render resizeOverlay(t.id, 'box', `Testimonial #${tIdx + 1}`)}
                        {/if}
                        <p class="text-xs italic text-slate-700 leading-relaxed">“{t.quote}”</p>
                        <div class="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                          <div class="size-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div class="text-xs font-bold text-slate-900">{t.name}</div>
                            <div class="text-[10px] text-slate-400">{t.role || 'Alumni'}</div>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>

                <!-- FAQ SECTION CONTENT -->
                {:else if sec.type === 'faq'}
                  <div class="mx-auto max-w-2xl space-y-3">
                    {#each sec.items as faq, faqIdx (faq.id)}
                      {@const isItemSelected = selectedSectionId === sec.id && selectedTargetType === faq.id}
                      <div
                        class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs relative transition-all cursor-pointer {isItemSelected ? 'builder-selected-box ring-2 ring-blue-600' : 'hover:outline-dashed hover:outline-blue-400'}"
                        role="presentation"
                        onclick={(e) => { e.stopPropagation(); selectElement(sec.id, faq.id, faq.question); }}
                      >
                        {#if isItemSelected}
                          <div class="absolute -top-3.5 right-3 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded disabled:opacity-30"
                              disabled={faqIdx === 0}
                              onclick={(e) => moveSectionItem(sec, faqIdx, 'prev', e)}
                              title="Move Up"
                            >
                              <ChevronUpIcon size={12} />
                            </button>
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded disabled:opacity-30"
                              disabled={faqIdx >= sec.items.length - 1}
                              onclick={(e) => moveSectionItem(sec, faqIdx, 'next', e)}
                              title="Move Down"
                            >
                              <ChevronDownIcon size={12} />
                            </button>
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded"
                              onclick={(e) => duplicateSectionItem(sec, faqIdx, e)}
                              title="Duplicate FAQ"
                            >
                              <CopyIcon size={11} />
                            </button>
                            <button
                              type="button"
                              class="p-1 hover:bg-red-500 rounded disabled:opacity-30"
                              disabled={sec.items.length <= 1}
                              onclick={(e) => deleteSectionItem(sec, faqIdx, e)}
                              title="Delete FAQ"
                            >
                              <TrashIcon size={11} />
                            </button>
                          </div>
                          {@render resizeOverlay(faq.id, 'box', `FAQ #${faqIdx + 1}`)}
                        {/if}
                        <h4 class="text-xs font-bold text-slate-900">{faq.question}</h4>
                        <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">{faq.answer}</p>
                      </div>
                    {/each}
                  </div>

                <!-- CTA SECTION CONTENT -->
                {:else if sec.type === 'cta'}
                  <div class="mx-auto max-w-2xl text-center rounded-2xl bg-blue-600 p-8 text-white shadow-xl">
                    <h2 class="text-xl font-black">{sec.title}</h2>
                    {#if sec.description}
                      <p class="mt-2 text-xs text-blue-100 max-w-md mx-auto">{sec.description}</p>
                    {/if}
                    <button class="mt-5 rounded-lg bg-white px-6 py-2.5 text-xs font-bold text-blue-600 shadow-sm hover:bg-slate-50 cursor-pointer">
                      {sec.action.label}
                    </button>
                  </div>

                <!-- STATS SECTION CONTENT -->
                {:else if sec.type === 'stats'}
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                    {#each sec.items as st, sIdx (st.id)}
                      {@const isItemSelected = selectedSectionId === sec.id && selectedTargetType === st.id}
                      <div
                        class="p-4 rounded-xl border border-slate-100 bg-slate-50 relative transition-all cursor-pointer {isItemSelected ? 'builder-selected-box ring-2 ring-blue-600' : 'hover:outline-dashed hover:outline-blue-400'}"
                        role="presentation"
                        onclick={(e) => { e.stopPropagation(); selectElement(sec.id, st.id, st.value); }}
                      >
                        {#if isItemSelected}
                          <div class="absolute -top-3.5 right-3 z-30 flex items-center gap-1 rounded-lg border border-blue-600 bg-blue-600 p-0.5 text-white shadow-xl">
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded disabled:opacity-30"
                              disabled={sIdx === 0}
                              onclick={(e) => moveSectionItem(sec, sIdx, 'prev', e)}
                              title="Move Left"
                            >
                              <ChevronLeftIcon size={12} />
                            </button>
                            <button
                              type="button"
                              class="p-1 hover:bg-blue-700 rounded disabled:opacity-30"
                              disabled={sIdx >= sec.items.length - 1}
                              onclick={(e) => moveSectionItem(sec, sIdx, 'next', e)}
                              title="Move Right"
                            >
                              <ChevronRightIcon size={12} />
                            </button>
                          </div>
                          {@render resizeOverlay(st.id, 'box', `Stat #${sIdx + 1}`)}
                        {/if}
                        <div class="text-2xl font-black text-blue-600">{st.value}</div>
                        <div class="text-xs font-semibold text-slate-600 mt-1">{st.label}</div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </section>

            <!-- Between-Section Insertion Zone -->
            <div
              class="group relative py-2 flex items-center justify-center cursor-pointer transition-all opacity-0 hover:opacity-100"
              role="presentation"
              onclick={() => onAddSectionAtIndex?.(index + 1)}
            >
              <div class="absolute inset-x-8 border-t-2 border-dashed border-blue-400"></div>
              <span class="relative z-10 flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-md hover:bg-blue-700">
                <PlusIcon size={12} />
                <span>Add Section Here</span>
              </span>
            </div>
          </div>
        {/each}

        <!-- 4. Footer -->
        <footer class="cio-lp-footer" role="presentation" onclick={() => selectElement('', 'global')}>
          <div class="cio-lp-container cio-lp-footer-inner">
            <p class="cio-lp-copyright">{doc.footer.copyrightText || `© ${new Date().getFullYear()} ${organization.name}. All rights reserved.`}</p>
          </div>
        </footer>

      </div>
    </div>
  </div>
</div>
