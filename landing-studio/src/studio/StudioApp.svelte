<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createClassroomIOClient, type ClassroomIOClient } from '@classroomio/plugin-sdk';
  import {
    getDefaultDocumentForTemplate,
    isLandingPageDocumentV1,
    TEMPLATES,
    validateLandingPageDocument,
    type LandingPageCourse,
    type LandingPageDocumentV1,
    type LandingPageOrganization,
    type LandingPageTemplateId
  } from '@cio/landing-pages';
  import LayoutTemplateIcon from '@lucide/svelte/icons/layout-template';
  import PaletteIcon from '@lucide/svelte/icons/palette';
  import GlobeIcon from '@lucide/svelte/icons/globe';
  import LayersIcon from '@lucide/svelte/icons/layers';
  import UploadCloudIcon from '@lucide/svelte/icons/upload-cloud';
  import CheckIcon from '@lucide/svelte/icons/check';
  import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';

  import TemplatePicker from './components/TemplatePicker.svelte';
  import ThemeEditor from './components/ThemeEditor.svelte';
  import HeroEditor from './components/HeroEditor.svelte';
  import SectionsEditor from './components/SectionsEditor.svelte';
  import LivePreview from './components/LivePreview.svelte';

  const client: ClassroomIOClient = createClassroomIOClient();

  type Tab = 'templates' | 'theme' | 'hero' | 'sections';
  let activeTab = $state<Tab>('templates');

  let doc = $state<LandingPageDocumentV1>(getDefaultDocumentForTemplate('bootcamp'));
  let organization = $state<LandingPageOrganization>({
    id: '',
    name: 'My Academy',
    slug: '',
    logoUrl: null
  });
  let courses = $state<LandingPageCourse[]>([]);

  let isPublishing = $state(false);
  let isDirty = $state(false);
  let saveStatus = $state<'saved' | 'saving' | 'unsaved'>('saved');
  let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleAutosave() {
    isDirty = true;
    saveStatus = 'unsaved';
    void client.ui.setDirty(true);

    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(async () => {
      saveStatus = 'saving';
      try {
        await client.storage.set('draft-document', JSON.parse(JSON.stringify(doc)), 'landing-studio', 'organization');
        saveStatus = 'saved';
      } catch (err) {
        console.warn('Autosave failed:', err);
        saveStatus = 'unsaved';
      }
    }, 1200);
  }

  function handleDocumentChange() {
    scheduleAutosave();
  }

  function handleSelectTemplate(id: LandingPageTemplateId, newDoc: LandingPageDocumentV1) {
    doc = newDoc;
    scheduleAutosave();
  }

  function handleResetToDefault() {
    doc = getDefaultDocumentForTemplate(doc.templateId);
    scheduleAutosave();
  }

  async function handlePublish() {
    if (isPublishing) return;

    const validation = validateLandingPageDocument(doc);
    if (!validation.success) {
      await client.ui.toast({
        message: `Validation error: ${validation.error}`,
        variant: 'error'
      });
      return;
    }

    isPublishing = true;
    try {
      const templateName = TEMPLATES[doc.templateId]?.name ?? doc.templateId;
      await client.action('landing-page:publish', {
        document: JSON.parse(JSON.stringify(doc)),
        templateSourceId: doc.templateId,
        templateName
      });

      isDirty = false;
      saveStatus = 'saved';
      await client.ui.setDirty(false);
      await client.ui.toast({
        message: 'Landing page published successfully! Changes are live on your academy homepage.',
        variant: 'success'
      });
    } catch (err: unknown) {
      console.error('Failed to publish landing page:', err);
      const errMsg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Unknown error';
      await client.ui.toast({
        message: `Failed to publish: ${errMsg}`,
        variant: 'error'
      });
    } finally {
      isPublishing = false;
    }
  }

  onMount(async () => {
    // 1. Sync theme
    try {
      const currentTheme = await client.theme.get();
      if (currentTheme?.colorScheme) {
        document.documentElement.setAttribute('data-theme', currentTheme.colorScheme);
      }
    } catch {}

    // 2. Fetch context
    try {
      const ctx = await client.context.get();
      if (ctx?.organization) {
        organization = {
          id: ctx.organization.id,
          name: ctx.organization.name,
          slug: '',
          logoUrl: ctx.organization.avatarUrl ?? null
        };
      }
    } catch {}

    // 3. Fetch courses
    try {
      const res = await client.action<{ courses: LandingPageCourse[] } | LandingPageCourse[]>('courses:list', {
        limit: 8,
        publishedOnly: true
      });
      if (Array.isArray(res)) {
        courses = res;
      } else if (res && typeof res === 'object' && 'courses' in res && Array.isArray(res.courses)) {
        courses = res.courses;
      }
    } catch (e) {
      console.warn('Could not load course list for preview:', e);
    }

    // 4. Load draft from plugin storage
    try {
      const saved = await client.storage.get<unknown>('draft-document', 'landing-studio', 'organization');
      if (isLandingPageDocumentV1(saved)) {
        doc = saved;
      }
    } catch (e) {
      console.warn('Could not load draft landing page document:', e);
    }
  });

  onDestroy(() => {
    if (autosaveTimer) clearTimeout(autosaveTimer);
  });
