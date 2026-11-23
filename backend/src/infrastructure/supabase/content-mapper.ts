import type { CourseLevel } from "../../domain/course";
import type { ContentLesson, ContentModule, PublishedCourse } from "../../domain/content";

export interface PublishedCourseRow {
  slug: string;
  title: string;
  level: CourseLevel;
  description: string;
}

export interface ModuleRow {
  course_slug: string;
  slug: string;
  title: string;
  position: number;
}

export interface LessonRow {
  course_slug: string;
  module_slug: string;
  slug: string;
  title: string;
  position: number;
  duration_minutes: number;
  intro: string;
  content: string;
  example_code: string;
  tip: string;
}

export function mapPublishedCourse(course: PublishedCourseRow, modules: ModuleRow[], lessons: LessonRow[]): PublishedCourse {
  const orderedModules: ContentModule[] = modules
    .filter((module) => module.course_slug === course.slug)
    .map((module) => ({
      slug: module.slug,
      title: module.title,
      position: module.position,
      lessons: lessons
        .filter((lesson) => lesson.course_slug === course.slug && lesson.module_slug === module.slug)
        .map((lesson): ContentLesson => ({
          slug: lesson.slug,
          title: lesson.title,
          position: lesson.position,
          durationMinutes: lesson.duration_minutes,
          intro: lesson.intro,
          content: lesson.content,
          exampleCode: lesson.example_code,
          tip: lesson.tip,
        }))
        .sort((left, right) => left.position - right.position || left.slug.localeCompare(right.slug)),
    }))
    .sort((left, right) => left.position - right.position || left.slug.localeCompare(right.slug));

  return { slug: course.slug, title: course.title, level: course.level, description: course.description, modules: orderedModules };
}

