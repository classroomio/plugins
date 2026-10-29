export interface CalendarCourseRef {
  id: string;
  title: string;
  slug: string | null;
  type: string | null;
}

export interface PluginCourseRecord {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  imageUrl: string | null;
  type: string | null;
  status: string;
  visibility: 'public' | 'private';
  published: boolean;
  publishedAt: string | null;
  sessionTimezone: string | null;
  certificateDeadline: string | null;
  completedAt?: string | null;
  instructor: {
    name: string;
    avatarUrl: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PluginLessonRecord {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  order: number;
  isUnlocked: boolean;
  lessonAt: string | null;
  callUrl: string | null;
  recordingUrl: string | null;
  sessionDurationMinutes: number | null;
  completedAt?: string | null;
  instructor: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PluginExerciseRecord {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  description: string | null;
  order: number;
  dueBy?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PluginListResponse<TItem> {
  role: 'admin' | 'tutor' | 'student';
  items: TItem[];
}

export type CalendarEventType =
  | 'live_session'
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
