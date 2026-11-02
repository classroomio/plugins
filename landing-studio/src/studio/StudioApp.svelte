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
    type LandingPageTemplateId
  } from '@cio/landing-pages';
  import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
  import CheckIcon from '@lucide/svelte/icons/check';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import GlobeIcon from '@lucide/svelte/icons/globe';
  import LayersIcon from '@lucide/svelte/icons/layers';
  import LayoutTemplateIcon from '@lucide/svelte/icons/layout-template';
  import LoaderIcon from '@lucide/svelte/icons/loader-2';
  import PaletteIcon from '@lucide/svelte/icons/palette';
  import PanelLeftCloseIcon from '@lucide/svelte/icons/panel-left-close';
  import PanelLeftOpenIcon from '@lucide/svelte/icons/panel-left-open';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import SaveIcon from '@lucide/svelte/icons/save';
  import TrashIcon from '@lucide/svelte/icons/trash-2';
  import { StudioApiClient } from '../shared/api';
  import type { StudioLandingPageTemplate } from '../shared/types';
  import HeroEditor from './components/HeroEditor.svelte';
  import LivePreview from './components/LivePreview.svelte';
  import SectionsEditor from './components/SectionsEditor.svelte';
  import TemplatePicker from './components/TemplatePicker.svelte';
  import ThemeEditor from './components/ThemeEditor.svelte';

  type Tab = 'sections' | 'hero' | 'theme' | 'templates';
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
  let activeTab = $state<Tab>('sections');
  let selectedSectionId = $state<string | null>(null);
  let templates = $state<StudioLandingPageTemplate[]>([]);
  let activeTemplate = $state<StudioLandingPageTemplate | null>(null);
  let templateName = $state('');
  let document = $state<LandingPageDocumentV1>(getDefaultDocumentForTemplate('modern'));
  let savedSnapshot = $state('');
  let isLoading = $state(true);
  let isSaving = $state(false);
  let errorMessage = $state('');
  let editorOpen = $state(false);
  let isSidebarCollapsed = $state(false);
  let isFullPreviewOpen = $state(false);
  let organization = $state<LandingPageOrganization>({ id: '', name: 'My Academy', slug: '', logoUrl: null });
  let courses = $state<LandingPageCourse[]>([]);
  const isEditing = $derived(editorOpen);
  const currentSnapshot = $derived(JSON.stringify({ name: templateName.trim(), document }));
  const hasUnsavedChanges = $derived(editorOpen && currentSnapshot !== savedSnapshot);

  $effect(() => {
    void client.ui.setDirty(hasUnsavedChanges);
  });

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
          slug: '',
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

  function handleSectionSelected(id: string | null) {
    selectedSectionId = id;
    if (id === 'hero') {
      activeTab = 'hero';
    } else if (id) {
      activeTab = 'sections';
    }
  }

  function beginCreate() {
    editorOpen = true;
    activeTemplate = null;
    templateName = 'Untitled landing page';
    document = JSON.parse(JSON.stringify(getDefaultDocumentForTemplate('modern')));
    savedSnapshot = '';
    activeTab = 'sections';
    selectedSectionId = document.sections[0]?.id ?? null;
    errorMessage = '';
    isSidebarCollapsed = false;
  }

  function beginEdit(template: StudioLandingPageTemplate) {
    editorOpen = true;
    activeTemplate = template;
    templateName = template.name;
    document = JSON.parse(JSON.stringify(template.document));
    savedSnapshot = JSON.stringify({ name: templateName, document });
    activeTab = 'sections';
    selectedSectionId = document.sections[0]?.id ?? null;
    errorMessage = '';
    isSidebarCollapsed = false;
  }

  function closeEditor() {
    if (hasUnsavedChanges && !window.confirm('Discard your unsaved changes?')) return;
    activeTemplate = null;
    templateName = '';
    savedSnapshot = '';
    editorOpen = false;
    void client.ui.setDirty(false);
  }

  function handleSelectTemplate(id: LandingPageTemplateId, nextDocument: LandingPageDocumentV1) {
    document = JSON.parse(JSON.stringify(nextDocument));
    selectedSectionId = document.sections[0]?.id ?? null;
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
  <div
    class="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100"
  >
    <!-- Studio Header (ClassroomIO standard 56px header) -->
    <header
      class="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 z-30"
    >
      <div class="flex min-w-0 items-center gap-3">
        <button
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          aria-label="Back to templates"
          onclick={closeEditor}
        >
          <ArrowLeftIcon size={14} />
          <span>Templates</span>
        </button>
        <div class="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
        <div class="flex items-center gap-2">
          <label for="editor-template-name" class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Template:</label>
          <input
            id="editor-template-name"
            class="w-60 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-900 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            bind:value={templateName}
            aria-label="Template name"
            placeholder="Template name"
          />
        </div>
        {#if !hasUnsavedChanges}
          <span class="hidden sm:flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckIcon size={12} /> Saved
          </span>
        {:else}
          <span class="hidden sm:flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <span class="size-1.5 rounded-full bg-amber-500 animate-pulse"></span> Unsaved changes
          </span>
        {/if}
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          onclick={() => (isSidebarCollapsed = !isSidebarCollapsed)}
          title={isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          {#if isSidebarCollapsed}
            <PanelLeftOpenIcon size={14} />
            <span class="hidden md:inline">Show sidebar</span>
          {:else}
            <PanelLeftCloseIcon size={14} />
            <span class="hidden md:inline">Hide sidebar</span>
          {/if}
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          onclick={() => (isFullPreviewOpen = true)}
          title="Open full page preview"
        >
          <EyeIcon size={14} />
          <span class="hidden sm:inline">Preview</span>
        </button>

        <button
          class="flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all"
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

    <!-- Workspace Body -->
    <div class="flex flex-1 overflow-hidden relative">
      {#if !isSidebarCollapsed}
        <!-- Left vertical tab icon strip -->
        <nav
          class="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-white py-3 dark:border-slate-800 dark:bg-slate-900 z-20"
        >
          {#each [{ id: 'sections', label: 'Sections', icon: LayersIcon }, { id: 'hero', label: 'Hero', icon: GlobeIcon }, { id: 'theme', label: 'Theme', icon: PaletteIcon }, { id: 'templates', label: 'Templates', icon: LayoutTemplateIcon }] as item (item.id)}
            {@const Icon = item.icon}
            {@const isActive = activeTab === item.id}
            <button
              class="relative flex w-12 flex-col items-center gap-1 rounded-xl p-2 text-[10px] font-semibold transition-all {isActive
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}"
              onclick={() => (activeTab = item.id as Tab)}
            >
              {#if isActive}
                <span class="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-600"></span>
              {/if}
              <Icon class="size-4" />
              <span>{item.label}</span>
            </button>
          {/each}
        </nav>

        <!-- Sub-editor sidebar -->
        <aside
          class="w-80 md:w-96 shrink-0 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 z-10 shadow-sm"
        >
          {#if activeTab === 'sections'}
            <SectionsEditor
              {document}
              {courses}
              {selectedSectionId}
              onSelectSection={handleSectionSelected}
              onChange={() => {}}
            />
          {:else if activeTab === 'hero'}
            <HeroEditor {document} onChange={() => {}} />
          {:else if activeTab === 'theme'}
            <ThemeEditor {document} onChange={() => {}} />
          {:else}
            <TemplatePicker currentDocument={document} onSelectTemplate={handleSelectTemplate} />
          {/if}
        </aside>
      {/if}

      <!-- Main Canvas Stage -->
      <main class="flex-1 overflow-hidden relative">
        <LivePreview
          {document}
          {organization}
          {courses}
          {selectedSectionId}
          onSelectSection={handleSectionSelected}
          bind:isFullPreviewOpen
        />
      </main>
    </div>
  </div>
{/if}
