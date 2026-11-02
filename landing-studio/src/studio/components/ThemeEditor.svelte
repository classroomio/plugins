<script lang="ts">
  import {
    LANDING_PAGE_FONT_FAMILIES,
    type LandingPageDocumentV1,
    type LandingPageFontFamily
  } from '@cio/landing-pages';

  interface Props {
    document: LandingPageDocumentV1;
    onChange: () => void;
  }

  let { document: doc, onChange }: Props = $props();

  const presetPalettes = [
    { name: 'ClassroomIO Blue', primary: '#2563eb', secondary: '#3b82f6', bg: '#0f172a' },
    { name: 'Classic Light', primary: '#2563eb', secondary: '#60a5fa', bg: '#f8fafc' },
    { name: 'Warm Amber', primary: '#ea580c', secondary: '#f59e0b', bg: '#ffffff' },
    { name: 'Minimal Dark', primary: '#18181b', secondary: '#52525b', bg: '#fafafa' },
    { name: 'Forest Emerald', primary: '#059669', secondary: '#10b981', bg: '#f0fdf4' },
    { name: 'Vibrant Violet', primary: '#7c3aed', secondary: '#a855f7', bg: '#09090b' }
  ];

  function applyPalette(palette: (typeof presetPalettes)[number]) {
    doc.theme.primaryColor = palette.primary;
    doc.theme.secondaryColor = palette.secondary;
    doc.theme.backgroundColor = palette.bg;
    onChange();
  }
</script>

<div class="space-y-6 p-5">
  <div>
    <h3 class="text-base font-semibold text-slate-900 dark:text-white">Theme & Typography</h3>
    <p class="text-xs text-slate-500">
      Customize the brand colors and typography used throughout your landing page.
    </p>
  </div>

  <!-- Quick Palettes -->
  <div class="space-y-2">
    <span class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
      Preset Palettes
    </span>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {#each presetPalettes as p}
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs font-medium hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
          onclick={() => applyPalette(p)}
        >
          <div class="flex -space-x-1">
            <span class="size-3.5 rounded-full border border-white" style="background-color: {p.primary}"></span>
            <span class="size-3.5 rounded-full border border-white" style="background-color: {p.secondary}"></span>
            <span class="size-3.5 rounded-full border border-white" style="background-color: {p.bg}"></span>
          </div>
          <span class="truncate">{p.name}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Color Controls -->
  <div class="space-y-4">
    <div class="space-y-1.5">
      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="primary-color">
        Primary Accent Color
      </label>
      <div class="flex items-center gap-2">
        <input
          id="primary-color"
          type="color"
          bind:value={doc.theme.primaryColor}
          oninput={onChange}
          class="size-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0.5"
        />
        <input
          type="text"
          bind:value={doc.theme.primaryColor}
          oninput={onChange}
          class="w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="secondary-color">
        Secondary Color
      </label>
      <div class="flex items-center gap-2">
        <input
          id="secondary-color"
          type="color"
          bind:value={doc.theme.secondaryColor}
          oninput={onChange}
          class="size-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0.5"
        />
        <input
          type="text"
          bind:value={doc.theme.secondaryColor}
          oninput={onChange}
          class="w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="bg-color">
        Background Color
      </label>
      <div class="flex items-center gap-2">
        <input
          id="bg-color"
          type="color"
          bind:value={doc.theme.backgroundColor}
          oninput={onChange}
          class="size-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0.5"
        />
        <input
          type="text"
          bind:value={doc.theme.backgroundColor}
          oninput={onChange}
          class="w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>
    </div>
  </div>

  <!-- Font Family -->
  <div class="space-y-1.5">
    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300" for="font-family">
      Typography / Font Family
    </label>
    <select
      id="font-family"
      bind:value={doc.theme.fontFamily}
      onchange={onChange}
      class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white capitalize"
    >
      {#each LANDING_PAGE_FONT_FAMILIES as f}
        <option value={f}>{f.replace(/-/g, ' ')}</option>
      {/each}
    </select>
  </div>
</div>
