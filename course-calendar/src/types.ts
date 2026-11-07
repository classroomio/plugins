export interface CalendarCourseRef {
  id: string;
  title: string;
  slug: string | null;
  type: string | null;
}

import type { PluginCourseMetadata, PluginExerciseMetadata, PluginLessonMetadata } from '@classroomio/plugin-sdk';

export type PluginCourseRecord = Pick<
  PluginCourseMetadata,
  'id' | 'title' | 'slug' | 'type' | 'sessionTimezone' | 'certificateDeadline' | 'instructor' | 'createdAt'
>;
export type PluginLessonRecord = Pick<
  PluginLessonMetadata,
  | 'id'
  | 'courseId'
  | 'title'
  | 'lessonAt'
  | 'callUrl'
  | 'recordingUrl'
  | 'sessionDurationMinutes'
  | 'instructor'
  | 'createdAt'
>;
export type PluginExerciseRecord = Pick<PluginExerciseMetadata, 'id' | 'courseId' | 'title' | 'dueBy' | 'createdAt'>;

export type CalendarEventType =
  | 'live_session'
  | 'exercise_due'
  | 'certificate_deadline'
  | 'compliance_due'
  | 'course_created'
  | 'lesson_created'
  | 'exercise_created'
  | 'course_completed'
  | 'lesson_completed'
  | 'exercise_completed';

export interface CalendarRelatedItem {
  id: string;
  kind: 'lesson' | 'exercise';
  title: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  timezone: string | null;
  course: CalendarCourseRef;
  lesson: {
    id: string;
    title: string;
    callUrl: string | null;
    recordingUrl: string | null;
  } | null;
  exercise?: {
    id: string;
    title: string;
  } | null;
  relatedItems?: CalendarRelatedItem[];
  instructor: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}
