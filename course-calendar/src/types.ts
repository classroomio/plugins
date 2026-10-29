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
  instructor: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PluginListResponse<TItem> {
  role: 'admin' | 'tutor' | 'student';
  items: TItem[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'live_session' | 'certificate_deadline' | 'compliance_due';
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
  instructor: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}
