export interface LearningSnapshot {
  enrollments: { courseSlug: string; enrolledAt: string }[];
  completions: { courseSlug: string; lessonSlug: string; completedAt: string }[];
}

export interface CourseProgress {
  enrolled: boolean;
  completedLessonSlugs: string[];
  completedLessons: number;
  totalLessons: number;
  percent: number;
  nextLesson: { slug: string; title: string } | null;
}

export interface LearningCourse {
  slug: string;
  modules: { slug: string; position: number; lessons: { slug: string; title: string; position: number }[] }[];
}

export interface CompletionInput {
  courseSlug: string;
  lessonSlug: string;
  completed: boolean;
}

/** Cada instancia opera exclusivamente sobre el usuario autenticado en el servidor. */
export interface LearningRepository {
  read(): Promise<LearningSnapshot>;
  enroll(courseSlug: string): Promise<void>;
  setCompleted(input: CompletionInput): Promise<void>;
}
