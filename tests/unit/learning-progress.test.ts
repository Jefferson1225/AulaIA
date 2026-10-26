import { describe, expect, it } from "vitest";
import { buildCourseProgress, buildLearningDashboard, parseCompletionInput } from "../../src/application/learning-progress";
import { learningCourse, enrolledSnapshot } from "../fixtures/learning";
import { demoCourseRepository } from "../../src/infrastructure/demo/course-repository";

describe("matrículas y progreso", () => {
  it("calcula el avance sin duplicados, lecciones eliminadas ni completadas en otro curso", () => {
    const progress = buildCourseProgress(learningCourse, {
      ...enrolledSnapshot,
      completions: [...enrolledSnapshot.completions, ...enrolledSnapshot.completions,
        { courseSlug: "robotica-basica", lessonSlug: "eliminada", completedAt: "2026-10-21" },
        { courseSlug: "otro-curso", lessonSlug: "mediciones", completedAt: "2026-10-21" }],
    });
    expect(progress).toMatchObject({ enrolled: true, completedLessons: 1, totalLessons: 3, percent: 33, completedLessonSlugs: ["sensores"] });
    expect(progress.nextLesson).toMatchObject({ slug: "mediciones", title: "Tomar mediciones" });
  });

  it("no muestra avance de una cuenta sin matrícula", () => {
    expect(buildCourseProgress(learningCourse, { ...enrolledSnapshot, enrollments: [] }))
      .toMatchObject({ enrolled: false, completedLessons: 0, percent: 0, completedLessonSlugs: [] });
  });

  it("un curso sin lecciones empieza en cero y no tiene próxima lección", () => {
    expect(buildCourseProgress({ ...learningCourse, modules: [] }, enrolledSnapshot))
      .toMatchObject({ totalLessons: 0, percent: 0, nextLesson: null });
  });

  it("al completar todas las lecciones alcanza 100 y deja de sugerir otra", () => {
    const completions = ["sensores", "mediciones", "motores"].map((lessonSlug) => ({ courseSlug: "robotica-basica", lessonSlug, completedAt: "2026-10-21" }));
    expect(buildCourseProgress(learningCourse, { ...enrolledSnapshot, completions }))
      .toMatchObject({ completedLessons: 3, percent: 100, nextLesson: null });
  });

  it("mantiene el orden académico aunque los datos lleguen desordenados", () => {
    const unordered = { ...learningCourse, modules: [...learningCourse.modules].reverse().map((item) => ({ ...item, lessons: [...item.lessons].reverse() })) };
    expect(buildCourseProgress(unordered, enrolledSnapshot).nextLesson?.slug).toBe("mediciones");
  });

  it("no redondea a curso completado mientras quede alguna lección pendiente", () => {
    const lessons = Array.from({ length: 200 }, (_, index) => ({ ...learningCourse.modules[0].lessons[0], slug: `leccion-${index}`, position: index + 1 }));
    const course = { ...learningCourse, modules: [{ ...learningCourse.modules[0], lessons }] };
    const completions = lessons.slice(0, 199).map((lesson) => ({ courseSlug: course.slug, lessonSlug: lesson.slug, completedAt: "2026-10-21" }));
    expect(buildCourseProgress(course, { ...enrolledSnapshot, completions }).percent).toBe(99);
  });

  it("acepta solo identificadores válidos y un estado booleano", () => {
    expect(parseCompletionInput({ courseSlug: "robotica-basica", lessonSlug: "sensores", completed: false }).completed).toBe(false);
    expect(() => parseCompletionInput({ courseSlug: "../admin", lessonSlug: "sensores", completed: true })).toThrow();
    expect(() => parseCompletionInput({ courseSlug: "robotica-basica", lessonSlug: "sensores", completed: "false" })).toThrow();
  });

  it("el panel retoma la lección pendiente real y no recomienda cursos ya inscritos", async () => {
    const sample = (await demoCourseRepository.list())[0];
    const courses = [{ ...sample, slug: "robotica-basica", title: "Robótica básica", progress: null }, { ...sample, progress: null }];
    const dashboard = buildLearningDashboard(courses, [learningCourse], enrolledSnapshot);
    expect(dashboard.enrolledCourses.map((course) => [course.slug, course.progress])).toEqual([["robotica-basica", 33]]);
    expect(dashboard.continueLesson).toEqual({ title: "Tomar mediciones", href: "/cursos/robotica-basica/lecciones/mediciones" });
    expect(dashboard.recommendedCourses.map((course) => course.slug)).toEqual(["fundamentos-python"]);
    expect(dashboard.activities[0].href).toBe("/cursos/robotica-basica/lecciones/mediciones");
  });
});
