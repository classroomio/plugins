<script lang="ts">
  import {
    generateLandingPageCss,
    type LandingPageCourse,
    type LandingPageDocumentV1,
    type LandingPageOrganization,
    type LandingPageSectionV1
  } from '@cio/landing-pages';
  import LockIcon from '@lucide/svelte/icons/lock';
  import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
  import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
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
    selectedTargetType?: 'heading' | 'subtitle' | 'button' | 'video' | 'courses' | 'contact' | 'section' | 'global';
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
  const isBadgeSelected = $derived(selectedSectionId === 'hero' && selectedTargetType === 'subtitle' && !!doc.hero.badge);
  const isSubheadlineSelected = $derived(selectedSectionId === 'hero' && selectedTargetType === 'subtitle' && !doc.hero.badge);
  const isPrimaryActionSelected = $derived(selectedSectionId === 'hero' && selectedTargetType === 'button');

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
    width: 8px;
    height: 8px;
    background: #ffffff !important;
    border: 2px solid #2563eb !important;
    border-radius: 1.5px;
    pointer-events: none;
    z-index: 50;
  }
  :global(.builder-handle-tl) { top: -8px; left: -8px; }
  :global(.builder-handle-tr) { top: -8px; right: -8px; }
  :global(.builder-handle-bl) { bottom: -8px; left: -8px; }
  :global(.builder-handle-br) { bottom: -8px; right: -8px; }
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
    box-shadow: 0 2px 6px rgba(0,0,0,0.18);
  }
</style>

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

          <div class="cio-lp-container cio-lp-hero-grid {doc.hero.mediaType === 'none' || !doc.hero.mediaUrl ? 'no-media' : ''}">
            <div class="cio-lp-hero-content">
              <!-- Hero Badge -->
              {#if doc.hero.badge}
                <div
                  class="cio-lp-hero-badge inline-block cursor-pointer transition-all {isBadgeSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
                  role="presentation"
                  contenteditable={editingInlineTarget === 'hero-badge'}
                  onclick={(e) => { e.stopPropagation(); selectElement('hero', 'subtitle', doc.hero.badge ?? ''); }}
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
                    <div class="builder-handle builder-handle-tl"></div>
                    <div class="builder-handle builder-handle-tr"></div>
                    <div class="builder-handle builder-handle-bl"></div>
                    <div class="builder-handle builder-handle-br"></div>
                    <div class="builder-tag">Badge</div>
                  {/if}
                </div>
              {/if}

              <!-- Hero Headline (Heading 1) -->
              <h1
                class="cio-lp-hero-title cursor-pointer transition-all {isHeadlineSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
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
                  <div class="builder-handle builder-handle-tl"></div>
                  <div class="builder-handle builder-handle-tr"></div>
                  <div class="builder-handle builder-handle-bl"></div>
                  <div class="builder-handle builder-handle-br"></div>
                  <div class="builder-tag">Hero Section &gt; Heading 1</div>
                {/if}
              </h1>

              <!-- Hero Subheadline -->
              {#if doc.hero.subheadline}
                <p
                  class="cio-lp-hero-sub cursor-pointer transition-all {isSubheadlineSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
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
                    <span class="builder-handle builder-handle-tl"></span>
                    <span class="builder-handle builder-handle-tr"></span>
                    <span class="builder-handle builder-handle-bl"></span>
                    <span class="builder-handle builder-handle-br"></span>
                    <span class="builder-tag">Hero Subtitle</span>
                  {/if}
                </p>
              {/if}

              <!-- Hero Action Buttons -->
              <div class="cio-lp-hero-actions">
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
                  {#if isPrimaryActionSelected}
                    <div class="builder-handle builder-handle-tl"></div>
                    <div class="builder-handle builder-handle-tr"></div>
                    <div class="builder-handle builder-handle-bl"></div>
                    <div class="builder-handle builder-handle-br"></div>
                    <div class="builder-tag">Primary Action Button</div>
                  {/if}
                </button>

                {#if doc.hero.secondaryAction}
                  <button
                    type="button"
                    class="cio-lp-btn-secondary cursor-pointer"
                    onclick={(e) => { e.stopPropagation(); selectElement('hero', 'button', doc.hero.secondaryAction?.label ?? ''); }}
                  >
                    {doc.hero.secondaryAction.label}
                  </button>
                {/if}
              </div>
            </div>

            <!-- Hero Image / Media -->
            {#if doc.hero.mediaType === 'image' && doc.hero.mediaUrl}
              <div
                class="cio-lp-hero-media cursor-pointer"
                role="presentation"
                onclick={(e) => { e.stopPropagation(); selectElement('hero', 'section'); }}
              >
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
                        <div class="builder-handle builder-handle-tl"></div>
                        <div class="builder-handle builder-handle-tr"></div>
                        <div class="builder-handle builder-handle-bl"></div>
                        <div class="builder-handle builder-handle-br"></div>
                        <div class="builder-tag">{sec.type.toUpperCase()} &gt; Title</div>
                      {/if}
                    </h2>
                    {#if 'subtitle' in sec && sec.subtitle}
                      <p
                        class="cio-lp-section-sub cursor-pointer transition-all {isSecSubSelected ? 'builder-selected-box' : 'hover:outline-dashed hover:outline-blue-400'}"
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
                          <span class="builder-handle builder-handle-tl"></span>
                          <span class="builder-handle builder-handle-tr"></span>
                          <span class="builder-handle builder-handle-bl"></span>
                          <span class="builder-handle builder-handle-br"></span>
                          <span class="builder-tag">{sec.type.toUpperCase()} &gt; Subtitle</span>
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
                          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {f.label} {#if f.required}<span class="text-red-500">*</span>{/if}
                          </label>
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
                    {#each sec.items as item}
                      <div class="cio-lp-feature-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
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
                    {#each sec.items as t}
                      <div class="cio-lp-testimonial-card rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
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
                    {#each sec.items as faq}
                      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
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
                    {#each sec.items as st}
                      <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
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
