import type { PublishedCourse } from "../../domain/content";
import { demoCourseRepository } from "./course-repository";

export async function getDemoPublishedCourse(slug: string): Promise<PublishedCourse | null> {
  const course = (await demoCourseRepository.list()).find((item) => item.slug === slug);
  if (!course) return null;
  const lesson = await demoCourseRepository.findLesson(slug, "variables-y-tipos");

  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    description: course.description,
    modules: lesson ? [{
      slug: "fundamentos",
      title: lesson.moduleTitle,
      position: 1,
      lessons: [{
        slug: lesson.slug,
        title: lesson.title,
        position: 1,
        durationMinutes: lesson.durationMinutes,
        intro: lesson.intro,
        content: lesson.sections.map((section) => `${section.title}\n${section.text}`).join("\n\n"),
        exampleCode: lesson.sections.find((section) => section.code)?.code ?? "",
        tip: lesson.tip,
      }],
    }] : [],
  };
}
