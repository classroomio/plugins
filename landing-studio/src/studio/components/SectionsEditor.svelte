<script lang="ts">
  import type {
    LandingPageDocumentV1,
    LandingPageSectionV1
  } from '@cio/landing-pages';
  import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import TrashIcon from '@lucide/svelte/icons/trash';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';

  interface Props {
    document: LandingPageDocumentV1;
    onChange: () => void;
  }

  let { document: doc, onChange }: Props = $props();

  let expandedSectionId = $state<string | null>(null);

  $effect(() => {
    if (expandedSectionId === null && doc.sections[0]?.id) {
      expandedSectionId = doc.sections[0].id;
    }
  });

  function toggleSection(sec: LandingPageSectionV1) {
    sec.enabled = !sec.enabled;
    onChange();
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const item = doc.sections[index];
    doc.sections.splice(index, 1);
    doc.sections.splice(index - 1, 0, item);
    onChange();
  }

  function moveDown(index: number) {
    if (index >= doc.sections.length - 1) return;
    const item = doc.sections[index];
    doc.sections.splice(index, 1);
    doc.sections.splice(index + 1, 0, item);
    onChange();
  }

  function addFeatureItem(sec: Extract<LandingPageSectionV1, { type: 'features' }>) {
    sec.items.push({
      id: `feat-${Date.now()}`,
      title: 'New Feature',
      description: 'Describe this feature or value benefit.'
    });
    onChange();
  }

  function addFaqItem(sec: Extract<LandingPageSectionV1, { type: 'faq' }>) {
    sec.items.push({
      id: `faq-${Date.now()}`,
      question: 'Frequently asked question?',
      answer: 'Detailed answer providing clarity to potential learners.'
    });
    onChange();
  }

  function addTestimonialItem(sec: Extract<LandingPageSectionV1, { type: 'testimonials' }>) {
    sec.items.push({
      id: `test-${Date.now()}`,
      name: 'Student Name',
      role: 'Role / Company',
      quote: 'Share how this course transformed their journey.',
      rating: 5
    });
    onChange();
  }
</script>

