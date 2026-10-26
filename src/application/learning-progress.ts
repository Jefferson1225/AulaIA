import { z } from "zod";
import type { Course, LearningActivity } from "../domain/course";
import type { CompletionInput, CourseProgress, LearningCourse, LearningSnapshot } from "../domain/learning";

const slug = z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const completionSchema = z.object({ courseSlug: slug, lessonSlug: slug, completed: z.boolean() });

export const parseEnrollmentSlug = (value: unknown): string => slug.parse(value);
export const parseCompletionInput = (value: unknown): CompletionInput => completionSchema.parse(value);

export function buildCourseProgress(course: LearningCourse, snapshot: LearningSnapshot): CourseProgress {
  const enrolled = snapshot.enrollments.some((item) => item.courseSlug === course.slug);
  const lessons = [...course.modules]
    .sort((a, b) => a.position - b.position || a.slug.localeCompare(b.slug))
    .flatMap((item) => [...item.lessons].sort((a, b) => a.position - b.position || a.slug.localeCompare(b.slug)));
  const completed = new Set(enrolled ? snapshot.completions.filter((item) => item.courseSlug === course.slug).map((item) => item.lessonSlug) : []);
  const completedLessonSlugs = lessons.filter((lesson) => completed.has(lesson.slug)).map((lesson) => lesson.slug);
  const next = lessons.find((lesson) => !completed.has(lesson.slug));
  return {
    enrolled,
    completedLessonSlugs,
    completedLessons: completedLessonSlugs.length,
    totalLessons: lessons.length,
    percent: lessons.length ? Math.min(completedLessonSlugs.length === lessons.length ? 100 : 99, Math.round(completedLessonSlugs.length / lessons.length * 100)) : 0,
    nextLesson: next ? { slug: next.slug, title: next.title } : null,
  };
}

export function buildLearningDashboard(courses: Course[], content: LearningCourse[], snapshot: LearningSnapshot) {
  const enrolledSlugs = new Set(snapshot.enrollments.map((item) => item.courseSlug));
  const progressByCourse = new Map(content.map((course) => [course.slug, buildCourseProgress(course, snapshot)]));
  const enrolledCourses = courses.filter((course) => enrolledSlugs.has(course.slug)).map((course) => ({
    ...course, progress: progressByCourse.get(course.slug)?.percent ?? 0,
  }));
  const continueCourse = enrolledCourses.find((course) => progressByCourse.get(course.slug)?.nextLesson) ?? null;
  const next = continueCourse ? progressByCourse.get(continueCourse.slug)?.nextLesson : null;
  const activities: LearningActivity[] = enrolledCourses.flatMap((course) => {
    const lesson = progressByCourse.get(course.slug)?.nextLesson;
    return lesson ? [{ title: lesson.title, detail: course.title, kind: "lesson" as const, href: `/cursos/${course.slug}/lecciones/${lesson.slug}` }] : [];
  }).slice(0, 3);
  return {
    enrolledCourses, continueCourse, activities,
    continueLesson: continueCourse && next ? { title: next.title, href: `/cursos/${continueCourse.slug}/lecciones/${next.slug}` } : null,
    recommendedCourses: courses.filter((course) => !enrolledSlugs.has(course.slug)).slice(0, 3).map((course) => ({ ...course, progress: null })),
  };
}
