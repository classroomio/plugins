<script lang="ts">
  import type { LandingPageDocumentV1 } from '@cio/landing-pages';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import TrashIcon from '@lucide/svelte/icons/trash';

  interface Props {
    document: LandingPageDocumentV1;
    onChange: () => void;
  }

  let { document: doc, onChange }: Props = $props();

  function addCustomLink() {
    if (doc.navigation.customLinks.length >= 8) return;
    const newId = `link-${Date.now()}`;
    doc.navigation.customLinks = [
      ...doc.navigation.customLinks,
      { id: newId, label: 'New Link', href: '#' }
    ];
    onChange();
  }

  function removeCustomLink(index: number) {
    doc.navigation.customLinks = doc.navigation.customLinks.filter((_, i) => i !== index);
    onChange();
  }
</script>

<div class="space-y-6 p-5">
  <div>
    <h3 class="text-base font-semibold text-slate-900 dark:text-white">Hero & Navigation</h3>
    <p class="text-xs text-slate-500">
      Configure your academy header, value proposition, calls-to-action, and media.
    </p>
  </div>

  <!-- Navigation Bar Options -->
  <div class="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
    <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Navigation Settings</h4>

    <label class="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
      <input
        type="checkbox"
        bind:checked={doc.navigation.showLogo}
        onchange={onChange}
        class="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      Show Organization Logo
    </label>

    <label class="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
      <input
        type="checkbox"
        bind:checked={doc.navigation.showAuthAction}
        onchange={onChange}
        class="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      Show Sign In & Dashboard Button
    </label>

    <!-- Custom Links -->
    <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">Header Links</span>
        <button
          type="button"
          class="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-500"
          onclick={addCustomLink}
        >
          <PlusIcon class="size-3" />
          Add Link
        </button>
      </div>

      {#each doc.navigation.customLinks as link, index (link.id)}
        <div class="flex items-center gap-2">
          <input
            type="text"
            bind:value={link.label}
            oninput={onChange}
            placeholder="Label"
            class="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
          />
          <input
            type="text"
            bind:value={link.href}
            oninput={onChange}
            placeholder="#href or /url"
            class="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
          />
          <button
            type="button"
            class="p-1.5 text-slate-400 hover:text-red-500"
            onclick={() => removeCustomLink(index)}
            title="Delete link"
          >
            <TrashIcon class="size-3.5" />
          </button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Hero Content -->
  <div class="space-y-4">
    <div class="space-y-1.5">
      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="hero-badge">
        Highlight Badge (Optional)
      </label>
      <input
        id="hero-badge"
        type="text"
        bind:value={doc.hero.badge}
        oninput={onChange}
        placeholder="e.g. 🚀 Next Cohort Starting Soon"
        class="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
      />
    </div>

    <div class="space-y-1.5">
      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="hero-headline">
        Headline
      </label>
      <input
        id="hero-headline"
        type="text"
        bind:value={doc.hero.headline}
        oninput={onChange}
        placeholder="Enter headline"
        class="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
      />
    </div>

    <div class="space-y-1.5">
      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="hero-subheadline">
        Subheadline
      </label>
      <textarea
        id="hero-subheadline"
        rows="3"
        bind:value={doc.hero.subheadline}
        oninput={onChange}
        placeholder="Enter description supporting your headline"
        class="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
      ></textarea>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="primary-label">
          Primary Action Label
        </label>
        <input
          id="primary-label"
          type="text"
          bind:value={doc.hero.primaryAction.label}
          oninput={onChange}
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
        />
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="primary-href">
          Primary Action Link
        </label>
        <input
          id="primary-href"
          type="text"
          bind:value={doc.hero.primaryAction.href}
          oninput={onChange}
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
        />
      </div>
    </div>

    <!-- Media -->
    <div class="space-y-2 pt-2">
      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="media-type">
          Hero Media
        </label>
        <select
          id="media-type"
          bind:value={doc.hero.mediaType}
          onchange={onChange}
          class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
        >
          <option value="image">Image</option>
          <option value="none">No Image (Centered text)</option>
        </select>
      </div>

      {#if doc.hero.mediaType === 'image'}
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="hero-image-url">
            Image URL
          </label>
          <input
            id="hero-image-url"
            type="url"
            bind:value={doc.hero.mediaUrl}
            oninput={onChange}
            placeholder="https://..."
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
      {/if}
    </div>
  </div>
</div>

