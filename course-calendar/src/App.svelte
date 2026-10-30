<script lang="ts">
  import { onMount } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { createClassroomIOClient, type PluginContext } from '@classroomio/plugin-sdk';
  import type {
    CalendarCourseRef,
    CalendarEvent,
    PluginCourseRecord,
    PluginExerciseRecord,
    PluginLessonRecord,
    PluginListResponse
  } from './types';
  import CalendarIcon from '@lucide/svelte/icons/calendar';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
  import ClockIcon from '@lucide/svelte/icons/clock';
  import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
  import FilterIcon from '@lucide/svelte/icons/filter';
  import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
  import GlobeIcon from '@lucide/svelte/icons/globe';
  import ListIcon from '@lucide/svelte/icons/list';
  import Loader2Icon from '@lucide/svelte/icons/loader-2';
  import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
  import ShieldIcon from '@lucide/svelte/icons/shield';
  import SparklesIcon from '@lucide/svelte/icons/sparkles';
  import UserIcon from '@lucide/svelte/icons/user';
  import VideoIcon from '@lucide/svelte/icons/video';
  import XIcon from '@lucide/svelte/icons/x';
  import {
    buildCalendarEvents,
    buildMonthGrid,
    buildWeekDays,
    formatEventTime,
    formatEventTimeRange,
    formatFullDate,
    formatRelativeTime,
    getCourseColor,
    getEventTimingStatus,
    getEventTypeLabel,
    toLocalDateKey
  } from './calendar-utils';

  type CalendarViewMode = 'month' | 'week' | 'agenda';

  const client = createClassroomIOClient({ timeoutMs: 10000 });
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  let context = $state<PluginContext | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  let role = $state<'admin' | 'tutor' | 'student'>('student');
  let events = $state<CalendarEvent[]>([]);
  let courses = $state<CalendarCourseRef[]>([]);

  let viewMode = $state<CalendarViewMode>('month');
  let selectedCourseId = $state<string>('all');
  let selectedTypeFilter = $state<string>('all');
  let searchQuery = $state('');

  let currentAnchor = $state(new Date());
  let selectedEvent = $state<CalendarEvent | null>(null);
  let selectedDayKey = $state<string | null>(null);
  const expandedEventIds = new SvelteSet<string>();

  function toggleEventExpanded(eventId: string) {
    if (expandedEventIds.has(eventId)) {
      expandedEventIds.delete(eventId);
    } else {
      expandedEventIds.add(eventId);
    }
  }

  const isSidebarSurface = $derived(context?.surface?.target === 'course.sidebar');
  const lockedCourseId = $derived(
    context?.surface?.resource?.type === 'course' ? context.surface.resource.id : undefined
  );

  const filteredEvents = $derived.by(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      if (selectedCourseId !== 'all' && event.course.id !== selectedCourseId) {
        return false;
      }
      if (selectedTypeFilter !== 'all' && event.type !== selectedTypeFilter) {
        return false;
      }
      if (normalizedSearch.length > 0) {
        const matchesTitle = event.title.toLowerCase().includes(normalizedSearch);
        const matchesCourse = event.course.title.toLowerCase().includes(normalizedSearch);
        const matchesInstructor = event.instructor?.name.toLowerCase().includes(normalizedSearch) ?? false;
        if (!matchesTitle && !matchesCourse && !matchesInstructor) {
          return false;
        }
      }
      return true;
    });
  });

  const currentYear = $derived(currentAnchor.getFullYear());
  const currentMonth = $derived(currentAnchor.getMonth());

  const monthGridCells = $derived(buildMonthGrid(currentYear, currentMonth, filteredEvents));
  const weekDayCells = $derived(buildWeekDays(currentAnchor, filteredEvents));

  const headerPeriodLabel = $derived.by(() => {
    if (viewMode === 'month') {
      return currentAnchor.toLocaleDateString([], { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const firstDay = weekDayCells[0]?.date;
      const lastDay = weekDayCells[6]?.date;
      if (!firstDay || !lastDay) return '';
      const sameMonth = firstDay.getMonth() === lastDay.getMonth();
      if (sameMonth) {
        return `${firstDay.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${lastDay.getDate()}, ${lastDay.getFullYear()}`;
      }
      return `${firstDay.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${lastDay.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return 'All Scheduled Sessions & Deadlines';
  });

  const agendaGroups = $derived.by(() => {
    const groups = new Map<string, { date: Date; dateKey: string; items: CalendarEvent[] }>();
    for (const event of filteredEvents) {
      const date = new Date(event.startsAt);
      if (Number.isNaN(date.getTime())) continue;
      const key = toLocalDateKey(date);
      const existing = groups.get(key);
      if (existing) {
        existing.items.push(event);
      } else {
        groups.set(key, {
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          dateKey: key,
          items: [event]
        });
      }
    }
    return Array.from(groups.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  const statsSummary = $derived.by(() => {
    const now = new Date();
    let liveCount = 0;
    let upcomingCount = 0;
    let activityCount = 0;

    for (const event of filteredEvents) {
      if (event.type === 'live_session') {
        const status = getEventTimingStatus(event, now);
        if (status === 'live') liveCount += 1;
        else if (status === 'upcoming') upcomingCount += 1;
        else activityCount += 1;
      } else {
        activityCount += 1;
      }
    }

    return {
      total: filteredEvents.length,
      liveCount,
      upcomingCount,
      activityCount
    };
  });

  const selectedDayCell = $derived(
    selectedDayKey ? monthGridCells.find((cell) => cell.dateKey === selectedDayKey) ?? null : null
  );

  async function listCourses() {
    const items: PluginCourseRecord[] = [];
    let cursor: string | undefined;
    let resolvedRole: PluginListResponse<PluginCourseRecord>['role'] = 'student';

    do {
      const response = await client.action<PluginListResponse<PluginCourseRecord>, { cursor?: string }>(
        'courses:list',
        cursor ? { cursor } : {}
      );
      resolvedRole = response.role;
      items.push(...response.items);
      cursor = response.nextCursor ?? undefined;
    } while (cursor);

    return { role: resolvedRole, items };
  }

  async function loadSchedule() {
    loading = true;
    error = null;

    try {
      const [coursesResponse, lessonsResponse, exercisesResponse] = await Promise.all([
        listCourses(),
        client.action<PluginListResponse<PluginLessonRecord>, { courseId?: string }>(
          'lessons:list',
          lockedCourseId ? { courseId: lockedCourseId } : {}
        ),
        client.action<PluginListResponse<PluginExerciseRecord>, { courseId?: string }>(
          'exercises:list',
          lockedCourseId ? { courseId: lockedCourseId } : {}
        )
      ]);

      const scopedCourses = lockedCourseId
        ? coursesResponse.items.filter((courseItem) => courseItem.id === lockedCourseId)
        : coursesResponse.items;

      const derivedEvents = buildCalendarEvents(
        scopedCourses,
        lessonsResponse.items,
        exercisesResponse.items,
        coursesResponse.role
      );

      role = coursesResponse.role;
      courses = scopedCourses.map((courseItem) => ({
        id: courseItem.id,
        title: courseItem.title,
        slug: courseItem.slug,
        type: courseItem.type
      }));
      events = derivedEvents;

      if (lockedCourseId) {
        selectedCourseId = lockedCourseId;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load course schedule.';
    } finally {
      loading = false;
    }
  }

  function stepPrevious() {
    if (viewMode === 'month') {
      currentAnchor = new Date(currentYear, currentMonth - 1, 1);
    } else if (viewMode === 'week') {
      currentAnchor = new Date(
        currentAnchor.getFullYear(),
        currentAnchor.getMonth(),
        currentAnchor.getDate() - 7
      );
    }
  }

  function stepNext() {
    if (viewMode === 'month') {
      currentAnchor = new Date(currentYear, currentMonth + 1, 1);
    } else if (viewMode === 'week') {
      currentAnchor = new Date(
        currentAnchor.getFullYear(),
        currentAnchor.getMonth(),
        currentAnchor.getDate() + 7
      );
    }
  }

  function jumpToToday() {
    const today = new Date();
    currentAnchor = today;
    selectedDayKey = toLocalDateKey(today);
  }

  async function openCourseInHost(event: CalendarEvent) {
    try {
      if (role === 'student') {
        const path = event.course.slug ? `/course/${event.course.slug}` : '/lms/mylearning';
        await client.navigation.open(path);
      } else {
        const path = event.lesson
          ? `/courses/${event.course.id}/lessons?lesson=${event.lesson.id}`
          : `/courses/${event.course.id}`;
        await client.navigation.open(path);
      }
    } catch {
      await client.ui.toast({
        message: 'Could not navigate to course page from this view.',
        variant: 'warning'
      });
    }
  }

  onMount(async () => {
    try {
      const ctx = await client.context.get();
      context = ctx;
      if (ctx.surface?.target === 'course.sidebar') {
        viewMode = 'agenda';
        await client.ui.resize(480);
      }
      await loadSchedule();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to initialize calendar plugin.';
      loading = false;
    }
  });
</script>

<div class="calendar-shell" class:compact={isSidebarSurface}>
  <header class="top-bar">
    <div class="brand-group">
      <div class="brand-icon">
        <CalendarIcon size={20} />
      </div>
      <div>
        <div class="title-row">
          <h1>{isSidebarSurface ? 'Course Schedule' : 'Course & Live Calendar'}</h1>
          <span class="role-badge" class:staff={role === 'admin' || role === 'tutor'}>
            {#if role === 'admin'}
              <ShieldIcon size={12} />
              <span>Admin · All Courses</span>
            {:else if role === 'tutor'}
              <SparklesIcon size={12} />
              <span>Instructor View</span>
            {:else}
              <GraduationCapIcon size={12} />
              <span>Learner · Enrolled Courses</span>
            {/if}
          </span>
          <span class="readonly-pill">View only</span>
        </div>
        <p class="subtitle">
          <GlobeIcon size={12} />
          <span>Times shown in your local timezone ({localTimezone})</span>
        </p>
      </div>
    </div>

    <div class="stats-strip">
      <div class="stat-chip">
        <span class="stat-dot upcoming"></span>
        <span class="stat-value">{statsSummary.upcomingCount}</span>
        <span class="stat-label">Upcoming Live</span>
      </div>
      {#if statsSummary.liveCount > 0}
        <div class="stat-chip live">
          <span class="stat-dot live"></span>
          <span class="stat-value">{statsSummary.liveCount}</span>
          <span class="stat-label">Live Now</span>
        </div>
      {/if}
      <div class="stat-chip">
        <span class="stat-dot completed"></span>
        <span class="stat-value">{statsSummary.activityCount}</span>
        <span class="stat-label">{role === 'student' ? 'Completed' : 'Created'}</span>
      </div>
    </div>
  </header>

  <section class="controls-bar">
    <div class="period-nav">
      <button type="button" class="btn-outline" onclick={jumpToToday}>Today</button>
      {#if viewMode !== 'agenda'}
        <div class="step-buttons">
          <button type="button" class="btn-icon" onclick={stepPrevious} aria-label="Previous period">
            <ChevronLeftIcon size={16} />
          </button>
          <button type="button" class="btn-icon" onclick={stepNext} aria-label="Next period">
            <ChevronRightIcon size={16} />
          </button>
        </div>
      {/if}
      <h2 class="period-label">{headerPeriodLabel}</h2>
    </div>

    <div class="filters-group">
      {#if !lockedCourseId && courses.length > 0}
        <div class="select-wrap">
          <FilterIcon size={13} />
          <select bind:value={selectedCourseId} aria-label="Filter by course">
            <option value="all">All Courses ({courses.length})</option>
            {#each courses as courseItem (courseItem.id)}
              <option value={courseItem.id}>{courseItem.title}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if !isSidebarSurface}
        <div class="select-wrap">
          <select bind:value={selectedTypeFilter} aria-label="Filter by event type">
            <option value="all">All Event Types</option>
            {#if role === 'student'}
              <option value="course_completed">Courses Completed</option>
              <option value="lesson_completed">Lessons Completed</option>
              <option value="exercise_completed">Exercises Completed</option>
            {:else}
              <option value="course_created">Courses Created</option>
              <option value="lesson_created">Lessons Created</option>
              <option value="exercise_created">Exercises Created</option>
            {/if}
            <option value="live_session">Live Sessions</option>
            <option value="certificate_deadline">Certificate Deadlines</option>
          </select>
        </div>

        <input
          type="search"
          class="search-input"
          placeholder="Search course, lesson, or instructor..."
          bind:value={searchQuery}
        />
      {/if}

      <div class="view-switcher" role="tablist" aria-label="Calendar view mode">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'month'}
          class:active={viewMode === 'month'}
          onclick={() => (viewMode = 'month')}
        >
          Month
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'week'}
          class:active={viewMode === 'week'}
          onclick={() => (viewMode = 'week')}
        >
          Week
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'agenda'}
          class:active={viewMode === 'agenda'}
          onclick={() => (viewMode = 'agenda')}
        >
          <ListIcon size={13} />
          <span>Agenda</span>
        </button>
      </div>

      <button
        type="button"
        class="btn-icon"
        onclick={loadSchedule}
        disabled={loading}
        title="Refresh schedule"
        aria-label="Refresh schedule"
      >
        <RefreshCwIcon size={15} class={loading ? 'spin' : ''} />
      </button>
    </div>
  </section>

  <main class="calendar-body">
    {#if loading}
      <div class="empty-state">
        <Loader2Icon size={28} class="spin accent-icon" />
        <h3>Loading course schedule...</h3>
        <p>Syncing live sessions and deadlines across your courses.</p>
      </div>
    {:else if error}
      <div class="empty-state error">
        <h3>Could not load schedule</h3>
        <p>{error}</p>
        <button type="button" class="btn-primary" onclick={loadSchedule}>Try Again</button>
      </div>
    {:else if viewMode === 'month'}
      <div class="month-layout">
        <div class="month-grid-container">
          <div class="weekday-header">
            {#each weekdayLabels as dayLabel (dayLabel)}
              <div class="weekday-cell">{dayLabel}</div>
            {/each}
          </div>

          <div class="month-grid">
            {#each monthGridCells as cell (cell.dateKey)}
              <div
                class="day-cell"
                class:outside={!cell.isCurrentMonth}
                class:today={cell.isToday}
                class:selected={selectedDayKey === cell.dateKey}
                role="button"
                tabindex="0"
                onclick={() => (selectedDayKey = cell.dateKey)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectedDayKey = cell.dateKey;
                  }
                }}
              >
                <div class="day-cell-header">
                  <span class="day-number">{cell.dayNumber}</span>
                  {#if cell.events.length > 0}
                    <span class="day-count">{cell.events.length}</span>
                  {/if}
                </div>

                <div class="day-events">
                  {#each cell.events.slice(0, 3) as event (event.id)}
                    {@const palette = getCourseColor(event.course.id)}
                    {@const status = getEventTimingStatus(event)}
                    <button
                      type="button"
                      class="event-pill"
                      style:background-color={palette.bg}
                      style:color={palette.text}
                      style:border-color={palette.border}
                      onclick={(e) => {
                        e.stopPropagation();
                        selectedEvent = event;
                      }}
                    >
                      <span
                        class="event-dot"
                        style:background-color={status === 'live' ? '#ef4444' : palette.dot}
                      ></span>
                      <span class="event-time">{formatEventTime(event.startsAt)}</span>
                      <span class="event-title">{event.title}</span>
                    </button>
                  {/each}

                  {#if cell.events.length > 3}
                    <button
                      type="button"
                      class="more-events-btn"
                      onclick={(e) => {
                        e.stopPropagation();
                        selectedDayKey = cell.dateKey;
                      }}
                    >
                      +{cell.events.length - 3} more
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>

        {#if selectedDayCell}
          <aside class="day-sidebar">
            <div class="day-sidebar-header">
              <div>
                <h4>{formatFullDate(selectedDayCell.date)}</h4>
                <p>
                  {selectedDayCell.events.length}
                  {selectedDayCell.events.length === 1 ? 'item' : 'items'} on this date
                </p>
              </div>
              <button
                type="button"
                class="btn-icon"
                onclick={() => (selectedDayKey = null)}
                aria-label="Close day panel"
              >
                <XIcon size={15} />
              </button>
            </div>

            {#if selectedDayCell.events.length === 0}
              <div class="day-sidebar-empty">
                <CalendarIcon size={22} />
                <p>No items recorded on this date.</p>
              </div>
            {:else}
              <div class="day-sidebar-list">
                {#each selectedDayCell.events as event (event.id)}
                  {@const palette = getCourseColor(event.course.id)}
                  {@const status = getEventTimingStatus(event)}
                  {@const hasRelated = Boolean(event.relatedItems && event.relatedItems.length > 0)}
                  {@const isExpanded = expandedEventIds.has(event.id)}
                  <div class="agenda-card compact">
                    <div class="agenda-card-top">
                      <span
                        class="course-tag"
                        style:background-color={palette.bg}
                        style:color={palette.text}
                      >
                        {event.course.title}
                      </span>
                      <span class="status-badge {event.type === 'live_session' ? status : 'upcoming'}">
                        {event.type === 'live_session'
                          ? status === 'live'
                            ? 'Live Now'
                            : status === 'upcoming'
                              ? 'Upcoming'
                              : 'Completed'
                          : getEventTypeLabel(event)}
                      </span>
                    </div>
                    <button
                      type="button"
                      class="agenda-title-btn"
                      onclick={() => {
                        if (hasRelated) {
                          toggleEventExpanded(event.id);
                        } else {
                          selectedEvent = event;
                        }
                      }}
                    >
                      {event.title}
                    </button>
                    <div class="agenda-meta">
                      <span>
                        <ClockIcon size={12} />
                        {formatEventTimeRange(event.startsAt, event.endsAt)}
                      </span>
                      {#if event.instructor}
                        <span>
                          <UserIcon size={12} />
                          {event.instructor.name}
                        </span>
                      {/if}
                    </div>
                    {#if hasRelated && event.relatedItems}
                      <div class="related-dropdown" class:open={isExpanded}>
                        <button
                          type="button"
                          class="related-dropdown-trigger"
                          aria-expanded={isExpanded}
                          onclick={() => toggleEventExpanded(event.id)}
                        >
                          <span>
                            {isExpanded
                              ? `Hide ${event.relatedItems.length} lesson${event.relatedItems.length === 1 ? '' : 's'} & exercise${event.relatedItems.length === 1 ? '' : 's'} created`
                              : `Show ${event.relatedItems.length} lesson${event.relatedItems.length === 1 ? '' : 's'} & exercise${event.relatedItems.length === 1 ? '' : 's'} created`}
                          </span>
                          <span class="trigger-chevron" class:rotated={isExpanded}>
                            <ChevronDownIcon size={14} />
                          </span>
                        </button>
                        {#if isExpanded}
                          <ul class="related-items-list">
                            {#each event.relatedItems as item (item.kind + ':' + item.id)}
                              <li class="related-item-row">
                                <span class="related-kind-pill {item.kind}">{item.kind}</span>
                                <span class="related-item-title">{item.title}</span>
                              </li>
                            {/each}
                          </ul>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </aside>
        {/if}
      </div>
    {:else if viewMode === 'week'}
      <div class="week-grid">
        {#each weekDayCells as day (day.dateKey)}
          <div class="week-column" class:today={day.isToday}>
            <div class="week-column-header">
              <span class="week-day-name">
                {day.date.toLocaleDateString([], { weekday: 'short' })}
              </span>
              <span class="week-day-num" class:today={day.isToday}>{day.dayNumber}</span>
            </div>

            <div class="week-column-body">
              {#if day.events.length === 0}
                <div class="week-empty">No activity</div>
              {:else}
                {#each day.events as event (event.id)}
                  {@const palette = getCourseColor(event.course.id)}
                  {@const status = getEventTimingStatus(event)}
                  <button
                    type="button"
                    class="week-event-card"
                    style:border-left-color={palette.dot}
                    onclick={() => (selectedEvent = event)}
                  >
                    <div class="week-event-time">
                      <span>{formatEventTime(event.startsAt)}</span>
                      {#if status === 'live'}
                        <span class="live-indicator">LIVE</span>
                      {/if}
                    </div>
                    <div class="week-event-title">{event.title}</div>
                    <div class="week-event-course" style:color={palette.text}>
                      {event.course.title}
                    </div>
                    {#if event.instructor}
                      <div class="week-event-instructor">
                        <UserIcon size={11} />
                        <span>{event.instructor.name}</span>
                      </div>
                    {/if}
                  </button>
                {/each}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      {#if agendaGroups.length === 0}
        <div class="empty-state">
          <CalendarIcon size={32} class="accent-icon" />
          <h3>No calendar activity found</h3>
          <p>
            {#if role === 'student'}
              Completed courses, lessons, exercises, live sessions, and certificate deadlines for your enrolled courses will appear here.
            {:else}
              Created courses, lessons, exercises, and scheduled live sessions across your academy will appear here.
            {/if}
          </p>
        </div>
      {:else}
        <div class="agenda-list">
          {#each agendaGroups as group (group.dateKey)}
            <div class="agenda-group">
              <div class="agenda-date-header">
                <span class="agenda-date-title">{formatFullDate(group.date)}</span>
                <span class="agenda-date-count">
                  {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div class="agenda-items">
                {#each group.items as event (event.id)}
                  {@const palette = getCourseColor(event.course.id)}
                  {@const status = getEventTimingStatus(event)}
                  {@const hasRelated = Boolean(event.relatedItems && event.relatedItems.length > 0)}
                  {@const isExpanded = expandedEventIds.has(event.id)}
                  <div class="agenda-row">
                    <div class="agenda-time-col">
                      <span class="primary-time">{formatEventTime(event.startsAt)}</span>
                      {#if event.durationMinutes > 0}
                        <span class="duration-text">{event.durationMinutes} min</span>
                      {/if}
                    </div>

                    <div class="agenda-content-col">
                      <div class="agenda-badges">
                        <span
                          class="course-tag"
                          style:background-color={palette.bg}
                          style:color={palette.text}
                        >
                          {event.course.title}
                        </span>
                        <span class="status-badge {event.type === 'live_session' ? status : 'upcoming'}">
                          {event.type === 'live_session'
                            ? status === 'live'
                              ? 'Live Now'
                              : status === 'upcoming'
                                ? formatRelativeTime(event.startsAt)
                                : 'Completed'
                            : getEventTypeLabel(event)}
                        </span>
                      </div>

                      <button
                        type="button"
                        class="agenda-title-btn"
                        onclick={() => (selectedEvent = event)}
                      >
                        {event.title}
                      </button>

                      <div class="agenda-meta">
                        <span>
                          <ClockIcon size={13} />
                          {formatEventTimeRange(event.startsAt, event.endsAt)}
                        </span>
                        {#if event.instructor}
                          <span>
                            <UserIcon size={13} />
                            {event.instructor.name}
                          </span>
                        {/if}
                        {#if event.timezone}
                          <span>
                            <GlobeIcon size={13} />
                            Course TZ: {event.timezone}
                          </span>
                        {/if}
                      </div>

                      {#if hasRelated && event.relatedItems}
                        <div class="related-dropdown" class:open={isExpanded}>
                          <button
                            type="button"
                            class="related-dropdown-trigger"
                            aria-expanded={isExpanded}
                            onclick={() => toggleEventExpanded(event.id)}
                          >
                            <span>
                              {isExpanded
                                ? `Hide ${event.relatedItems.length} lesson${event.relatedItems.length === 1 ? '' : 's'} & exercise${event.relatedItems.length === 1 ? '' : 's'} created`
                                : `Show ${event.relatedItems.length} lesson${event.relatedItems.length === 1 ? '' : 's'} & exercise${event.relatedItems.length === 1 ? '' : 's'} created`}
                            </span>
                            <span class="trigger-chevron" class:rotated={isExpanded}>
                              <ChevronDownIcon size={14} />
                            </span>
                          </button>
                          {#if isExpanded}
                            <ul class="related-items-list">
                              {#each event.relatedItems as item (item.kind + ':' + item.id)}
                                <li class="related-item-row">
                                  <span class="related-kind-pill {item.kind}">{item.kind}</span>
                                  <span class="related-item-title">{item.title}</span>
                                </li>
                              {/each}
                            </ul>
                          {/if}
                        </div>
                      {/if}
                    </div>

                    <div class="agenda-actions-col">
                      {#if event.lesson?.callUrl && status !== 'completed'}
                        <a
                          href={event.lesson.callUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="btn-primary sm"
                        >
                          <VideoIcon size={14} />
                          <span>Join Live</span>
                        </a>
                      {:else if event.lesson?.recordingUrl}
                        <a
                          href={event.lesson.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="btn-outline sm"
                        >
                          <VideoIcon size={14} />
                          <span>Recording</span>
                        </a>
                      {/if}
                      <button
                        type="button"
                        class="btn-outline sm"
                        onclick={() => (selectedEvent = event)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </main>

  {#if selectedEvent}
    {@const palette = getCourseColor(selectedEvent.course.id)}
    {@const status = getEventTimingStatus(selectedEvent)}
    <div
      class="modal-backdrop"
      role="presentation"
      onclick={() => (selectedEvent = null)}
    >
      <div
        class="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
        tabindex="-1"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => {
          if (e.key === 'Escape') selectedEvent = null;
        }}
      >
        <div class="modal-header">
          <div class="modal-badges">
            <span
              class="course-tag"
              style:background-color={palette.bg}
              style:color={palette.text}
            >
              {selectedEvent.course.title}
            </span>
            <span class="status-badge {selectedEvent.type === 'live_session' ? status : 'upcoming'}">
              {selectedEvent.type === 'live_session'
                ? status === 'live'
                  ? 'Live Now'
                  : status === 'upcoming'
                    ? formatRelativeTime(selectedEvent.startsAt)
                    : 'Completed'
                : getEventTypeLabel(selectedEvent)}
            </span>
          </div>
          <button
            type="button"
            class="btn-icon"
            onclick={() => (selectedEvent = null)}
            aria-label="Close details"
          >
            <XIcon size={16} />
          </button>
        </div>

        <h3 id="event-dialog-title" class="modal-title">{selectedEvent.title}</h3>

        <div class="modal-details-grid">
          <div class="detail-item">
            <span class="detail-label">Date</span>
            <span class="detail-value">{formatFullDate(selectedEvent.startsAt)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Time ({localTimezone})</span>
            <span class="detail-value">
              {formatEventTimeRange(selectedEvent.startsAt, selectedEvent.endsAt)}
              {#if selectedEvent.durationMinutes > 0}
                ({selectedEvent.durationMinutes} mins)
              {/if}
            </span>
          </div>
          {#if selectedEvent.instructor}
            <div class="detail-item">
              <span class="detail-label">Instructor</span>
              <span class="detail-value">{selectedEvent.instructor.name}</span>
            </div>
          {/if}
          {#if selectedEvent.timezone}
            <div class="detail-item">
              <span class="detail-label">Course Timezone</span>
              <span class="detail-value">{selectedEvent.timezone}</span>
            </div>
          {/if}
        </div>

        {#if selectedEvent.relatedItems && selectedEvent.relatedItems.length > 0}
          <div class="modal-related-section">
            <span class="detail-label">
              Lessons & Exercises Created ({selectedEvent.relatedItems.length})
            </span>
            <ul class="related-items-list modal">
              {#each selectedEvent.relatedItems as item (item.kind + ':' + item.id)}
                <li class="related-item-row">
                  <span class="related-kind-pill {item.kind}">{item.kind}</span>
                  <span class="related-item-title">{item.title}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="modal-footer">
          {#if selectedEvent.lesson?.callUrl}
            <a
              href={selectedEvent.lesson.callUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary"
            >
              <VideoIcon size={15} />
              <span>Join Live Session</span>
              <ExternalLinkIcon size={13} />
            </a>
          {/if}

          {#if selectedEvent.lesson?.recordingUrl}
            <a
              href={selectedEvent.lesson.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="btn-outline"
            >
              <VideoIcon size={15} />
              <span>Watch Recording</span>
              <ExternalLinkIcon size={13} />
            </a>
          {/if}

          <button
            type="button"
            class="btn-outline"
            onclick={() => selectedEvent && openCourseInHost(selectedEvent)}
          >
            <span>Open Course</span>
            <ExternalLinkIcon size={13} />
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .calendar-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    background: var(--cio-background, #ffffff);
    color: var(--cio-foreground, #0f172a);
  }

  .calendar-shell.compact {
    height: auto;
    min-height: 440px;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    flex-wrap: wrap;
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .brand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.625rem;
    background: rgba(37, 99, 235, 0.1);
    color: var(--cio-accent, #2563eb);
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-wrap: wrap;
  }

  h1 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    background: rgba(16, 185, 129, 0.12);
    color: #059669;
  }

  .role-badge.staff {
    background: rgba(37, 99, 235, 0.12);
    color: var(--cio-accent, #2563eb);
  }

  .readonly-pill {
    font-size: 0.7rem;
    font-weight: 500;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background: var(--cio-surface-muted, #f8fafc);
    color: var(--cio-foreground-muted, #64748b);
    border: 1px solid var(--cio-border, #e2e8f0);
  }

  .subtitle {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0.2rem 0 0;
    font-size: 0.75rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  .stats-strip {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .stat-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.7rem;
    border-radius: 0.5rem;
    background: var(--cio-surface-muted, #f8fafc);
    border: 1px solid var(--cio-border, #e2e8f0);
    font-size: 0.75rem;
  }

  .stat-chip.live {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.3);
    color: #dc2626;
  }

  .stat-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 999px;
  }

  .stat-dot.upcoming {
    background: #2563eb;
  }

  .stat-dot.live {
    background: #ef4444;
  }

  .stat-dot.completed {
    background: #94a3b8;
  }

  .stat-value {
    font-weight: 700;
  }

  .stat-label {
    color: var(--cio-foreground-muted, #64748b);
  }

  .controls-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    flex-wrap: wrap;
  }

  .period-nav {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .step-buttons {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .period-label {
    margin: 0 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 600;
  }

  .filters-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .select-wrap {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0 0.6rem;
    height: 2.125rem;
    border-radius: 0.5rem;
    border: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    color: var(--cio-foreground, #0f172a);
    font-size: 0.8rem;
  }

  .select-wrap select {
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 0.8rem;
    outline: none;
    cursor: pointer;
    max-width: 13rem;
  }

  .search-input {
    height: 2.125rem;
    padding: 0 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    color: var(--cio-foreground, #0f172a);
    font-size: 0.8rem;
    width: 13rem;
  }

  .view-switcher {
    display: inline-flex;
    padding: 0.18rem;
    border-radius: 0.5rem;
    background: var(--cio-surface-muted, #f1f5f9);
    border: 1px solid var(--cio-border, #e2e8f0);
  }

  .view-switcher button {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    border: 0;
    background: transparent;
    color: var(--cio-foreground-muted, #64748b);
    padding: 0.3rem 0.65rem;
    border-radius: 0.375rem;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .view-switcher button.active {
    background: var(--cio-surface, #ffffff);
    color: var(--cio-foreground, #0f172a);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  }

  .btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    height: 2.125rem;
    padding: 0 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    color: var(--cio-foreground, #0f172a);
    font-size: 0.8rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
  }

  .btn-outline:hover {
    background: var(--cio-surface-muted, #f8fafc);
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    height: 2.125rem;
    padding: 0 0.875rem;
    border-radius: 0.5rem;
    border: 0;
    background: var(--cio-accent, #2563eb);
    color: var(--cio-accent-foreground, #ffffff);
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  .btn-primary.sm,
  .btn-outline.sm {
    height: 1.85rem;
    padding: 0 0.65rem;
    font-size: 0.75rem;
  }

  .btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.125rem;
    height: 2.125rem;
    border-radius: 0.5rem;
    border: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    color: var(--cio-foreground, #0f172a);
    cursor: pointer;
  }

  .btn-icon:hover {
    background: var(--cio-surface-muted, #f8fafc);
  }

  .calendar-body {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  .month-layout {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .month-grid-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .weekday-header {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface-muted, #f8fafc);
  }

  .weekday-cell {
    padding: 0.5rem 0.75rem;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--cio-foreground-muted, #64748b);
    text-align: left;
  }

  .month-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: repeat(6, minmax(6.25rem, 1fr));
  }

  .day-cell {
    display: flex;
    flex-direction: column;
    padding: 0.45rem;
    border-right: 1px solid var(--cio-border, #e2e8f0);
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    cursor: pointer;
    transition: background-color 0.12s ease;
    min-width: 0;
  }

  .day-cell:hover {
    background: var(--cio-surface-muted, #f8fafc);
  }

  .day-cell.outside {
    background: rgba(148, 163, 184, 0.04);
    color: var(--cio-foreground-muted, #94a3b8);
  }

  .day-cell.selected {
    box-shadow: inset 0 0 0 2px var(--cio-accent, #2563eb);
  }

  .day-cell-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.35rem;
  }

  .day-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .day-cell.today .day-number {
    background: var(--cio-accent, #2563eb);
    color: var(--cio-accent-foreground, #ffffff);
  }

  .day-count {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--cio-foreground-muted, #64748b);
  }

  .day-events {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .event-pill {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    width: 100%;
    padding: 0.2rem 0.4rem;
    border-radius: 0.35rem;
    border: 1px solid transparent;
    font-size: 0.7rem;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    white-space: nowrap;
  }

  .event-dot {
    width: 0.38rem;
    height: 0.38rem;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .event-time {
    font-weight: 600;
    flex-shrink: 0;
  }

  .event-title {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .more-events-btn {
    border: 0;
    background: transparent;
    color: var(--cio-foreground-muted, #64748b);
    font-size: 0.68rem;
    font-weight: 600;
    text-align: left;
    padding: 0.1rem 0.25rem;
    cursor: pointer;
  }

  .day-sidebar {
    width: 20rem;
    border-left: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    display: flex;
    flex-direction: column;
  }

  .day-sidebar-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
  }

  .day-sidebar-header h4 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .day-sidebar-header p {
    margin: 0.2rem 0 0;
    font-size: 0.75rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  .day-sidebar-empty {
    padding: 2.5rem 1.25rem;
    text-align: center;
    color: var(--cio-foreground-muted, #64748b);
    font-size: 0.8rem;
  }

  .day-sidebar-list {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    overflow-y: auto;
  }

  .week-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(10rem, 1fr));
    flex: 1;
    overflow-x: auto;
  }

  .week-column {
    border-right: 1px solid var(--cio-border, #e2e8f0);
    display: flex;
    flex-direction: column;
    min-height: 28rem;
  }

  .week-column.today {
    background: rgba(37, 99, 235, 0.02);
  }

  .week-column-header {
    padding: 0.75rem;
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--cio-surface-muted, #f8fafc);
  }

  .week-day-name {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--cio-foreground-muted, #64748b);
  }

  .week-day-num {
    width: 1.65rem;
    height: 1.65rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    font-weight: 700;
  }

  .week-day-num.today {
    background: var(--cio-accent, #2563eb);
    color: #ffffff;
  }

  .week-column-body {
    padding: 0.625rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .week-empty {
    font-size: 0.75rem;
    color: var(--cio-foreground-muted, #94a3b8);
    text-align: center;
    padding: 1.5rem 0.5rem;
  }

  .week-event-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.6rem;
    border-radius: 0.5rem;
    border: 1px solid var(--cio-border, #e2e8f0);
    border-left-width: 3px;
    background: var(--cio-surface, #ffffff);
    text-align: left;
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  .week-event-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
  }

  .week-event-time {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--cio-foreground-muted, #64748b);
  }

  .live-indicator {
    background: #ef4444;
    color: #ffffff;
    padding: 0.05rem 0.35rem;
    border-radius: 0.25rem;
    font-size: 0.62rem;
    font-weight: 700;
  }

  .week-event-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--cio-foreground, #0f172a);
  }

  .week-event-course {
    font-size: 0.72rem;
    font-weight: 600;
  }

  .week-event-instructor {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  .agenda-list {
    max-width: 58rem;
    width: 100%;
    margin: 0 auto;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .agenda-group {
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: 0.75rem;
    overflow: hidden;
    background: var(--cio-surface, #ffffff);
  }

  .agenda-date-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 1rem;
    background: var(--cio-surface-muted, #f8fafc);
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
  }

  .agenda-date-title {
    font-size: 0.82rem;
    font-weight: 600;
  }

  .agenda-date-count {
    font-size: 0.72rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  .agenda-items {
    display: flex;
    flex-direction: column;
  }

  .agenda-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
  }

  .agenda-row:last-child {
    border-bottom: 0;
  }

  .agenda-time-col {
    min-width: 5.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .primary-time {
    font-size: 0.85rem;
    font-weight: 700;
  }

  .duration-text {
    font-size: 0.72rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  .agenda-content-col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .agenda-badges {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
  }

  .course-tag {
    display: inline-flex;
    align-items: center;
    padding: 0.15rem 0.5rem;
    border-radius: 0.35rem;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .status-badge {
    font-size: 0.68rem;
    font-weight: 600;
    padding: 0.12rem 0.45rem;
    border-radius: 999px;
  }

  .status-badge.live {
    background: rgba(239, 68, 68, 0.12);
    color: #dc2626;
  }

  .status-badge.upcoming {
    background: rgba(37, 99, 235, 0.1);
    color: #2563eb;
  }

  .status-badge.completed {
    background: var(--cio-surface-muted, #f1f5f9);
    color: var(--cio-foreground-muted, #64748b);
  }

  .agenda-title-btn {
    border: 0;
    background: transparent;
    padding: 0;
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--cio-foreground, #0f172a);
    text-align: left;
    cursor: pointer;
  }

  .agenda-title-btn:hover {
    color: var(--cio-accent, #2563eb);
  }

  .agenda-meta {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex-wrap: wrap;
    font-size: 0.74rem;
    color: var(--cio-foreground-muted, #64748b);
  }

  .agenda-meta span {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
  }

  .agenda-actions-col {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-shrink: 0;
  }

  .agenda-card.compact {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
    text-align: left;
    cursor: pointer;
  }

  .agenda-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.35rem;
  }

  .empty-state {
    margin: auto;
    padding: 3rem 1.5rem;
    text-align: center;
    max-width: 26rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .empty-state h3 {
    margin: 0.25rem 0 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.82rem;
    color: var(--cio-foreground-muted, #64748b);
    line-height: 1.5;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 50;
  }

  .modal-card {
    width: 100%;
    max-width: 28rem;
    border-radius: 0.875rem;
    background: var(--cio-surface, #ffffff);
    border: 1px solid var(--cio-border, #e2e8f0);
    padding: 1.25rem;
    box-shadow: 0 20px 35px rgba(15, 23, 42, 0.18);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .modal-badges {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .modal-title {
    margin: 0.75rem 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .modal-details-grid {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 0.875rem;
    border-radius: 0.625rem;
    background: var(--cio-surface-muted, #f8fafc);
    border: 1px solid var(--cio-border, #e2e8f0);
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.12rem;
  }

  .detail-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--cio-foreground-muted, #64748b);
  }

  .detail-value {
    font-size: 0.84rem;
    font-weight: 500;
  }

  .modal-footer {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .related-dropdown {
    margin-top: 0.4rem;
    width: 100%;
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: 0.5rem;
    background: var(--cio-surface, #ffffff);
    overflow: hidden;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .related-dropdown:hover,
  .related-dropdown.open {
    border-color: #cbd5e1;
  }

  .related-dropdown-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    background: var(--cio-surface-muted, #f8fafc);
    border: 0;
    padding: 0.42rem 0.65rem;
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--cio-foreground, #0f172a);
    text-align: left;
    cursor: pointer;
    transition: background-color 0.12s ease;
  }

  .related-dropdown-trigger:hover {
    background: #f1f5f9;
  }

  .trigger-chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--cio-foreground-muted, #64748b);
    transition: transform 0.18s ease;
    flex-shrink: 0;
  }

  .trigger-chevron.rotated {
    transform: rotate(180deg);
  }

  .related-items-list {
    list-style: none;
    margin: 0;
    padding: 0.45rem 0.65rem;
    background: var(--cio-surface, #ffffff);
    border-top: 1px solid var(--cio-border, #e2e8f0);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .related-items-list.modal {
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: 0.5rem;
    background: var(--cio-surface-muted, #f8fafc);
    max-height: 180px;
    overflow-y: auto;
  }

  .related-item-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.76rem;
    color: var(--cio-foreground, #0f172a);
  }

  .related-kind-pill {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.1rem 0.38rem;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.12);
    color: #1d4ed8;
    flex-shrink: 0;
  }

  .related-kind-pill.exercise {
    background: rgba(124, 58, 237, 0.12);
    color: #6d28d9;
  }

  .related-item-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .modal-related-section {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 0.25rem;
  }

  :global(.spin) {
    animation: spin 1s linear infinite;
  }

  :global(.accent-icon) {
    color: var(--cio-accent, #2563eb);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
