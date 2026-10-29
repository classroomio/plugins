import { describe, expect, it } from 'vitest';
import type {
  CalendarEvent,
  PluginCourseRecord,
  PluginExerciseRecord,
  PluginLessonRecord
} from './types';
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

  it('groups same-day created lessons/exercises under course_created for admins and emits separate events for later days', () => {
    const courses: PluginCourseRecord[] = [
      {
        id: 'course-1',
        title: 'Distributed Systems 101',
        slug: 'distributed-systems-101',
        description: null,
        imageUrl: null,
        type: 'LIVE_CLASS',
        status: 'ACTIVE',
        visibility: 'public',
        published: true,
        publishedAt: null,
        sessionTimezone: 'Africa/Lagos',
        certificateDeadline: '2026-10-30T23:59:00.000Z',
        instructor: { name: 'Grace Hopper', avatarUrl: null },
        createdAt: '2026-10-01T10:00:00.000Z',
        updatedAt: '2026-10-01T10:00:00.000Z'
      }
    ];

    const lessons: PluginLessonRecord[] = [
      {
        id: 'lesson-1',
        courseId: 'course-1',
        title: 'Consensus Protocols Live',
        slug: 'consensus-protocols-live',
        order: 1,
        isUnlocked: true,
        lessonAt: '2026-10-20T14:00:00.000Z',
        callUrl: 'https://meet.google.com/abc',
        recordingUrl: null,
        sessionDurationMinutes: 90,
        instructor: null,
        createdAt: '2026-10-01T10:05:00.000Z',
        updatedAt: '2026-10-01T10:05:00.000Z'
      },
      {
        id: 'lesson-2',
        courseId: 'course-1',
        title: 'Raft Deep Dive',
        slug: 'raft-deep-dive',
        order: 2,
        isUnlocked: true,
        lessonAt: null,
        callUrl: null,
        recordingUrl: null,
        sessionDurationMinutes: null,
        instructor: null,
        createdAt: '2026-10-05T11:00:00.000Z',
        updatedAt: '2026-10-05T11:00:00.000Z'
      }
    ];

    const exercises: PluginExerciseRecord[] = [
      {
        id: 'ex-1',
        courseId: 'course-1',
        lessonId: null,
        title: 'Quiz 1',
        description: null,
        order: 1,
        createdAt: '2026-10-01T10:10:00.000Z',
        updatedAt: '2026-10-01T10:10:00.000Z'
      }
    ];

    const derived = buildCalendarEvents(courses, lessons, exercises, 'admin');
    const courseCreated = derived.find((event) => event.type === 'course_created');
    expect(courseCreated).toBeDefined();
    expect(courseCreated?.relatedItems).toHaveLength(2);

    const laterLessonCreated = derived.find((event) => event.type === 'lesson_created');
    expect(laterLessonCreated?.title).toBe('Raft Deep Dive');
  });

  it('tracks completed courses, lessons, and exercises for students', () => {
    const courses: PluginCourseRecord[] = [
      {
        id: 'course-1',
        title: 'Python 101',
        slug: 'python-101',
        description: null,
        imageUrl: null,
        type: 'SELF_PACED',
        status: 'ACTIVE',
        visibility: 'public',
        published: true,
        publishedAt: null,
        sessionTimezone: null,
        certificateDeadline: null,
        completedAt: '2026-10-12T16:00:00.000Z',
        instructor: null,
        createdAt: '2026-10-01T10:00:00.000Z',
        updatedAt: '2026-10-01T10:00:00.000Z'
      }
    ];

    const lessons: PluginLessonRecord[] = [
      {
        id: 'lesson-1',
        courseId: 'course-1',
        title: 'Variables & Types',
        slug: 'variables-and-types',
        order: 1,
        isUnlocked: true,
        lessonAt: null,
        callUrl: null,
        recordingUrl: null,
        sessionDurationMinutes: null,
        completedAt: '2026-10-10T12:00:00.000Z',
        instructor: null,
        createdAt: '2026-10-01T10:00:00.000Z',
        updatedAt: '2026-10-01T10:00:00.000Z'
      }
    ];

    const exercises: PluginExerciseRecord[] = [
      {
        id: 'ex-1',
        courseId: 'course-1',
        lessonId: null,
        title: 'Python Basics Exercise',
        description: null,
        order: 1,
        completedAt: '2026-10-11T15:30:00.000Z',
        createdAt: '2026-10-01T10:00:00.000Z',
        updatedAt: '2026-10-01T10:00:00.000Z'
      }
    ];

    const derived = buildCalendarEvents(courses, lessons, exercises, 'student');
    expect(derived.map((e) => e.type)).toEqual([
      'lesson_completed',
      'exercise_completed',
      'course_completed'
    ]);
  });
});