<div class="space-y-6 p-5">
  <div>
    <h3 class="text-base font-semibold text-slate-900 dark:text-white">Content Sections</h3>
    <p class="text-xs text-slate-500">
      Enable, reorder, and configure individual content sections on your landing page.
    </p>
  </div>

  <div class="space-y-3">
    {#each doc.sections as sec, index (sec.id)}
      {@const isExpanded = expandedSectionId === sec.id}
      <div class="rounded-xl border border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 {sec.enabled ? '' : 'opacity-60'}">
        <!-- Section Header -->
        <div class="flex items-center justify-between p-3.5">
          <div class="flex items-center gap-2.5">
            <button
              type="button"
              class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              onclick={() => toggleSection(sec)}
              title={sec.enabled ? 'Disable section' : 'Enable section'}
            >
              {#if sec.enabled}
                <EyeIcon class="size-4 text-emerald-500" />
              {:else}
                <EyeOffIcon class="size-4 text-slate-400" />
              {/if}
            </button>

            <button
              type="button"
              class="text-left"
              onclick={() => (expandedSectionId = isExpanded ? null : sec.id)}
            >
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">{sec.type}</span>
                <span class="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                  {'title' in sec && sec.title ? sec.title : sec.type}
                </span>
              </div>
            </button>
          </div>

          <div class="flex items-center gap-1">
            <button
              type="button"
              class="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
              disabled={index === 0}
              onclick={() => moveUp(index)}
              title="Move Up"
            >
              <ChevronUpIcon class="size-4" />
            </button>
            <button
              type="button"
              class="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
              disabled={index >= doc.sections.length - 1}
              onclick={() => moveDown(index)}
              title="Move Down"
            >
              <ChevronDownIcon class="size-4" />
            </button>
          </div>
        </div>

        <!-- Section Content Form -->
        {#if isExpanded}
          <div class="border-t border-slate-100 p-4 space-y-4 dark:border-slate-800">
            {#if 'title' in sec && typeof sec.title === 'string'}
              <div class="space-y-1">
                <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400" for="sec-title-{sec.id}">
                  Section Title
                </label>
                <input
                  id="sec-title-{sec.id}"
                  type="text"
                  bind:value={sec.title}
                  oninput={onChange}
                  class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
            {/if}

            {#if 'subtitle' in sec}
              <div class="space-y-1">
                <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400" for="sec-sub-{sec.id}">
                  Subtitle / Description
                </label>
                <textarea
                  id="sec-sub-{sec.id}"
                  rows="2"
                  bind:value={sec.subtitle}
                  oninput={onChange}
                  class="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                ></textarea>
              </div>
            {/if}

            <!-- Type Specific Controls -->
            {#if sec.type === 'features'}
              <div class="space-y-2 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Feature Items</span>
                  <button
                    type="button"
                    class="flex items-center gap-1 text-[11px] font-semibold text-indigo-600"
                    onclick={() => addFeatureItem(sec)}
                  >
                    <PlusIcon class="size-3" />
                    Add Item
                  </button>
                </div>
                {#each sec.items as item, itemIdx}
                  <div class="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                    <div class="flex items-center justify-between">
                      <input
                        type="text"
                        bind:value={item.title}
                        oninput={onChange}
                        placeholder="Feature title"
                        class="flex-1 rounded border border-slate-200 px-2 py-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-900"
                      />
                      <button
                        type="button"
                        class="ml-2 text-slate-400 hover:text-red-500"
                        onclick={() => {
                          sec.items.splice(itemIdx, 1);
                          onChange();
                        }}
                      >
                        <TrashIcon class="size-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows="2"
                      bind:value={item.description}
                      oninput={onChange}
                      placeholder="Description"
                      class="w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    ></textarea>
                  </div>
                {/each}
              </div>

            {:else if sec.type === 'courses'}
              <div class="space-y-3 pt-2 text-xs text-slate-500">
                <p>
                  This section automatically showcases public courses published in your academy.
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="block text-[11px] font-medium text-slate-600" for="sec-courses-btn">View All Label</label>
                    <input
                      id="sec-courses-btn"
                      type="text"
                      bind:value={sec.viewAllLabel}
                      oninput={onChange}
                      class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[11px] font-medium text-slate-600" for="sec-courses-link">View All Link</label>
                    <input
                      id="sec-courses-link"
                      type="text"
                      bind:value={sec.viewAllHref}
                      oninput={onChange}
                      class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                </div>
              </div>

            {:else if sec.type === 'faq'}
              <div class="space-y-2 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">FAQ Items</span>
                  <button
                    type="button"
                    class="flex items-center gap-1 text-[11px] font-semibold text-indigo-600"
                    onclick={() => addFaqItem(sec)}
                  >
                    <PlusIcon class="size-3" />
                    Add Question
                  </button>
                </div>
                {#each sec.items as item, itemIdx}
                  <div class="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                    <div class="flex items-center justify-between">
                      <input
                        type="text"
                        bind:value={item.question}
                        oninput={onChange}
                        placeholder="Question"
                        class="flex-1 rounded border border-slate-200 px-2 py-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-900"
                      />
                      <button
                        type="button"
                        class="ml-2 text-slate-400 hover:text-red-500"
                        onclick={() => {
                          sec.items.splice(itemIdx, 1);
                          onChange();
                        }}
                      >
                        <TrashIcon class="size-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows="2"
                      bind:value={item.answer}
                      oninput={onChange}
                      placeholder="Answer"
                      class="w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    ></textarea>
                  </div>
                {/each}
              </div>

            {:else if sec.type === 'testimonials'}
              <div class="space-y-2 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Testimonials</span>
                  <button
                    type="button"
                    class="flex items-center gap-1 text-[11px] font-semibold text-indigo-600"
                    onclick={() => addTestimonialItem(sec)}
                  >
                    <PlusIcon class="size-3" />
                    Add Testimonial
                  </button>
                </div>
                {#each sec.items as item, itemIdx}
                  <div class="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
                    <div class="flex items-center gap-2">
                      <input
                        type="text"
                        bind:value={item.name}
                        oninput={onChange}
                        placeholder="Name"
                        class="flex-1 rounded border border-slate-200 px-2 py-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        bind:value={item.role}
                        oninput={onChange}
                        placeholder="Role / Title"
                        class="flex-1 rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                      />
                      <button
                        type="button"
                        class="text-slate-400 hover:text-red-500"
                        onclick={() => {
                          sec.items.splice(itemIdx, 1);
                          onChange();
                        }}
                      >
                        <TrashIcon class="size-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows="2"
                      bind:value={item.quote}
                      oninput={onChange}
                      placeholder="Quote"
                      class="w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    ></textarea>
                  </div>
                {/each}
              </div>

            {:else if sec.type === 'cta'}
              <div class="space-y-3 pt-2">
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="block text-[11px] font-medium text-slate-600" for="cta-btn-label">Action Label</label>
                    <input
                      id="cta-btn-label"
                      type="text"
                      bind:value={sec.action.label}
                      oninput={onChange}
                      class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[11px] font-medium text-slate-600" for="cta-btn-href">Action Link</label>
                    <input
                      id="cta-btn-href"
                      type="text"
                      bind:value={sec.action.href}
                      oninput={onChange}
                      class="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
