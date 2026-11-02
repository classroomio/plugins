<script lang="ts">
  import {
    getDefaultDocumentForTemplate,
    TEMPLATE_LIST,
    type LandingPageDocumentV1,
    type LandingPageTemplateId
  } from '@cio/landing-pages';
  import SparklesIcon from '@lucide/svelte/icons/sparkles';
  import CheckIcon from '@lucide/svelte/icons/check';

  interface Props {
    currentDocument: LandingPageDocumentV1;
    onSelectTemplate: (templateId: LandingPageTemplateId, document: LandingPageDocumentV1) => void;
  }

  let { currentDocument, onSelectTemplate }: Props = $props();

  function handleSelect(id: LandingPageTemplateId) {
    const doc = getDefaultDocumentForTemplate(id);
    onSelectTemplate(id, doc);
  }
</script>

<div class="space-y-4 p-5">
  <div>
    <h3 class="text-base font-semibold text-slate-900 dark:text-white">Curated Templates</h3>
    <p class="text-xs text-slate-500">
      Select a foundational design template for your academy homepage. You can customize colors, fonts, and content anytime.
    </p>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    {#each TEMPLATE_LIST as tpl (tpl.id)}
      {@const isSelected = currentDocument.templateId === tpl.id}
      <button
        type="button"
        class="group relative flex flex-col rounded-xl border text-left transition-all p-4 {isSelected ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-600/20 dark:border-blue-500 dark:bg-blue-950/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900'}"
        onclick={() => handleSelect(tpl.id)}
      >
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-slate-900 dark:text-white">{tpl.name}</span>
            {#if isSelected}
              <span class="flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                <CheckIcon class="size-2.5" />
                Active
              </span>
            {/if}
          </div>
          <div
            class="size-4 rounded-full border border-slate-300 transition-colors"
            style="background-color: {tpl.document.theme.primaryColor}"
          ></div>
        </div>

        <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {tpl.description}
        </p>

        <div class="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
          <SparklesIcon class="size-3 text-blue-500" />
          <span class="capitalize">{tpl.document.theme.fontFamily.replace(/-/g, ' ')} font</span>
          <span>•</span>
          <span>{tpl.document.sections.length} sections</span>
        </div>
      </button>
    {/each}
  </div>
</div>