</script>

<div class="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
  <!-- Studio Top Bar -->
  <header class="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
    <div class="flex items-center gap-3">
      <div class="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
        <LayoutTemplateIcon class="size-4" />
      </div>
      <div>
        <h1 class="text-sm font-bold text-slate-900 dark:text-white leading-tight">Landing Page Studio</h1>
        <div class="flex items-center gap-2 text-[11px] text-slate-500">
          <span>Template: <strong class="text-slate-700 dark:text-slate-300 capitalize">{doc.templateId}</strong></span>
          <span>•</span>
          {#if saveStatus === 'saving'}
            <span class="text-amber-500">Saving draft...</span>
          {:else if saveStatus === 'saved'}
            <span class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckIcon class="size-2.5" />
              Draft saved
            </span>
          {:else}
            <span class="text-slate-400">Unsaved changes</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        onclick={handleResetToDefault}
        title="Reset current template to defaults"
      >
        <RotateCcwIcon class="size-3.5" />
        <span>Reset</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
        onclick={handlePublish}
        disabled={isPublishing}
      >
        <UploadCloudIcon class="size-3.5" />
        <span>{isPublishing ? 'Publishing...' : 'Publish Landing Page'}</span>
      </button>
    </div>
  </header>

  <!-- Workspace Area -->
  <div class="flex flex-1 overflow-hidden">
    <!-- Left Navigation / Tabs Column -->
    <nav class="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-slate-200 bg-white py-3 dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        class="flex flex-col items-center gap-1 rounded-xl p-2.5 text-[10px] font-medium transition-colors {activeTab === 'templates' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}"
        onclick={() => (activeTab = 'templates')}
        title="Templates"
      >
        <LayoutTemplateIcon class="size-5" />
        <span>Templates</span>
      </button>

      <button
        type="button"
        class="flex flex-col items-center gap-1 rounded-xl p-2.5 text-[10px] font-medium transition-colors {activeTab === 'theme' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}"
        onclick={() => (activeTab = 'theme')}
        title="Theme & Colors"
      >
        <PaletteIcon class="size-5" />
        <span>Theme</span>
      </button>

      <button
        type="button"
        class="flex flex-col items-center gap-1 rounded-xl p-2.5 text-[10px] font-medium transition-colors {activeTab === 'hero' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}"
        onclick={() => (activeTab = 'hero')}
        title="Hero & Navigation"
      >
        <GlobeIcon class="size-5" />
        <span>Hero</span>
      </button>

      <button
        type="button"
        class="flex flex-col items-center gap-1 rounded-xl p-2.5 text-[10px] font-medium transition-colors {activeTab === 'sections' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}"
        onclick={() => (activeTab = 'sections')}
        title="Content Sections"
      >
        <LayersIcon class="size-5" />
        <span>Sections</span>
      </button>
    </nav>

    <!-- Editor Settings Panel -->
    <div class="w-96 shrink-0 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {#if activeTab === 'templates'}
        <TemplatePicker currentDocument={doc} onSelectTemplate={handleSelectTemplate} />
      {:else if activeTab === 'theme'}
        <ThemeEditor document={doc} onChange={handleDocumentChange} />
      {:else if activeTab === 'hero'}
        <HeroEditor document={doc} onChange={handleDocumentChange} />
      {:else if activeTab === 'sections'}
        <SectionsEditor document={doc} onChange={handleDocumentChange} />
      {/if}
    </div>

    <!-- Live Preview Pane -->
    <main class="flex-1 overflow-hidden">
      <LivePreview document={doc} {organization} {courses} />
    </main>
  </div>
</div>
