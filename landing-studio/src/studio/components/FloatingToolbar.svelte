<script lang="ts">
  import type { LandingPageSectionV1 } from '@cio/landing-pages';
  import MousePointerIcon from '@lucide/svelte/icons/mouse-pointer';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import TypeIcon from '@lucide/svelte/icons/type';
  import VideoIcon from '@lucide/svelte/icons/video';
  import LayersIcon from '@lucide/svelte/icons/layers';
  import Undo2Icon from '@lucide/svelte/icons/undo-2';
  import Redo2Icon from '@lucide/svelte/icons/redo-2';
  import ZoomInIcon from '@lucide/svelte/icons/zoom-in';
  import ZoomOutIcon from '@lucide/svelte/icons/zoom-out';
  import SparklesIcon from '@lucide/svelte/icons/sparkles';
  import MailIcon from '@lucide/svelte/icons/mail';
  import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
  import MessageSquareIcon from '@lucide/svelte/icons/message-square';
  import CircleHelpIcon from '@lucide/svelte/icons/circle-help';
  import MegaphoneIcon from '@lucide/svelte/icons/megaphone';
  import ChartBarIcon from '@lucide/svelte/icons/chart-bar';

  interface Props {
    zoom: number;
    canUndo: boolean;
    canRedo: boolean;
    activeTool: 'pointer' | 'text' | 'media' | 'layers';
    onSelectTool: (tool: 'pointer' | 'text' | 'media' | 'layers') => void;
    onAddSection: (type: LandingPageSectionV1['type']) => void;
    onUndo: () => void;
    onRedo: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
  }

  let {
    zoom,
    canUndo,
    canRedo,
    activeTool,
    onSelectTool,
    onAddSection,
    onUndo,
    onRedo,
    onZoomIn,
    onZoomOut,
    onZoomReset
  }: Props = $props();

  let isAddMenuOpen = $state(false);

  const ADD_ITEMS: Array<{
    type: LandingPageSectionV1['type'];
    label: string;
    description: string;
    icon: any;
  }> = [
    { type: 'video', label: 'Video Showcase', description: 'Embed YouTube or Vimeo video', icon: VideoIcon },
    { type: 'contact', label: 'Contact Us Form', description: 'Custom inquiry / lead capture form', icon: MailIcon },
    { type: 'courses', label: 'Courses Showcase', description: 'Curated courses or all catalog', icon: GraduationCapIcon },
    { type: 'features', label: 'Feature Highlights', description: 'Curriculum perks & key benefits', icon: SparklesIcon },
    { type: 'testimonials', label: 'Testimonials', description: 'Student reviews & social proof', icon: MessageSquareIcon },
    { type: 'faq', label: 'FAQ Accordion', description: 'Common answers for learners', icon: CircleHelpIcon },
    { type: 'cta', label: 'Call to Action', description: 'High-converting banner with button', icon: MegaphoneIcon },
    { type: 'stats', label: 'Stats & Impact', description: 'Academy metrics & numbers', icon: ChartBarIcon }
  ];

  function handleAdd(type: LandingPageSectionV1['type']) {
    isAddMenuOpen = false;
    onAddSection(type);
  }
</script>

<div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center select-none">
  <!-- Add Section Popover (floats right above the island) -->
  {#if isAddMenuOpen}
    <div
      class="fixed inset-0 z-40"
      role="presentation"
      onclick={() => (isAddMenuOpen = false)}
    ></div>

    <div
      class="relative mb-3 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <div class="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Insert Section
      </div>
      <div class="space-y-1">
        {#each ADD_ITEMS as item}
          {@const Icon = item.icon}
          <button
            type="button"
            class="flex w-full items-start gap-2.5 rounded-xl p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            onclick={() => handleAdd(item.type)}
          >
            <div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 mt-0.5">
              <Icon size={15} />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-semibold text-slate-900 dark:text-white">{item.label}</div>
              <div class="text-[10px] text-slate-500 leading-tight mt-0.5">{item.description}</div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Main Floating Island Pill -->
  <div
    class="flex items-center gap-1 rounded-2xl border border-slate-200/90 bg-white/95 px-2.5 py-1.5 text-slate-700 shadow-xl backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/95 dark:text-slate-200"
    style="box-shadow: 0 16px 36px -8px rgba(15, 23, 42, 0.2), 0 4px 12px -2px rgba(15, 23, 42, 0.1);"
  >
    <!-- Pointer / Select Tool -->
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-xl transition-all {activeTool === 'pointer'
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}"
      onclick={() => onSelectTool('pointer')}
      title="Select Tool (V)"
    >
      <MousePointerIcon size={15} />
    </button>

    <!-- Quick Add Section Button -->
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-xl transition-all {isAddMenuOpen
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}"
      onclick={() => (isAddMenuOpen = !isAddMenuOpen)}
      title="Add Section / Block (+)"
    >
      <PlusIcon size={16} />
    </button>

    <!-- Text Tool -->
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-xl transition-all {activeTool === 'text'
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}"
      onclick={() => onSelectTool('text')}
      title="Text Tool (T)"
    >
      <TypeIcon size={15} />
    </button>

    <!-- Media / Video Tool -->
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-xl transition-all {activeTool === 'media'
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}"
      onclick={() => onSelectTool('media')}
      title="Media / Video (M)"
    >
      <VideoIcon size={15} />
    </button>

    <!-- Layers Outline Tool -->
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-xl transition-all {activeTool === 'layers'
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}"
      onclick={() => onSelectTool('layers')}
      title="Layers Outline (L)"
    >
      <LayersIcon size={15} />
    </button>

    <div class="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-800"></div>

    <!-- Undo / Redo -->
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
      disabled={!canUndo}
      onclick={onUndo}
      title="Undo (Cmd+Z)"
    >
      <Undo2Icon size={14} />
    </button>
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
      disabled={!canRedo}
      onclick={onRedo}
      title="Redo (Cmd+Shift+Z)"
    >
      <Redo2Icon size={14} />
    </button>

    <div class="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-800"></div>

    <!-- Zoom Controls -->
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
      onclick={onZoomOut}
      title="Zoom Out"
    >
      <ZoomOutIcon size={13} />
    </button>

    <button
      type="button"
      class="px-2 py-1 text-xs font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
      onclick={onZoomReset}
      title="Reset to 100%"
    >
      {Math.round(zoom * 100)}%
    </button>

    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
      onclick={onZoomIn}
      title="Zoom In"
    >
      <ZoomInIcon size={13} />
    </button>
  </div>
</div>
