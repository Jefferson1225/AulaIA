import type { Course, LearningActivity, Lesson } from "./course";

export interface CourseRepository {
  list(): Promise<Course[]>;
  listActivities(): Promise<LearningActivity[]>;
  findLesson(courseSlug: string, lessonSlug: string): Promise<Lesson | null>;
}
