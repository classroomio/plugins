import type { CalendarEvent, PluginCourseRecord, PluginLessonRecord } from './types';

export interface CalendarDayCell {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export type SessionTimingStatus = 'live' | 'upcoming' | 'completed';

const DEFAULT_LESSON_DURATION_MINUTES = 60;

export function buildCalendarEvents(
  courses: PluginCourseRecord[],
  lessons: PluginLessonRecord[]
): CalendarEvent[] {
  const courseById = new Map<string, PluginCourseRecord>();
  for (const courseItem of courses) {
    courseById.set(courseItem.id, courseItem);
  }

  const events: CalendarEvent[] = [];

  for (const lesson of lessons) {
    if (!lesson.lessonAt) continue;

    const courseItem = courseById.get(lesson.courseId);
    if (!courseItem) continue;

    const startsAtDate = new Date(lesson.lessonAt);
    if (Number.isNaN(startsAtDate.getTime())) continue;

    const durationMinutes =
      lesson.sessionDurationMinutes && lesson.sessionDurationMinutes > 0
        ? lesson.sessionDurationMinutes
        : DEFAULT_LESSON_DURATION_MINUTES;

    const endsAtDate = new Date(startsAtDate.getTime() + durationMinutes * 60 * 1000);

    const instructor =
      lesson.instructor ??
      (courseItem.instructor
        ? {
            id: `course-instructor:${courseItem.id}`,
            name: courseItem.instructor.name,
            avatarUrl: courseItem.instructor.avatarUrl
          }
        : null);

    events.push({
      id: `lesson:${lesson.id}`,
      title: lesson.title,
      type: 'live_session',
      startsAt: startsAtDate.toISOString(),
      endsAt: endsAtDate.toISOString(),
      durationMinutes,
      timezone: courseItem.sessionTimezone ?? null,
      course: {
        id: courseItem.id,
        title: courseItem.title,
        slug: courseItem.slug,
        type: courseItem.type
      },
      lesson: {
        id: lesson.id,
        title: lesson.title,
        callUrl: lesson.callUrl,
        recordingUrl: lesson.recordingUrl
      },
      instructor
    });
  }

  for (const courseItem of courses) {
    if (!courseItem.certificateDeadline) continue;

    const deadlineDate = new Date(courseItem.certificateDeadline);
    if (Number.isNaN(deadlineDate.getTime())) continue;

    events.push({
      id: `certificate-deadline:${courseItem.id}`,
      title: `${courseItem.title} — Certificate Deadline`,
      type: 'certificate_deadline',
      startsAt: deadlineDate.toISOString(),
      endsAt: deadlineDate.toISOString(),
      durationMinutes: 0,
      timezone: courseItem.sessionTimezone ?? null,
      course: {
        id: courseItem.id,
        title: courseItem.title,
        slug: courseItem.slug,
        type: courseItem.type
      },
      lesson: null,
      instructor: courseItem.instructor
        ? {
            id: `course-instructor:${courseItem.id}`,
            name: courseItem.instructor.name,
            avatarUrl: courseItem.instructor.avatarUrl
          }
        : null
    });
  }

  events.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return events;
}

const COURSE_PALETTE = [
  { bg: 'rgba(37, 99, 235, 0.12)', text: '#1d4ed8', border: 'rgba(37, 99, 235, 0.3)', dot: '#2563eb' },
  { bg: 'rgba(5, 150, 105, 0.12)', text: '#047857', border: 'rgba(5, 150, 105, 0.3)', dot: '#059669' },
  { bg: 'rgba(124, 58, 237, 0.12)', text: '#6d28d9', border: 'rgba(124, 58, 237, 0.3)', dot: '#7c3aed' },
  { bg: 'rgba(217, 119, 6, 0.12)', text: '#b45309', border: 'rgba(217, 119, 6, 0.3)', dot: '#d97706' },
  { bg: 'rgba(225, 29, 72, 0.12)', text: '#be123c', border: 'rgba(225, 29, 72, 0.3)', dot: '#e11d48' },
  { bg: 'rgba(8, 145, 178, 0.12)', text: '#0e7490', border: 'rgba(8, 145, 178, 0.3)', dot: '#0891b2' }
] as const;

export function getCourseColor(courseId: string) {
  let hash = 0;
  for (let i = 0; i < courseId.length; i += 1) {
    hash = (hash * 31 + courseId.charCodeAt(i)) >>> 0;
  }
  return COURSE_PALETTE[hash % COURSE_PALETTE.length];
}

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildMonthGrid(
  year: number,
  month: number,
  events: CalendarEvent[],
  now = new Date()
): CalendarDayCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startDayOfWeek);

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const eventDate = new Date(event.startsAt);
    if (Number.isNaN(eventDate.getTime())) continue;
    const key = toLocalDateKey(eventDate);
    const list = eventsByDay.get(key) ?? [];
    list.push(event);
    eventsByDay.set(key, list);
  }

  const cells: CalendarDayCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const cellDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const dateKey = toLocalDateKey(cellDate);
    const dayEvents = (eventsByDay.get(dateKey) ?? []).slice().sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );

    cells.push({
      date: cellDate,
      dateKey,
      dayNumber: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === month && cellDate.getFullYear() === year,
      isToday: isSameDay(cellDate, now),
      events: dayEvents
    });
  }

  return cells;
}

