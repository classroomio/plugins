<script lang="ts">
  import type {
    LandingPageCourse,
    LandingPageDocumentV1,
    LandingPageSectionV1
  } from '@cio/landing-pages';
  import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import TrashIcon from '@lucide/svelte/icons/trash';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import CopyIcon from '@lucide/svelte/icons/copy';
  import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
  import VideoIcon from '@lucide/svelte/icons/video';
  import MailIcon from '@lucide/svelte/icons/mail';
  import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
  import SparklesIcon from '@lucide/svelte/icons/sparkles';
  import MessageSquareIcon from '@lucide/svelte/icons/message-square';
  import CircleHelpIcon from '@lucide/svelte/icons/circle-help';
  import MegaphoneIcon from '@lucide/svelte/icons/megaphone';
  import ChartBarIcon from '@lucide/svelte/icons/chart-bar';
  import CheckIcon from '@lucide/svelte/icons/check';
  import SearchIcon from '@lucide/svelte/icons/search';
  import XIcon from '@lucide/svelte/icons/x';

  interface Props {
    document: LandingPageDocumentV1;
    courses: LandingPageCourse[];
    selectedSectionId?: string | null;
    onSelectSection?: (id: string | null) => void;
    onChange: () => void;
  }

  let {
    document: doc,
    courses = [],
    selectedSectionId = null,
    onSelectSection,
    onChange
  }: Props = $props();

  let expandedSectionId = $state<string | null>(null);
  let showAddMenu = $state(false);
  let courseSearchQuery = $state('');

  $effect(() => {
    if (selectedSectionId && selectedSectionId !== expandedSectionId) {
      expandedSectionId = selectedSectionId;
    }
  });

  $effect(() => {
    if (expandedSectionId === null && doc.sections[0]?.id) {
      expandedSectionId = doc.sections[0].id;
    }
  });

  function handleSelectSection(secId: string) {
    expandedSectionId = expandedSectionId === secId ? null : secId;
    onSelectSection?.(expandedSectionId);
  }

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

  function duplicateSection(sec: LandingPageSectionV1, index: number) {
    const cloned = JSON.parse(JSON.stringify(sec)) as LandingPageSectionV1;
    cloned.id = `sec-${Date.now()}`;
    if ('title' in cloned && typeof cloned.title === 'string') {
      cloned.title = `${cloned.title} (Copy)`;
    }
    doc.sections.splice(index + 1, 0, cloned);
    expandedSectionId = cloned.id;
    onSelectSection?.(cloned.id);
    onChange();
  }

  function deleteSection(index: number) {
    const sec = doc.sections[index];
    if (window.confirm(`Delete "${'title' in sec && sec.title ? sec.title : sec.type}" section?`)) {
      doc.sections.splice(index, 1);
      if (expandedSectionId === sec.id) {
        expandedSectionId = doc.sections[0]?.id ?? null;
        onSelectSection?.(expandedSectionId);
      }
      onChange();
    }
  }

  // --- Add Sections ---
  type AddSectionOption = {
    type: LandingPageSectionV1['type'];
    label: string;
    description: string;
    icon: any;
  };

  const ADD_OPTIONS: AddSectionOption[] = [
    {
      type: 'video',
      label: 'Video Showcase',
      description: 'Embed an introduction or walkthrough video from YouTube or Vimeo.',
      icon: VideoIcon
    },
    {
      type: 'contact',
      label: 'Contact Us Form',
      description: 'Lead capture form with custom inputs for inquiries and enterprise interest.',
      icon: MailIcon
    },
    {
      type: 'courses',
      label: 'Courses Showcase',
      description: 'Display your academy courses (all published or select specific ones).',
      icon: GraduationCapIcon
    },
    {
      type: 'features',
      label: 'Feature Highlights',
      description: 'Grid cards explaining your curriculum perks and core student benefits.',
      icon: SparklesIcon
    },
    {
      type: 'testimonials',
      label: 'Student Testimonials',
      description: 'Social proof quotes, ratings, and student success stories.',
      icon: MessageSquareIcon
    },
    {
      type: 'faq',
      label: 'FAQ Accordion',
      description: 'Answers to common questions about courses, schedules, and pricing.',
      icon: CircleHelpIcon
    },
    {
      type: 'cta',
      label: 'Call to Action',
      description: 'High-converting banner with headline, description, and action button.',
      icon: MegaphoneIcon
    },
    {
      type: 'stats',
      label: 'Stats & Impact',
      description: 'Display graduation numbers, job placement rates, or academy metrics.',
      icon: ChartBarIcon
    }
  ];

  function addSection(type: LandingPageSectionV1['type']) {
    showAddMenu = false;
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

    doc.sections.push(newSec);
    expandedSectionId = newSec.id;
    onSelectSection?.(newSec.id);
    onChange();
  }

  // Helpers for Video ID parsing
  function cleanVideoInput(raw: string, provider: 'youtube' | 'vimeo'): string {
    const trimmed = raw.trim();
    if (provider === 'youtube') {
      const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? match[1] : trimmed;
    }
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
    return vimeoMatch ? vimeoMatch[1] : trimmed;
  }

  // Course toggle helper
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

  // Contact field helpers
  function addContactField(sec: Extract<LandingPageSectionV1, { type: 'contact' }>) {
    const fId = `f-${Date.now()}`;
    sec.fields.push({
      id: fId,
      name: `field_${sec.fields.length + 1}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: ''
    });
    onChange();
  }

  function removeContactField(sec: Extract<LandingPageSectionV1, { type: 'contact' }>, fIndex: number) {
    sec.fields.splice(fIndex, 1);
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

  function addStatItem(sec: Extract<LandingPageSectionV1, { type: 'stats' }>) {
    sec.items.push({
      id: `st-${Date.now()}`,
      value: '100%',
      label: 'Satisfaction'
    });
    onChange();
  }

  const filteredCourses = $derived(
    courseSearchQuery.trim()
      ? courses.filter((c) =>
          c.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
          c.slug.toLowerCase().includes(courseSearchQuery.toLowerCase())
        )
      : courses
  );
</script>

<div class="space-y-6 p-5">
  <!-- Top Bar: Header + Add Section Dropdown -->
  <div class="flex items-center justify-between gap-3">
    <div>
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">Page Sections</h3>
      <p class="text-[11px] text-slate-500">
        Add, reorder, and customize elements on your page.
      </p>
    </div>

    <div class="relative">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
        onclick={() => (showAddMenu = !showAddMenu)}
      >
        <PlusIcon size={14} />
        <span>Add Section</span>
      </button>

      {#if showAddMenu}
        <div
          class="fixed inset-0 z-30"
          role="presentation"
          onclick={() => (showAddMenu = false)}
        ></div>

        <div
          class="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-40 space-y-1"
        >
          <div class="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Choose Section Type
          </div>
          {#each ADD_OPTIONS as opt}
            {@const Icon = opt.icon}
            <button
              type="button"
              class="flex w-full items-start gap-2.5 rounded-lg p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              onclick={() => addSection(opt.type)}
            >
              <div class="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 mt-0.5">
                <Icon size={15} />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-semibold text-slate-900 dark:text-white">{opt.label}</div>
                <div class="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.description}</div>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Sections List -->
  <div class="space-y-2.5">
    {#each doc.sections as sec, index (sec.id)}
      {@const isExpanded = expandedSectionId === sec.id}
      {@const isSelected = selectedSectionId === sec.id}
      <div
        class="rounded-xl border bg-white transition-all dark:bg-slate-900 {isSelected
          ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/30'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'} {sec.enabled
          ? ''
          : 'opacity-60 bg-slate-50/50'}"
      >
        <!-- Section Header Card -->
        <div class="flex items-center justify-between p-3 gap-2">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <span class="cursor-grab text-slate-300 hover:text-slate-500 dark:text-slate-600">
              <GripVerticalIcon size={14} />
            </span>

            <button
              type="button"
              class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              onclick={() => toggleSection(sec)}
              title={sec.enabled ? 'Hide section' : 'Show section'}
            >
              {#if sec.enabled}
                <EyeIcon class="size-3.5 text-blue-600 dark:text-blue-400" />
              {:else}
                <EyeOffIcon class="size-3.5 text-slate-400" />
              {/if}
            </button>

            <button
              type="button"
              class="flex items-center gap-2 min-w-0 flex-1 text-left"
              onclick={() => handleSelectSection(sec.id)}
            >
              <span class="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {sec.type}
              </span>
              <span class="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {'title' in sec && sec.title ? sec.title : `${sec.type} section`}
              </span>
            </button>
          </div>

          <!-- Section Controls (Move Up, Move Down, Duplicate, Delete) -->
          <div class="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800"
              disabled={index === 0}
              onclick={() => moveUp(index)}
              title="Move up"
            >
              <ChevronUpIcon size={14} />
            </button>
            <button
              type="button"
              class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800"
              disabled={index >= doc.sections.length - 1}
              onclick={() => moveDown(index)}
              title="Move down"
            >
              <ChevronDownIcon size={14} />
            </button>
            <button
              type="button"
              class="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
              onclick={() => duplicateSection(sec, index)}
              title="Duplicate section"
            >
              <CopyIcon size={13} />
            </button>
            <button
              type="button"
              class="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
              onclick={() => deleteSection(index)}
              title="Delete section"
            >
              <TrashIcon size={13} />
            </button>
          </div>
        </div>

        <!-- Section Inspector Form Body -->
        {#if isExpanded}
          <div class="border-t border-slate-100 p-4 space-y-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 rounded-b-xl">
            {#if 'title' in sec && typeof sec.title === 'string'}
              <div class="space-y-1">
                <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300" for="sec-title-{sec.id}">
                  Section Title
                </label>
                <input
                  id="sec-title-{sec.id}"
                  type="text"
                  bind:value={sec.title}
                  oninput={onChange}
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            {/if}

            {#if 'subtitle' in sec}
              <div class="space-y-1">
                <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300" for="sec-sub-{sec.id}">
                  Subtitle / Description
                </label>
                <textarea
                  id="sec-sub-{sec.id}"
                  rows="2"
                  bind:value={sec.subtitle}
                  oninput={onChange}
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                ></textarea>
              </div>
            {/if}

            {#if 'description' in sec && typeof sec.description === 'string'}
              <div class="space-y-1">
                <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300" for="sec-desc-{sec.id}">
                  Description
                </label>
                <textarea
                  id="sec-desc-{sec.id}"
                  rows="2"
                  bind:value={sec.description}
                  oninput={onChange}
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                ></textarea>
              </div>
            {/if}

            <!-- VIDEO SECTION INSPECTOR -->
            {#if sec.type === 'video'}
              <div class="space-y-3 pt-2">
                <div class="space-y-1">
                  <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Video Platform</span>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all {sec.provider === 'youtube'
                        ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}"
                      onclick={() => { sec.provider = 'youtube'; onChange(); }}
                    >
                      YouTube
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all {sec.provider === 'vimeo'
                        ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}"
                      onclick={() => { sec.provider = 'vimeo'; onChange(); }}
                    >
                      Vimeo
                    </button>
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300" for="sec-vid-id-{sec.id}">
                    Video ID or URL
                  </label>
                  <input
                    id="sec-vid-id-{sec.id}"
                    type="text"
                    value={sec.videoId}
                    oninput={(e) => {
                      sec.videoId = cleanVideoInput((e.target as HTMLInputElement).value, sec.provider);
                      onChange();
                    }}
                    placeholder={sec.provider === 'youtube' ? 'e.g. dQw4w9WgXcQ or https://youtu.be/...' : 'e.g. 76979871 or https://vimeo.com/...'}
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-mono shadow-sm focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                  <p class="text-[10px] text-slate-400">
                    Paste a full YouTube/Vimeo URL or the video ID directly.
                  </p>
                </div>

                <div class="space-y-1">
                  <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Aspect Ratio</span>
                  <div class="grid grid-cols-3 gap-2">
                    {#each ['16/9', '4/3', '1/1'] as ratio}
                      <button
                        type="button"
                        class="rounded-lg border py-1 text-xs font-medium transition-all {sec.aspectRatio === ratio || (!sec.aspectRatio && ratio === '16/9')
                          ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}"
                        onclick={() => { sec.aspectRatio = ratio as '16/9' | '4/3' | '1/1'; onChange(); }}
                      >
                        {ratio}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>

            <!-- CONTACT SECTION INSPECTOR -->
            {:else if sec.type === 'contact'}
              <div class="space-y-3 pt-2">
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300" for="sec-contact-submit-{sec.id}">Submit Button Text</label>
                    <input
                      id="sec-contact-submit-{sec.id}"
                      type="text"
                      bind:value={sec.submitLabel}
                      oninput={onChange}
                      placeholder="Send Message"
                      class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300" for="sec-contact-succ-{sec.id}">Success Notice</label>
                    <input
                      id="sec-contact-succ-{sec.id}"
                      type="text"
                      bind:value={sec.successMessage}
                      oninput={onChange}
                      placeholder="Thank you! We'll reply soon."
                      class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <!-- Form Fields Manager -->
                <div class="space-y-2 pt-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Form Fields ({sec.fields.length})</span>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                      onclick={() => addContactField(sec)}
                    >
                      <PlusIcon size={12} />
                      Add Field
                    </button>
                  </div>

                  {#each sec.fields as field, fIdx (field.id)}
                    <div class="rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 space-y-2">
                      <div class="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          bind:value={field.label}
                          oninput={onChange}
                          placeholder="Field Label (e.g. Email)"
                          class="flex-1 rounded border border-slate-200 px-2 py-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-950"
                        />
                        <select
                          bind:value={field.type}
                          onchange={onChange}
                          class="rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="tel">Phone</option>
                          <option value="textarea">Long Text</option>
                        </select>
                        <button
                          type="button"
                          class="p-1 text-slate-400 hover:text-red-500"
                          onclick={() => removeContactField(sec, fIdx)}
                          title="Remove field"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                      <div class="flex items-center justify-between text-[11px] text-slate-500">
                        <label class="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            bind:checked={field.required}
                            onchange={onChange}
                            class="size-3 rounded border-slate-300 text-blue-600"
                          />
                          Required field
                        </label>
                        <input
                          type="text"
                          bind:value={field.placeholder}
                          oninput={onChange}
                          placeholder="Placeholder (optional)"
                          class="w-40 rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] dark:border-slate-800 dark:bg-slate-950"
                        />
                      </div>
                    </div>
                  {/each}
                </div>
              </div>

            <!-- COURSES SECTION INSPECTOR -->
            {:else if sec.type === 'courses'}
              <div class="space-y-3 pt-2">
                <div class="space-y-1.5">
                  <span class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Course Display Mode</span>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all {!sec.selectedCourseIds || sec.selectedCourseIds.length === 0
                        ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}"
                      onclick={() => { sec.selectedCourseIds = []; onChange(); }}
                    >
                      All Published ({courses.length})
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all {sec.selectedCourseIds && sec.selectedCourseIds.length > 0
                        ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}"
                      onclick={() => {
                        if (!sec.selectedCourseIds || sec.selectedCourseIds.length === 0) {
                          sec.selectedCourseIds = courses.slice(0, 3).map((c) => c.id);
                        }
                        onChange();
                      }}
                    >
                      Selected ({sec.selectedCourseIds ? sec.selectedCourseIds.length : 0})
                    </button>
                  </div>
                </div>

                <!-- Course Checklist when "Selected" is active -->
                {#if sec.selectedCourseIds && sec.selectedCourseIds.length > 0}
                  <div class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2">
                    <div class="relative">
                      <SearchIcon size={13} class="absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        bind:value={courseSearchQuery}
                        placeholder="Search courses..."
                        class="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                      />
                    </div>

                    <div class="max-h-48 overflow-y-auto space-y-1 pt-1 divide-y divide-slate-100 dark:divide-slate-800">
                      {#if filteredCourses.length === 0}
                        <div class="py-3 text-center text-xs text-slate-400">No courses match search.</div>
                      {:else}
                        {#each filteredCourses as course (course.id)}
                          {@const isChecked = (sec.selectedCourseIds ?? []).includes(course.id)}
                          <label class="flex items-center gap-2.5 py-1.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onchange={() => toggleCourseSelection(sec, course.id)}
                              class="size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            {#if course.image}
                              <img src={course.image} alt={course.title} class="size-6 rounded object-cover shrink-0" />
                            {:else}
                              <div class="size-6 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                <GraduationCapIcon size={12} />
                              </div>
                            {/if}
                            <span class="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1">{course.title}</span>
                          </label>
                        {/each}
                      {/if}
                    </div>
                  </div>
                {/if}

                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300" for="sec-courses-btn">View All Label</label>
                    <input
                      id="sec-courses-btn"
                      type="text"
                      bind:value={sec.viewAllLabel}
                      oninput={onChange}
                      placeholder="Browse All"
                      class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300" for="sec-courses-link">View All Link</label>
                    <input
                      id="sec-courses-link"
                      type="text"
                      bind:value={sec.viewAllHref}
                      oninput={onChange}
                      placeholder="/courses"
                      class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

            <!-- FEATURES SECTION INSPECTOR -->
            {:else if sec.type === 'features'}
              <div class="space-y-2 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Feature Items ({sec.items.length})</span>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    onclick={() => addFeatureItem(sec)}
                  >
                    <PlusIcon size={12} />
                    Add Item
                  </button>
                </div>
                {#each sec.items as item, itemIdx (item.id)}
                  <div class="space-y-1.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div class="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        bind:value={item.title}
                        oninput={onChange}
                        placeholder="Feature title"
                        class="flex-1 rounded border border-slate-200 px-2 py-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                      />
                      <button
                        type="button"
                        class="text-slate-400 hover:text-red-500"
                        onclick={() => {
                          sec.items.splice(itemIdx, 1);
                          onChange();
                        }}
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                    <textarea
                      rows="2"
                      bind:value={item.description}
                      oninput={onChange}
                      placeholder="Description"
                      class="w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    ></textarea>
                  </div>
                {/each}
              </div>

            <!-- FAQ SECTION INSPECTOR -->
            {:else if sec.type === 'faq'}
              <div class="space-y-2 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Questions ({sec.items.length})</span>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    onclick={() => addFaqItem(sec)}
                  >
                    <PlusIcon size={12} />
                    Add Question
                  </button>
                </div>
                {#each sec.items as item, itemIdx (item.id)}
                  <div class="space-y-1.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div class="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        bind:value={item.question}
                        oninput={onChange}
                        placeholder="Question"
                        class="flex-1 rounded border border-slate-200 px-2 py-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                      />
                      <button
                        type="button"
                        class="text-slate-400 hover:text-red-500"
                        onclick={() => {
                          sec.items.splice(itemIdx, 1);
                          onChange();
                        }}
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                    <textarea
                      rows="2"
                      bind:value={item.answer}
                      oninput={onChange}
                      placeholder="Answer"
                      class="w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    ></textarea>
                  </div>
                {/each}
              </div>

            <!-- TESTIMONIALS SECTION INSPECTOR -->
            {:else if sec.type === 'testimonials'}
              <div class="space-y-2 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Testimonials ({sec.items.length})</span>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    onclick={() => addTestimonialItem(sec)}
                  >
                    <PlusIcon size={12} />
                    Add Quote
                  </button>
                </div>
                {#each sec.items as item, itemIdx (item.id)}
                  <div class="space-y-1.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div class="flex items-center gap-2">
                      <input
                        type="text"
                        bind:value={item.name}
                        oninput={onChange}
                        placeholder="Student Name"
                        class="flex-1 rounded border border-slate-200 px-2 py-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950"
                      />
                      <input
                        type="text"
                        bind:value={item.role}
                        oninput={onChange}
                        placeholder="Role / Company"
                        class="flex-1 rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                      />
                      <button
                        type="button"
                        class="text-slate-400 hover:text-red-500"
                        onclick={() => {
                          sec.items.splice(itemIdx, 1);
                          onChange();
                        }}
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                    <textarea
                      rows="2"
                      bind:value={item.quote}
                      oninput={onChange}
                      placeholder="Student Quote"
                      class="w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    ></textarea>
                  </div>
                {/each}
              </div>

            <!-- CTA SECTION INSPECTOR -->
            {:else if sec.type === 'cta'}
              <div class="space-y-3 pt-2">
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300" for="cta-btn-label">Action Label</label>
                    <input
                      id="cta-btn-label"
                      type="text"
                      bind:value={sec.action.label}
                      oninput={onChange}
                      class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300" for="cta-btn-href">Action Link</label>
                    <input
                      id="cta-btn-href"
                      type="text"
                      bind:value={sec.action.href}
                      oninput={onChange}
                      class="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

            <!-- STATS SECTION INSPECTOR -->
            {:else if sec.type === 'stats'}
              <div class="space-y-2 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Metrics ({sec.items.length})</span>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    onclick={() => addStatItem(sec)}
                  >
                    <PlusIcon size={12} />
                    Add Metric
                  </button>
                </div>
                {#each sec.items as item, itemIdx (item.id)}
                  <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                    <input
                      type="text"
                      bind:value={item.value}
                      oninput={onChange}
                      placeholder="e.g. 98%"
                      class="w-24 rounded border border-slate-200 px-2 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                    />
                    <input
                      type="text"
                      bind:value={item.label}
                      oninput={onChange}
                      placeholder="Label e.g. Job Placement"
                      class="flex-1 rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                    />
                    <button
                      type="button"
                      class="text-slate-400 hover:text-red-500"
                      onclick={() => {
                        sec.items.splice(itemIdx, 1);
                        onChange();
                      }}
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
