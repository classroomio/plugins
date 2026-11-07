import { describe, expect, it } from 'vitest';
import type { CalendarEvent, PluginCourseRecord, PluginExerciseRecord, PluginLessonRecord } from './types';
import {
  buildCalendarEvents,
  buildMonthGrid,
  buildWeekDays,
  getCourseColor,
  getEventTimingStatus,
  toLocalDateKey
} from './calendar-utils';

const sampleEvent: CalendarEvent = {
  id: 'lesson:1',
  title: 'System Design Live Workshop',
  type: 'live_session',
  startsAt: '2026-10-15T14:00:00.000Z',
  endsAt: '2026-10-15T15:00:00.000Z',
  durationMinutes: 60,
  timezone: 'UTC',
  course: {
    id: 'course-1',
    title: 'Distributed Systems 101',
    slug: 'distributed-systems-101',
    type: 'LIVE_CLASS'
  },
  lesson: {
    id: 'lesson-1',
    title: 'System Design Live Workshop',
    callUrl: 'https://meet.google.com/abc-defg-hij',
    recordingUrl: null
  },
  instructor: {
    id: 'teacher-1',
    name: 'Ada Lovelace',
    avatarUrl: null
  }
};

describe('calendar-utils', () => {
  it('builds a 42-cell month grid and maps events into the matching day cell', () => {
    const now = new Date('2026-10-10T10:00:00.000Z');
    const grid = buildMonthGrid(2026, 9, [sampleEvent], now);
    expect(grid).toHaveLength(42);

    const targetKey = toLocalDateKey(new Date(sampleEvent.startsAt));
    const matchedCell = grid.find((cell) => cell.dateKey === targetKey);
    expect(matchedCell).toBeDefined();
    expect(matchedCell?.events).toHaveLength(1);
    expect(matchedCell?.events[0]?.title).toBe('System Design Live Workshop');
  });

  it('builds a 7-day week timeline around the anchor date', () => {
    const anchor = new Date(sampleEvent.startsAt);
    const week = buildWeekDays(anchor, [sampleEvent], anchor);
    expect(week).toHaveLength(7);
    const totalEvents = week.reduce((acc, day) => acc + day.events.length, 0);
    expect(totalEvents).toBe(1);
  });

  it('computes event timing status accurately', () => {
    expect(getEventTimingStatus(sampleEvent, new Date('2026-10-15T13:00:00.000Z'))).toBe('upcoming');
    expect(getEventTimingStatus(sampleEvent, new Date('2026-10-15T14:30:00.000Z'))).toBe('live');
    expect(getEventTimingStatus(sampleEvent, new Date('2026-10-15T16:00:00.000Z'))).toBe('completed');
  });

  it('assigns deterministic palette colors per course id', () => {
    const first = getCourseColor('course-alpha');
    const second = getCourseColor('course-alpha');
    expect(first).toEqual(second);
  });

  it('builds only live classes, exercise due dates, and course deadlines', () => {
    const courses: PluginCourseRecord[] = [
      {
        id: 'course-1',
        title: 'Distributed Systems 101',
        slug: 'distributed-systems-101',
        type: 'LIVE_CLASS',
        sessionTimezone: 'Africa/Lagos',
        certificateDeadline: '2026-10-30T23:59:00.000Z',
        instructor: { name: 'Grace Hopper', avatarUrl: null },
        createdAt: '2026-10-01T10:00:00.000Z'
      }
    ];

    const lessons: PluginLessonRecord[] = [
      {
        id: 'lesson-1',
        courseId: 'course-1',
        title: 'Consensus Protocols Live',
        lessonAt: '2026-10-20T14:00:00.000Z',
        callUrl: 'https://meet.google.com/abc',
        recordingUrl: null,
        sessionDurationMinutes: 90,
        instructor: null,
        createdAt: '2026-10-01T10:05:00.000Z'
      },
      {
        id: 'lesson-2',
        courseId: 'course-1',
        title: 'Raft Deep Dive',
        lessonAt: null,
        callUrl: null,
        recordingUrl: null,
        sessionDurationMinutes: null,
        instructor: null,
        createdAt: '2026-10-05T11:00:00.000Z'
      }
    ];

    const exercises: PluginExerciseRecord[] = [
      {
        id: 'ex-1',
        courseId: 'course-1',
        title: 'Quiz 1',
        dueBy: '2026-10-25T17:00:00.000Z',
        createdAt: '2026-10-01T10:10:00.000Z'
      }
    ];

    const derived = buildCalendarEvents(courses, lessons, exercises);
    expect(derived.map((event) => event.type)).toEqual(['live_session', 'exercise_due', 'certificate_deadline']);
    expect(derived.some((event) => event.startsAt === courses[0].createdAt)).toBe(false);
    expect(derived.some((event) => event.startsAt === lessons[1].createdAt)).toBe(false);
  });

  it('does not turn creation timestamps into calendar events', () => {
    const courses: PluginCourseRecord[] = [
      {
        id: 'course-1',
        title: 'Python 101',
        slug: 'python-101',
        type: 'SELF_PACED',
        sessionTimezone: null,
        certificateDeadline: null,
        instructor: null,
        createdAt: '2026-10-01T10:00:00.000Z'
      }
    ];

    const lessons: PluginLessonRecord[] = [
      {
        id: 'lesson-1',
        courseId: 'course-1',
        title: 'Variables & Types',
        lessonAt: null,
        callUrl: null,
        recordingUrl: null,
        sessionDurationMinutes: null,
        instructor: null,
        createdAt: '2026-10-01T10:00:00.000Z'
      }
    ];

    const exercises: PluginExerciseRecord[] = [
      {
        id: 'ex-1',
        courseId: 'course-1',
        title: 'Python Basics Exercise',
        dueBy: null,
        createdAt: '2026-10-01T10:00:00.000Z'
      }
    ];

    const derived = buildCalendarEvents(courses, lessons, exercises);
    expect(derived).toEqual([]);
  });
});