export function buildWeekDays(
  anchorDate: Date,
  events: CalendarEvent[],
  now = new Date()
): CalendarDayCell[] {
  const dayOfWeek = anchorDate.getDay();
  const weekStart = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate() - dayOfWeek
  );

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const eventDate = new Date(event.startsAt);
    if (Number.isNaN(eventDate.getTime())) continue;
    const key = toLocalDateKey(eventDate);
    const list = eventsByDay.get(key) ?? [];
    list.push(event);
    eventsByDay.set(key, list);
  }

  const days: CalendarDayCell[] = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    const dateKey = toLocalDateKey(date);
    const dayEvents = (eventsByDay.get(dateKey) ?? []).slice().sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );

    days.push({
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === anchorDate.getMonth(),
      isToday: isSameDay(date, now),
      events: dayEvents
    });
  }

  return days;
}

export function getEventTimingStatus(
  event: CalendarEvent,
  now = new Date()
): SessionTimingStatus {
  const nowMs = now.getTime();
  const startMs = new Date(event.startsAt).getTime();
  const endMs = new Date(event.endsAt).getTime();

  if (nowMs >= startMs && nowMs <= endMs) {
    return 'live';
  }
  if (nowMs < startMs) {
    return 'upcoming';
  }
  return 'completed';
}

export function formatEventTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatEventTimeRange(startsAt: string, endsAt: string): string {
  const startText = formatEventTime(startsAt);
  const endText = formatEventTime(endsAt);
  if (!endText || startText === endText) return startText;
  return `${startText} – ${endText}`;
}

export function formatFullDate(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatRelativeTime(iso: string, now = new Date()): string {
  const targetMs = new Date(iso).getTime();
  const diffMinutes = Math.round((targetMs - now.getTime()) / (60 * 1000));

  if (Math.abs(diffMinutes) < 1) return 'Starting now';
  if (diffMinutes > 0) {
    if (diffMinutes < 60) return `In ${diffMinutes} min`;
    const hours = Math.floor(diffMinutes / 60);
    if (hours < 24) return `In ${hours} hr${hours === 1 ? '' : 's'}`;
    const days = Math.floor(hours / 24);
    return `In ${days} day${days === 1 ? '' : 's'}`;
  }

  const pastMinutes = Math.abs(diffMinutes);
  if (pastMinutes < 60) return `${pastMinutes} min ago`;
  const pastHours = Math.floor(pastMinutes / 60);
  if (pastHours < 24) return `${pastHours} hr${pastHours === 1 ? '' : 's'} ago`;
  const pastDays = Math.floor(pastHours / 24);
  return `${pastDays} day${pastDays === 1 ? '' : 's'} ago`;
}

