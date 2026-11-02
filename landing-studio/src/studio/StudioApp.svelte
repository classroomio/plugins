<script lang="ts">
  import { onMount } from 'svelte';
  import { createClassroomIOClient, type ClassroomIOClient } from '@classroomio/plugin-sdk';
  import {
    getDefaultDocumentForTemplate,
    renderLandingPage,
    validateLandingPageDocument,
    type LandingPageCourse,
    type LandingPageDocumentV1,
    type LandingPageOrganization,
    type LandingPageSectionV1,
    type LandingPageTemplateId
  } from '@cio/landing-pages';
  import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
  import CheckIcon from '@lucide/svelte/icons/check';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import LayoutTemplateIcon from '@lucide/svelte/icons/layout-template';
  import LoaderIcon from '@lucide/svelte/icons/loader-2';
  import MonitorIcon from '@lucide/svelte/icons/monitor';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import Redo2Icon from '@lucide/svelte/icons/redo-2';
  import SaveIcon from '@lucide/svelte/icons/save';
  import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
  import TabletIcon from '@lucide/svelte/icons/tablet';
  import TrashIcon from '@lucide/svelte/icons/trash-2';
  import Undo2Icon from '@lucide/svelte/icons/undo-2';
  import { StudioApiClient } from '../shared/api';
  import type { StudioLandingPageTemplate } from '../shared/types';
  import FloatingToolbar from './components/FloatingToolbar.svelte';
  import InspectorPanel from './components/InspectorPanel.svelte';
  import LivePreview from './components/LivePreview.svelte';

  type ViewportMode = 'desktop' | 'tablet' | 'mobile';
  type TargetType = 'heading' | 'subtitle' | 'button' | 'video' | 'courses' | 'contact' | 'section' | 'global' | 'badge' | 'image' | string;
  type ToolMode = 'pointer' | 'text' | 'media' | 'layers';

  type CourseListResponse = {
    items?: Array<{
      id: string;
      title: string;
      description?: string | null;
      slug?: string | null;
      imageUrl?: string | null;
      published?: boolean;
    }>;
  };

  const client: ClassroomIOClient = createClassroomIOClient();
  const api = new StudioApiClient(client);

  let templates = $state<StudioLandingPageTemplate[]>([]);
  let activeTemplate = $state<StudioLandingPageTemplate | null>(null);
  let templateName = $state('Master Class Homepage');
  let document = $state<LandingPageDocumentV1>(getDefaultDocumentForTemplate('modern'));
  let savedSnapshot = $state('');
  let isLoading = $state(true);
  let isSaving = $state(false);
  let errorMessage = $state('');
  let editorOpen = $state(false);
  let isFullPreviewOpen = $state(false);

  // Builder Canvas & Inspector State
  let viewport = $state<ViewportMode>('desktop');
  let zoom = $state<number>(1);
  let selectedSectionId = $state<string | null>('hero');
  let selectedTargetType = $state<TargetType>('heading');
  let activeTool = $state<ToolMode>('pointer');
  let isAddMenuOpen = $state(false);
  let insertAtIndex = $state<number | null>(null);

  // Undo / Redo History Stack
  let history = $state<string[]>([]);
  let historyIndex = $state<number>(-1);

  let organization = $state<LandingPageOrganization>({ id: '', name: 'Coursera Test', slug: 'coursera-test', logoUrl: null });
  let courses = $state<LandingPageCourse[]>([]);

  const isEditing = $derived(editorOpen);
  const currentSnapshot = $derived(JSON.stringify({ name: templateName.trim(), document }));
  const hasUnsavedChanges = $derived(editorOpen && currentSnapshot !== savedSnapshot);
  const canUndo = $derived(historyIndex > 0);
  const canRedo = $derived(historyIndex < history.length - 1 && history.length > 0);

  $effect(() => {
    void client.ui.setDirty(hasUnsavedChanges);
  });

  function recordSnapshot() {
    const snap = JSON.stringify(document);
    if (historyIndex >= 0 && history[historyIndex] === snap) return;
    const truncated = history.slice(0, historyIndex + 1);
    truncated.push(snap);
    if (truncated.length > 40) truncated.shift();
    history = truncated;
    historyIndex = truncated.length - 1;
  }

  function handleUndo() {
    if (historyIndex > 0) {
      historyIndex--;
      document = JSON.parse(history[historyIndex]);
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      document = JSON.parse(history[historyIndex]);
    }
  }

  onMount(async () => {
    try {
      const theme = await client.theme.get();
      globalThis.document.documentElement.setAttribute('data-theme', theme.colorScheme);
    } catch {}

    try {
      const context = await client.context.get();
      if (context.organization) {
        organization = {
          id: context.organization.id,
          name: context.organization.name,
          slug: 'coursera-test',
          logoUrl: context.organization.avatarUrl ?? null
        };
      }
    } catch {}

    try {
      const response = await client.action<CourseListResponse>('courses:list', { limit: 20, publishedOnly: true });
      courses = (response.items ?? []).flatMap((course) => {
        if (!course.slug) return [];
        return [
          {
            id: course.id,
            title: course.title,
            description: course.description ?? null,
            slug: course.slug,
            image: course.imageUrl ?? null,
            isPricing: false,
            totalLessons: 0
          }
        ];
      });
    } catch {}

    try {
      templates = await api.listTemplates();
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to load landing page templates';
    } finally {
      isLoading = false;
    }
  });

  function handleElementSelected(secId: string, targetType: TargetType, text: string) {
    selectedSectionId = secId;
    selectedTargetType = targetType;
  }

  function handleSelectSectionOnly(secId: string | null) {
    selectedSectionId = secId;
    selectedTargetType = secId === 'hero' ? 'heading' : secId ? 'section' : 'global';
  }

  function beginCreate() {
    editorOpen = true;
    activeTemplate = null;
    templateName = 'Master Class Homepage';
    document = JSON.parse(JSON.stringify(getDefaultDocumentForTemplate('modern')));
    savedSnapshot = '';
    selectedSectionId = 'hero';
    selectedTargetType = 'heading';
    activeTool = 'pointer';
    errorMessage = '';
    history = [JSON.stringify(document)];
    historyIndex = 0;
  }

  function beginEdit(template: StudioLandingPageTemplate) {
    editorOpen = true;
    activeTemplate = template;
    templateName = template.name;
    document = JSON.parse(JSON.stringify(template.document));
    savedSnapshot = JSON.stringify({ name: templateName, document });
    selectedSectionId = 'hero';
    selectedTargetType = 'heading';
    activeTool = 'pointer';
    errorMessage = '';
    history = [JSON.stringify(document)];
    historyIndex = 0;
  }

  function closeEditor() {
    if (hasUnsavedChanges && !window.confirm('Discard your unsaved changes?')) return;
    activeTemplate = null;
    templateName = '';
    savedSnapshot = '';
    editorOpen = false;
    void client.ui.setDirty(false);
  }

  function handleAddSection(type: LandingPageSectionV1['type']) {
    const newId = `sec-${Date.now()}`;
    let newSec: LandingPageSectionV1;

    switch (type) {
      case 'video':
        newSec = {
          id: newId,
          type: 'video',
          enabled: true,
          title: 'Watch How Our Academy Transforms Careers',
          subtitle: 'A quick tour inside our interactive learning environment.',
          provider: 'youtube',
          videoId: 'dQw4w9WgXcQ',
          aspectRatio: '16/9'
        };
        break;
      case 'contact':
        newSec = {
          id: newId,
          type: 'contact',
          enabled: true,
          title: 'Get In Touch',
          subtitle: 'Have questions about admissions or corporate teams? Send us a message.',
          submitLabel: 'Send Message',
          successMessage: 'Thank you! Our admissions team will reach out shortly.',
          fields: [
            { id: `f-${Date.now()}-1`, name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
            { id: `f-${Date.now()}-2`, name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'jane@example.com' },
            { id: `f-${Date.now()}-3`, name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Tell us how we can help...' }
          ]
        };
        break;
      case 'courses':
        newSec = {
          id: newId,
          type: 'courses',
          enabled: true,
          title: 'Featured Programs & Courses',
          subtitle: 'Explore our latest cohorts, self-paced masterclasses, and workshops.',
          viewAllLabel: 'Browse All Courses',
          viewAllHref: '/courses',
          maxItems: 6,
          selectedCourseIds: []
        };
        break;
      case 'features':
        newSec = {
          id: newId,
          type: 'features',
          enabled: true,
          title: 'Why Learn With Us',
          subtitle: 'Everything you need to master modern skills from world-class practitioners.',
          items: [
            { id: `f-1`, title: 'Expert-Led Masterclasses', description: 'Curriculum authored and taught by seasoned industry professionals.' },
            { id: `f-2`, title: 'Hands-on Projects', description: 'Build a production-grade portfolio that impresses hiring managers.' },
            { id: `f-3`, title: 'Verified Certificates', description: 'Earn digital credentials you can proudly share on LinkedIn.' }
          ]
        };
        break;
      case 'testimonials':
        newSec = {
          id: newId,
          type: 'testimonials',
          enabled: true,
          title: 'Loved by Learners Everywhere',
          subtitle: 'Hear how our graduates accelerated their skills and landed their dream roles.',
          items: [
            { id: `t-1`, name: 'Alex Johnson', role: 'Software Engineer', quote: 'The interactive lessons and clear real-world examples were game-changing.', rating: 5 },
            { id: `t-2`, name: 'Elena Rostova', role: 'Product Designer', quote: 'The best investment in my career. Practical, deep, and beautifully designed.', rating: 5 }
          ]
        };
        break;
      case 'faq':
        newSec = {
          id: newId,
          type: 'faq',
          enabled: true,
          title: 'Frequently Asked Questions',
          subtitle: 'Everything you need to know about curriculum access and certificates.',
          items: [
            { id: `faq-1`, question: 'How long do I have access to course content?', answer: 'You get full lifetime access to all lessons, code files, and community updates.' },
            { id: `faq-2`, question: 'Do I get a certificate upon completion?', answer: 'Yes! Upon finishing all milestone requirements, an official verifiable certificate is issued.' }
          ]
        };
        break;
      case 'cta':
        newSec = {
          id: newId,
          type: 'cta',
          enabled: true,
          title: 'Start Learning Today',
          description: 'Join ambitious students mastering new skills right now.',
          action: { label: 'Explore All Courses', href: '/courses' }
        };
        break;
      case 'stats':
        newSec = {
          id: newId,
          type: 'stats',
          enabled: true,
          title: 'Our Track Record',
          subtitle: 'Proven outcomes for students across more than 40 countries.',
          items: [
            { id: `st-1`, value: '12,000+', label: 'Active Students' },
            { id: `st-2`, value: '96%', label: 'Completion Rate' },
            { id: `st-3`, value: '4.9/5', label: 'Average Rating' }
          ]
        };
        break;
    }

    if (insertAtIndex !== null && insertAtIndex >= 0 && insertAtIndex <= document.sections.length) {
      document.sections.splice(insertAtIndex, 0, newSec);
      insertAtIndex = null;
    } else {
      document.sections.push(newSec);
    }
    selectedSectionId = newSec.id;
    selectedTargetType = 'section';
    recordSnapshot();
  }

  function handleAddSectionAtIndex(index: number) {
    insertAtIndex = index;
    isAddMenuOpen = true;
  }

  function handleSelectTool(tool: ToolMode) {
    activeTool = tool;
    if (tool === 'text') {
      selectedSectionId = 'hero';
      selectedTargetType = 'heading';
    } else if (tool === 'media') {
      // Find video section or add one
      const vid = document.sections.find((s) => s.type === 'video');
      if (vid) {
        selectedSectionId = vid.id;
        selectedTargetType = 'video';
      } else {
        handleAddSection('video');
      }
    } else if (tool === 'layers') {
      selectedSectionId = null;
      selectedTargetType = 'global';
    }
  }

  async function saveTemplate() {
    const name = templateName.trim();
    if (!name || isSaving) return;

    const validation = validateLandingPageDocument(document);
    if (!validation.success || !validation.data) {
      errorMessage = validation.error ?? 'Invalid landing page document';
      return;
    }

    isSaving = true;
    errorMessage = '';
    try {
      const cleanData = JSON.parse(JSON.stringify(validation.data));
      const saved = activeTemplate
        ? await api.updateTemplate(activeTemplate, name, cleanData)
        : await api.createTemplate(name, cleanData);
      activeTemplate = saved;
      document = JSON.parse(JSON.stringify(saved.document));
      templateName = saved.name;
      templates = [saved, ...templates.filter((template) => template.id !== saved.id)];
      savedSnapshot = JSON.stringify({ name: templateName, document });
      await client.ui.setDirty(false);
      await client.ui.toast({ message: 'Landing page template saved', variant: 'success' });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to save landing page template';
    } finally {
      isSaving = false;
    }
  }

  async function deleteTemplate(template: StudioLandingPageTemplate) {
    if (!window.confirm(`Delete “${template.name}”? Applied landing pages will keep their current design.`)) return;

    try {
      await api.deleteTemplate(template.id);
      templates = templates.filter((item) => item.id !== template.id);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Failed to delete landing page template';
    }
  }

  function renderThumbnail(template: StudioLandingPageTemplate): string {
    const rendered = renderLandingPage(template.document, {
      organization: { id: 'preview', name: organization.name, slug: '', logoUrl: organization.logoUrl },
      courses: [],
      auth: { isAuthenticated: false }
    });
    const styleOpen = '<' + 'style>';
    const styleClose = '</' + 'style>';
    return `<!doctype html><html><head><meta charset="utf-8">${styleOpen}*{box-sizing:border-box}html,body{margin:0;pointer-events:none;overflow:hidden}${rendered.css}${styleClose}</head><body>${rendered.html}</body></html>`;
  }
</script>

{#if !isEditing}
  <!-- Templates Gallery List View -->
  <div class="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
    <header class="mx-auto mb-8 flex max-w-6xl items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
      <div class="flex items-center gap-3.5">
        <div class="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <LayoutTemplateIcon class="size-5" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Landing Page Studio</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">Create reusable landing page templates for your academy.</p>
        </div>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
        onclick={beginCreate}
      >
        <PlusIcon size={15} />
        <span>Create template</span>
      </button>
    </header>

    <main class="mx-auto max-w-6xl">
      {#if errorMessage}<p class="mb-4 text-xs font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{errorMessage}</p>{/if}
      {#if isLoading}
        <div class="flex min-h-64 items-center justify-center gap-2 text-xs font-medium text-slate-500">
          <LoaderIcon class="animate-spin text-blue-600" size={18} /> Loading templates…
        </div>
      {:else if templates.length === 0}
        <div
          class="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm max-w-2xl mx-auto my-6"
        >
          <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <LayoutTemplateIcon size={26} />
          </div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">No landing page templates yet</h2>
          <p class="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Create your first reusable academy landing page. You can customize colors, typography, hero sections, and content blocks.
          </p>
          <button
            class="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
            onclick={beginCreate}
          >
            <PlusIcon size={15} />
            <span>Create template</span>
          </button>
        </div>
      {:else}
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {#each templates as template (template.id)}
            <article
              class="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                class="relative block aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 text-left border-b border-slate-100 dark:border-slate-800"
                aria-label={`Edit ${template.name}`}
                onclick={() => beginEdit(template)}
              >
                <iframe
                  title={template.name}
                  srcdoc={renderThumbnail(template)}
                  sandbox=""
                  class="pointer-events-none absolute h-[800px] w-[1280px] origin-top-left scale-[0.27] border-0"
                ></iframe>
                <div class="absolute inset-0 bg-slate-900/0 transition-colors group-hover:bg-slate-900/5"></div>
              </button>
              <div class="flex items-center justify-between gap-3 p-4">
                <button class="min-w-0 flex-1 text-left" onclick={() => beginEdit(template)}>
                  <span class="block truncate text-xs font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">{template.name}</span>
                  <span class="block text-[11px] text-slate-400 mt-0.5"
                    >Updated {new Date(template.updatedAt).toLocaleDateString()}</span
                  >
                </button>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    class="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-colors"
                    onclick={() => beginEdit(template)}
                  >
                    <PencilIcon size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    class="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                    aria-label={`Delete ${template.name}`}
                    onclick={() => deleteTemplate(template)}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </main>
  </div>
{:else}
  <!-- Visual Page Builder Screen (Exact Figma/Webflow Layout) -->
  <div
    class="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100"
  >
    <!-- 1. Top Builder Header (Streamlined & Uncramped) -->
    <header
      class="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 z-30 shadow-xs"
    >
      <!-- Left: Back & Editable Template Title & Status -->
      <div class="flex items-center gap-2.5 min-w-0">
        <button
          class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors shrink-0"
          aria-label="Back to templates"
          onclick={closeEditor}
        >
          <ArrowLeftIcon size={14} />
          <span class="hidden sm:inline">Templates</span>
        </button>

        <div class="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0"></div>

        <input
          class="w-44 sm:w-60 truncate rounded-md border border-transparent bg-transparent hover:bg-slate-50 focus:bg-white focus:border-blue-500 px-2 py-1 text-xs font-bold text-slate-900 transition-colors focus:outline-none dark:hover:bg-slate-800 dark:focus:bg-slate-900 dark:text-white"
          bind:value={templateName}
          placeholder="Template title"
        />

        <span class="inline-flex items-center gap-1.5 text-[11px] font-medium {hasUnsavedChanges ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'} whitespace-nowrap shrink-0">
          <span class="size-1.5 rounded-full {hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}"></span>
          <span>{hasUnsavedChanges ? 'Unsaved' : 'Saved'}</span>
        </span>
      </div>

      <!-- Center: Sleek Viewport Mode Switcher -->
      <div class="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 shrink-0">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all {viewport === 'desktop'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
          onclick={() => (viewport = 'desktop')}
          title="Desktop (1100px)"
        >
          <MonitorIcon size={14} />
          <span class="hidden md:inline text-[11px]">Desktop</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all {viewport === 'tablet'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
          onclick={() => (viewport = 'tablet')}
          title="Tablet (768px)"
        >
          <TabletIcon size={14} />
          <span class="hidden md:inline text-[11px]">Tablet</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all {viewport === 'mobile'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}"
          onclick={() => (viewport = 'mobile')}
          title="Mobile (375px)"
        >
          <SmartphoneIcon size={14} />
          <span class="hidden md:inline text-[11px]">Mobile</span>
        </button>
      </div>

      <!-- Right: Preview & Save Actions -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          onclick={() => (isFullPreviewOpen = true)}
          title="Fullscreen preview"
        >
          <EyeIcon size={14} />
          <span class="hidden sm:inline">Preview</span>
        </button>

        <button
          class="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all"
          disabled={isSaving || !templateName.trim() || !hasUnsavedChanges}
          onclick={saveTemplate}
        >
          {#if isSaving}
            <LoaderIcon class="animate-spin" size={14} />
            <span>Saving…</span>
          {:else}
            <SaveIcon size={14} />
            <span>Save changes</span>
          {/if}
        </button>
      </div>
    </header>

    {#if errorMessage}<div class="bg-red-50 px-4 py-2 text-xs font-medium text-red-700 border-b border-red-200">{errorMessage}</div>{/if}

    <!-- 2. Workspace Body: Left Canvas + Right Contextual Inspector -->
    <div class="flex flex-1 overflow-hidden relative">
      <!-- Main Visual Canvas Area (Center/Left) -->
      <main class="flex-1 relative overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950">
        <LivePreview
          {document}
          {organization}
          {courses}
          {viewport}
          {zoom}
          {selectedSectionId}
          {selectedTargetType}
          onSelectElement={handleElementSelected}
          onAddSectionAtIndex={handleAddSectionAtIndex}
          onChange={recordSnapshot}
          bind:isFullPreviewOpen
        />

        <!-- Floating Canvas Toolbar (Bottom-Center Island) -->
        <FloatingToolbar
          {zoom}
          {canUndo}
          {canRedo}
          {activeTool}
          bind:isAddMenuOpen
          onSelectTool={handleSelectTool}
          onAddSection={handleAddSection}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onZoomIn={() => (zoom = Math.min(1.5, Math.round((zoom + 0.1) * 10) / 10))}
          onZoomOut={() => (zoom = Math.max(0.4, Math.round((zoom - 0.1) * 10) / 10))}
          onZoomReset={() => (zoom = 1)}
        />
      </main>

      <!-- 3. Right-Hand Contextual Inspector Panel -->
      <InspectorPanel
        {document}
        {courses}
        {selectedSectionId}
        {selectedTargetType}
        onSelectSection={handleSelectSectionOnly}
        onChange={recordSnapshot}
      />
    </div>
  </div>
{/if}
