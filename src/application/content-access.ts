import type { Lesson } from "../domain/course";
import type { PublishedCourse } from "../domain/content";

export function findLessonInCourse(course: PublishedCourse, lessonSlug: string): Lesson | null {
  for (const courseModule of course.modules) {
    const index = courseModule.lessons.findIndex((lesson) => lesson.slug === lessonSlug);
    if (index < 0) continue;
    const lesson = courseModule.lessons[index];
    return {
      slug: lesson.slug,
      courseSlug: course.slug,
      courseTitle: course.title,
      courseLevel: course.level,
      moduleTitle: courseModule.title,
      moduleLessons: courseModule.lessons.map((item) => ({ slug: item.slug, title: item.title, durationMinutes: item.durationMinutes })),
      title: lesson.title,
      number: index + 1,
      totalLessons: courseModule.lessons.length,
      durationMinutes: lesson.durationMinutes,
      intro: lesson.intro,
      sections: [{ title: "Contenido", text: lesson.content, ...(lesson.exampleCode ? { code: lesson.exampleCode } : {}) }],
      tip: lesson.tip,
    };
  }
  return null;
}
