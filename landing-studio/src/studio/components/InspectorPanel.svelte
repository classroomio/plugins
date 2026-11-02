<script lang="ts">
  import {
    LANDING_PAGE_FONT_FAMILIES,
    type LandingPageCourse,
    type LandingPageDocumentV1,
    type LandingPageFontFamily,
    type LandingPageSectionV1
  } from '@cio/landing-pages';
  import BoldIcon from '@lucide/svelte/icons/bold';
  import ItalicIcon from '@lucide/svelte/icons/italic';
  import UnderlineIcon from '@lucide/svelte/icons/underline';
  import TextAlignStartIcon from '@lucide/svelte/icons/text-align-start';
  import TextAlignCenterIcon from '@lucide/svelte/icons/text-align-center';
  import TextAlignEndIcon from '@lucide/svelte/icons/text-align-end';
  import TextAlignJustifyIcon from '@lucide/svelte/icons/text-align-justify';
  import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import CopyIcon from '@lucide/svelte/icons/copy';
  import TrashIcon from '@lucide/svelte/icons/trash-2';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import SearchIcon from '@lucide/svelte/icons/search';
  import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
  import LayersIcon from '@lucide/svelte/icons/layers';
  import PaletteIcon from '@lucide/svelte/icons/palette';

  interface Props {
    document: LandingPageDocumentV1;
    courses: LandingPageCourse[];
    selectedSectionId: string | null;
    selectedTargetType: 'heading' | 'subtitle' | 'button' | 'video' | 'courses' | 'contact' | 'section' | 'global';
    onSelectSection: (id: string | null) => void;
    onChange: () => void;
  }

  let {
    document: doc,
    courses = [],
    selectedSectionId,
    selectedTargetType,
    onSelectSection,
    onChange
  }: Props = $props();

  // Typography mock styling state for Figma/Webflow styling bar
  let fontWeight = $state('SemiBold 600');
  let fontSize = $derived(selectedTargetType === 'heading' ? '48px' : '16px');
  let isBold = $state(true);
  let isItalic = $state(false);
  let isUnderline = $state(false);
  let textAlign = $state<'left' | 'center' | 'right' | 'justify'>('left');
  let textColor = $state('#0F172A');
  let lineHeight = $state(1.2);
  let letterSpacing = $state('-0.02em');
  let courseSearchQuery = $state('');

  const currentSection = $derived(
    selectedSectionId && selectedSectionId !== 'hero'
      ? doc.sections.find((s) => s.id === selectedSectionId) ?? null
      : null
  );

  const currentSectionIndex = $derived(
    currentSection ? doc.sections.findIndex((s) => s.id === currentSection.id) : -1
  );

  function moveUp(index: number) {
    if (index <= 0) return;
    const item = doc.sections[index];
    doc.sections.splice(index, 1);
    doc.sections.splice(index - 1, 0, item);
    onChange();
  }

  function moveDown(index: number) {
    if (index < 0 || index >= doc.sections.length - 1) return;
    const item = doc.sections[index];
    doc.sections.splice(index, 1);
    doc.sections.splice(index + 1, 0, item);
    onChange();
  }

  function duplicateSection(sec: LandingPageSectionV1, index: number) {
    const cloned = JSON.parse(JSON.stringify(sec)) as LandingPageSectionV1;
    cloned.id = `sec-${Date.now()}`;
    if ('title' in cloned && typeof cloned.title === 'string') {
      cloned.title = `${cloned.title} (Copy)`;
    }
    doc.sections.splice(index + 1, 0, cloned);
    onSelectSection(cloned.id);
    onChange();
  }

  function deleteSection(index: number) {
    const sec = doc.sections[index];
    if (window.confirm(`Delete "${'title' in sec && sec.title ? sec.title : sec.type}" section?`)) {
      doc.sections.splice(index, 1);
      onSelectSection(doc.sections[0]?.id ?? null);
      onChange();
    }
  }

  function cleanVideoInput(raw: string, provider: 'youtube' | 'vimeo'): string {
    const trimmed = raw.trim();
    if (provider === 'youtube') {
      const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? match[1] : trimmed;
    }
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
    return vimeoMatch ? vimeoMatch[1] : trimmed;
  }

  function toggleCourseSelection(sec: Extract<LandingPageSectionV1, { type: 'courses' }>, courseId: string) {
    if (!sec.selectedCourseIds) {
      sec.selectedCourseIds = [];
    }
    const idx = sec.selectedCourseIds.indexOf(courseId);
    if (idx >= 0) {
      sec.selectedCourseIds.splice(idx, 1);
    } else {
      sec.selectedCourseIds.push(courseId);
    }
    onChange();
  }

  function addContactField(sec: Extract<LandingPageSectionV1, { type: 'contact' }>) {
    sec.fields.push({
      id: `f-${Date.now()}`,
      name: `field_${sec.fields.length + 1}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: ''
    });
    onChange();
  }

  const presetPalettes = [
    { name: 'ClassroomIO Blue', primary: '#2563eb', secondary: '#3b82f6', bg: '#0f172a' },
    { name: 'Classic Light', primary: '#2563eb', secondary: '#60a5fa', bg: '#f8fafc' },
    { name: 'Warm Amber', primary: '#ea580c', secondary: '#f59e0b', bg: '#ffffff' },
    { name: 'Minimal Dark', primary: '#18181b', secondary: '#52525b', bg: '#fafafa' },
    { name: 'Forest Emerald', primary: '#059669', secondary: '#10b981', bg: '#f0fdf4' },
    { name: 'Vibrant Violet', primary: '#7c3aed', secondary: '#a855f7', bg: '#09090b' }
  ];

  const filteredCourses = $derived(
    courseSearchQuery.trim()
      ? courses.filter((c) =>
          c.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
          c.slug.toLowerCase().includes(courseSearchQuery.toLowerCase())
        )
      : courses
  );

  const isTextElement = $derived(
    selectedTargetType === 'heading' ||
    selectedTargetType === 'subtitle' ||
    selectedTargetType === 'button'
  );
</script>

<aside class="flex h-full w-80 md:w-96 flex-col overflow-y-auto border-l border-slate-200 bg-white font-sans text-slate-900 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 select-none">
  <!-- Inspector Top Header & Breadcrumbs -->
  <div class="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Active Selection
        </span>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">
          {#if isTextElement}
            Text Styling
          {:else if currentSection}
            {'title' in currentSection && currentSection.title ? currentSection.title : `${currentSection.type} Section`}
          {:else if selectedSectionId === 'hero'}
            Hero Section
          {:else}
            Page & Theme
          {/if}
        </h3>
      </div>
      <span class="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
        {#if selectedTargetType === 'heading'}
          HeadingNode
        {:else if selectedTargetType === 'subtitle'}
          TextNode
        {:else if selectedTargetType === 'button'}
          ButtonNode
        {:else if currentSection}
          {currentSection.type.toUpperCase()}
        {:else}
          DOCUMENT
        {/if}
      </span>
    </div>

    <!-- Breadcrumb Hierarchy -->
    <div class="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
      <span>Page</span>
      <span>›</span>
      {#if selectedSectionId === 'hero'}
        <span>Hero Section</span>
        {#if isTextElement}
          <span>›</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200">
            {selectedTargetType === 'heading' ? 'Heading 1' : selectedTargetType === 'subtitle' ? 'Subtitle' : 'Action Button'}
          </span>
        {/if}
      {:else if currentSection}
        <span>Sections</span>
        <span>›</span>
        <span class="font-semibold text-slate-800 dark:text-slate-200">{currentSection.type}</span>
      {:else}
        <span class="font-semibold text-slate-800 dark:text-slate-200">Theme & Settings</span>
      {/if}
    </div>
  </div>

  <!-- Inspector Body Sections -->
  <div class="flex-1 space-y-6 p-5">
    
    <!-- 1. TEXT EDITING & TYPOGRAPHY PANEL (Matches User Screenshot Exactly) -->
    {#if isTextElement || (selectedSectionId === 'hero' && !currentSection)}
      <!-- Live Content Field -->
      <div class="space-y-1.5">
        <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Text Content</span>
        {#if selectedTargetType === 'heading'}
          {#if selectedSectionId === 'hero'}
            <textarea
              rows="3"
              bind:value={doc.hero.headline}
              oninput={onChange}
              class="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              placeholder="Hero headline"
            ></textarea>
          {:else if currentSection && 'title' in currentSection}
            <textarea
              rows="3"
              bind:value={currentSection.title}
              oninput={onChange}
              class="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              placeholder="Section title"
            ></textarea>
          {/if}
        {:else if selectedTargetType === 'subtitle'}
          {#if selectedSectionId === 'hero'}
            <textarea
              rows="3"
              bind:value={doc.hero.subheadline}
              oninput={onChange}
              class="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              placeholder="Hero subtitle"
            ></textarea>
          {:else if currentSection && 'subtitle' in currentSection}
            <textarea
              rows="3"
              bind:value={currentSection.subtitle}
              oninput={onChange}
              class="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              placeholder="Section subtitle"
            ></textarea>
          {/if}
        {:else if selectedTargetType === 'button'}
          {#if selectedSectionId === 'hero'}
            <input
              type="text"
              bind:value={doc.hero.primaryAction.label}
              oninput={onChange}
              class="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              placeholder="Button label"
            />
          {/if}
        {/if}
      </div>

      <!-- Typography Section -->
      <div class="space-y-3.5 border-t border-slate-100 pt-4 dark:border-slate-800">
        <h4 class="text-xs font-bold text-slate-900 dark:text-white">Typography</h4>

        <!-- Font Family Selector -->
        <div class="space-y-1">
          <span class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">Font Family</span>
          <select
            bind:value={doc.theme.fontFamily}
            onchange={onChange}
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-950"
          >
            {#each LANDING_PAGE_FONT_FAMILIES as font}
              <option value={font}>{font}</option>
            {/each}
          </select>
        </div>

        <!-- Font Weight & Size Row -->
        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1">
            <span class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">Weight</span>
            <select
              bind:value={fontWeight}
              class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-950"
            >
              <option value="Regular 400">Regular 400</option>
              <option value="Medium 500">Medium 500</option>
              <option value="SemiBold 600">SemiBold 600</option>
              <option value="Bold 700">Bold 700</option>
              <option value="Black 900">Black 900</option>
            </select>
          </div>
          <div class="space-y-1">
            <span class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">Size</span>
            <input
              type="text"
              bind:value={fontSize}
              class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <!-- Formatting & Alignment Row -->
        <div class="grid grid-cols-2 gap-2">
          <!-- Text Formatting (B, I, U) -->
          <div class="space-y-1">
            <span class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">Formatting</span>
            <div class="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                class="flex-1 rounded p-1.5 text-xs font-bold transition-all {isBold ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800' : 'text-slate-500'}"
                onclick={() => (isBold = !isBold)}
              >
                <BoldIcon size={12} class="mx-auto" />
              </button>
              <button
                type="button"
                class="flex-1 rounded p-1.5 text-xs font-bold transition-all {isItalic ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800' : 'text-slate-500'}"
                onclick={() => (isItalic = !isItalic)}
              >
                <ItalicIcon size={12} class="mx-auto" />
              </button>
              <button
                type="button"
                class="flex-1 rounded p-1.5 text-xs font-bold transition-all {isUnderline ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800' : 'text-slate-500'}"
                onclick={() => (isUnderline = !isUnderline)}
              >
                <UnderlineIcon size={12} class="mx-auto" />
              </button>
            </div>
          </div>

          <!-- Alignment -->
          <div class="space-y-1">
            <span class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">Alignment</span>
            <div class="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                class="flex-1 rounded p-1.5 text-xs transition-all {textAlign === 'left' ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800' : 'text-slate-500'}"
                onclick={() => (textAlign = 'left')}
              >
                <TextAlignStartIcon size={12} class="mx-auto" />
              </button>
              <button
                type="button"
                class="flex-1 rounded p-1.5 text-xs transition-all {textAlign === 'center' ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800' : 'text-slate-500'}"
                onclick={() => (textAlign = 'center')}
              >
                <TextAlignCenterIcon size={12} class="mx-auto" />
              </button>
              <button
                type="button"
                class="flex-1 rounded p-1.5 text-xs transition-all {textAlign === 'right' ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800' : 'text-slate-500'}"
                onclick={() => (textAlign = 'right')}
              >
                <TextAlignEndIcon size={12} class="mx-auto" />
              </button>
              <button
                type="button"
                class="flex-1 rounded p-1.5 text-xs transition-all {textAlign === 'justify' ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-800' : 'text-slate-500'}"
                onclick={() => (textAlign = 'justify')}
              >
                <TextAlignJustifyIcon size={12} class="mx-auto" />
              </button>
            </div>
          </div>
        </div>

        <!-- Color Swatch & Hex -->
        <div class="space-y-1">
          <span class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">Text Color</span>
          <div class="flex items-center gap-2">
            <input
              type="color"
              bind:value={textColor}
              class="size-8 cursor-pointer rounded-lg border border-slate-200 p-0.5"
            />
            <input
              type="text"
              bind:value={textColor}
              class="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono font-bold uppercase text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <!-- Line Height & Letter Spacing -->
        <div class="space-y-2 pt-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-600 dark:text-slate-400">Line Height</span>
            <input
              type="number"
              step="0.1"
              min="0.8"
              max="2.5"
              bind:value={lineHeight}
              class="w-16 rounded border border-slate-200 px-2 py-0.5 text-right text-xs font-mono dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-600 dark:text-slate-400">Letter Spacing</span>
            <input
              type="text"
              bind:value={letterSpacing}
              class="w-16 rounded border border-slate-200 px-2 py-0.5 text-right text-xs font-mono dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
        </div>
      </div>

      <!-- Layout & Spacing Section -->
      <div class="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <h4 class="text-xs font-bold text-slate-900 dark:text-white">Layout & Spacing</h4>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="rounded-lg border border-slate-200 p-2 text-center dark:border-slate-800">
            <span class="block text-[10px] text-slate-400 uppercase font-semibold">Margin Bottom</span>
            <span class="font-bold text-slate-900 dark:text-white text-xs mt-1 block">16px</span>
          </div>
          <div class="rounded-lg border border-slate-200 p-2 text-center dark:border-slate-800">
            <span class="block text-[10px] text-slate-400 uppercase font-semibold">Padding X</span>
            <span class="font-bold text-slate-900 dark:text-white text-xs mt-1 block">24px</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- 2. SECTION SPECIFIC CONTROLS (Video, Contact, Courses, etc.) -->
    {#if currentSection}
      <!-- Section Action Ribbon -->
      <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950">
        <div class="flex items-center gap-1.5 text-xs font-semibold">
          <span class="uppercase tracking-wider text-[10px] text-blue-600 font-bold">{currentSection.type}</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800"
            disabled={currentSectionIndex === 0}
            onclick={() => moveUp(currentSectionIndex)}
            title="Move Up"
          >
            <ChevronUpIcon size={14} />
          </button>
          <button
            type="button"
            class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800"
            disabled={currentSectionIndex >= doc.sections.length - 1}
            onclick={() => moveDown(currentSectionIndex)}
            title="Move Down"
          >
            <ChevronDownIcon size={14} />
          </button>
          <button
            type="button"
            class="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
            onclick={() => duplicateSection(currentSection, currentSectionIndex)}
            title="Duplicate Section"
          >
            <CopyIcon size={13} />
          </button>
          <button
            type="button"
            class="rounded p-1 text-slate-400 hover:bg-slate-100"
            onclick={() => { currentSection.enabled = !currentSection.enabled; onChange(); }}
            title={currentSection.enabled ? 'Hide Section' : 'Show Section'}
          >
            {#if currentSection.enabled}
              <EyeIcon size={13} class="text-blue-600" />
            {:else}
              <EyeOffIcon size={13} />
            {/if}
          </button>
          <button
            type="button"
            class="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
            onclick={() => deleteSection(currentSectionIndex)}
            title="Delete Section"
          >
            <TrashIcon size={13} />
          </button>
        </div>
      </div>

      <!-- Section Title & Subtitle Inputs -->
      {#if 'title' in currentSection && typeof currentSection.title === 'string'}
        <div class="space-y-1">
          <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Section Title</span>
          <input
            type="text"
            bind:value={currentSection.title}
            oninput={onChange}
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      {/if}

      {#if 'subtitle' in currentSection}
        <div class="space-y-1">
          <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Subtitle / Description</span>
          <textarea
            rows="2"
            bind:value={currentSection.subtitle}
            oninput={onChange}
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          ></textarea>
        </div>
      {/if}

      <!-- VIDEO SPECIFIC -->
      {#if currentSection.type === 'video'}
        <div class="space-y-3 pt-2">
          <div class="space-y-1">
            <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Video Platform</span>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all {currentSection.provider === 'youtube'
                  ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'}"
                onclick={() => { currentSection.provider = 'youtube'; onChange(); }}
              >
                YouTube
              </button>
              <button
                type="button"
                class="flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all {currentSection.provider === 'vimeo'
                  ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'}"
                onclick={() => { currentSection.provider = 'vimeo'; onChange(); }}
              >
                Vimeo
              </button>
            </div>
          </div>

          <div class="space-y-1">
            <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Video ID or URL</span>
            <input
              type="text"
              value={currentSection.videoId}
              oninput={(e) => {
                currentSection.videoId = cleanVideoInput((e.target as HTMLInputElement).value, currentSection.provider);
                onChange();
              }}
              placeholder={currentSection.provider === 'youtube' ? 'e.g. dQw4w9WgXcQ' : 'e.g. 76979871'}
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono shadow-sm dark:border-slate-800 dark:bg-slate-950"
            />
            <span class="text-[10px] text-slate-400">Paste a full YouTube/Vimeo link or ID.</span>
          </div>

          <div class="space-y-1">
            <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Aspect Ratio</span>
            <div class="grid grid-cols-3 gap-2">
              {#each ['16/9', '4/3', '1/1'] as ratio}
                <button
                  type="button"
                  class="rounded-lg border py-1 text-xs font-medium transition-all {currentSection.aspectRatio === ratio || (!currentSection.aspectRatio && ratio === '16/9')
                    ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'}"
                  onclick={() => { currentSection.aspectRatio = ratio as '16/9' | '4/3' | '1/1'; onChange(); }}
                >
                  {ratio}
                </button>
              {/each}
            </div>
          </div>
        </div>

      <!-- CONTACT SPECIFIC -->
      {:else if currentSection.type === 'contact'}
        <div class="space-y-3 pt-2">
          <div class="space-y-1">
            <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Submit Button Text</span>
            <input
              type="text"
              bind:value={currentSection.submitLabel}
              oninput={onChange}
              placeholder="Send Message"
              class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
          <div class="space-y-1">
            <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Success Notice</span>
            <input
              type="text"
              bind:value={currentSection.successMessage}
              oninput={onChange}
              placeholder="Thank you! We'll reply soon."
              class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <!-- Form Fields Manager -->
          <div class="space-y-2 pt-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Fields ({currentSection.fields.length})</span>
              <button
                type="button"
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                onclick={() => addContactField(currentSection)}
              >
                <PlusIcon size={12} /> Add Field
              </button>
            </div>
            {#each currentSection.fields as field, fIdx}
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950 space-y-1.5">
                <div class="flex items-center justify-between gap-1.5">
                  <input
                    type="text"
                    bind:value={field.label}
                    oninput={onChange}
                    placeholder="Field Label"
                    class="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                  <select
                    bind:value={field.type}
                    onchange={onChange}
                    class="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="textarea">Long Text</option>
                  </select>
                  <button
                    type="button"
                    class="p-1 text-slate-400 hover:text-red-500"
                    onclick={() => { currentSection.fields.splice(fIdx, 1); onChange(); }}
                  >
                    <TrashIcon size={12} />
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>

      <!-- COURSES SPECIFIC -->
      {:else if currentSection.type === 'courses'}
        <div class="space-y-3 pt-2">
          <div class="space-y-1">
            <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Catalog Mode</span>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all {!currentSection.selectedCourseIds || currentSection.selectedCourseIds.length === 0
                  ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'}"
                onclick={() => { currentSection.selectedCourseIds = []; onChange(); }}
              >
                All Published
              </button>
              <button
                type="button"
                class="flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all {currentSection.selectedCourseIds && currentSection.selectedCourseIds.length > 0
                  ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'}"
                onclick={() => {
                  if (!currentSection.selectedCourseIds || currentSection.selectedCourseIds.length === 0) {
                    currentSection.selectedCourseIds = courses.slice(0, 3).map((c) => c.id);
                  }
                  onChange();
                }}
              >
                Selected ({currentSection.selectedCourseIds ? currentSection.selectedCourseIds.length : 0})
              </button>
            </div>
          </div>

          <!-- Course Checklist -->
          {#if currentSection.selectedCourseIds && currentSection.selectedCourseIds.length > 0}
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950 space-y-2">
              <div class="relative">
                <SearchIcon size={13} class="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  bind:value={courseSearchQuery}
                  placeholder="Filter courses..."
                  class="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div class="max-h-40 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
                {#each filteredCourses as course (course.id)}
                  {@const isChecked = (currentSection.selectedCourseIds ?? []).includes(course.id)}
                  <label class="flex items-center gap-2 py-1 px-1 hover:bg-white dark:hover:bg-slate-900 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onchange={() => toggleCourseSelection(currentSection, course.id)}
                      class="size-3.5 rounded border-slate-300 text-blue-600"
                    />
                    <span class="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1">{course.title}</span>
                  </label>
                {/each}
              </div>
            </div>
          {/if}

          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">View All Label</span>
              <input
                type="text"
                bind:value={currentSection.viewAllLabel}
                oninput={onChange}
                class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div class="space-y-1">
              <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">View All Link</span>
              <input
                type="text"
                bind:value={currentSection.viewAllHref}
                oninput={onChange}
                class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>
        </div>
      {/if}
    {/if}

    <!-- 3. GLOBAL THEME & PAGE OUTLINE (When nothing specific is selected) -->
    {#if !isTextElement && !currentSection && selectedSectionId !== 'hero'}
      <!-- Preset Color Palettes -->
      <div class="space-y-2">
        <div class="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
          <PaletteIcon size={14} class="text-blue-600" />
          <span>Brand Color Presets</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          {#each presetPalettes as p}
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-xs font-medium hover:bg-white dark:border-slate-800 dark:bg-slate-950"
              onclick={() => {
                doc.theme.primaryColor = p.primary;
                doc.theme.secondaryColor = p.secondary;
                doc.theme.backgroundColor = p.bg;
                onChange();
              }}
            >
              <div class="flex -space-x-1">
                <span class="size-3 rounded-full border border-white" style="background-color: {p.primary}"></span>
                <span class="size-3 rounded-full border border-white" style="background-color: {p.secondary}"></span>
                <span class="size-3 rounded-full border border-white" style="background-color: {p.bg}"></span>
              </div>
              <span class="truncate text-[11px] font-semibold">{p.name}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Color Pickers -->
      <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-700 dark:text-slate-300">Primary Color</span>
          <div class="flex items-center gap-1.5">
            <input type="color" bind:value={doc.theme.primaryColor} onchange={onChange} class="size-6 cursor-pointer rounded" />
            <span class="font-mono text-xs">{doc.theme.primaryColor}</span>
          </div>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-700 dark:text-slate-300">Secondary Color</span>
          <div class="flex items-center gap-1.5">
            <input type="color" bind:value={doc.theme.secondaryColor} onchange={onChange} class="size-6 cursor-pointer rounded" />
            <span class="font-mono text-xs">{doc.theme.secondaryColor}</span>
          </div>
        </div>
      </div>

      <!-- Page Sections Tree -->
      <div class="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <LayersIcon size={14} class="text-blue-600" />
            <span>Page Sections ({doc.sections.length})</span>
          </div>
        </div>

        <div class="space-y-1.5">
          <!-- Hero Row -->
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-xs font-semibold hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-950"
            onclick={() => onSelectSection('hero')}
          >
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Hero Section</span>
            <span class="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">HERO</span>
          </button>

          <!-- Sections Rows -->
          {#each doc.sections as sec, idx (sec.id)}
            <div
              class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-left text-xs hover:border-blue-400 dark:border-slate-800 dark:bg-slate-950 transition-colors"
            >
              <button
                type="button"
                class="flex items-center gap-2 flex-1 min-w-0 text-left"
                onclick={() => onSelectSection(sec.id)}
              >
                <span class="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  {sec.type}
                </span>
                <span class="truncate font-semibold text-slate-900 dark:text-white">
                  {'title' in sec && sec.title ? sec.title : `${sec.type} section`}
                </span>
              </button>

              <div class="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  class="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  disabled={idx === 0}
                  onclick={() => moveUp(idx)}
                >
                  <ChevronUpIcon size={13} />
                </button>
                <button
                  type="button"
                  class="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  disabled={idx >= doc.sections.length - 1}
                  onclick={() => moveDown(idx)}
                >
                  <ChevronDownIcon size={13} />
                </button>
                <button
                  type="button"
                  class="rounded p-1 text-slate-400 hover:text-red-500"
                  onclick={() => deleteSection(idx)}
                >
                  <TrashIcon size={13} />
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</aside>
