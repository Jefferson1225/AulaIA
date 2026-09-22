import type { CourseRepository } from "../domain/course-repository";

export async function getLesson(repository: CourseRepository, courseSlug: string, lessonSlug: string) {
  return repository.findLesson(courseSlug, lessonSlug);
}
