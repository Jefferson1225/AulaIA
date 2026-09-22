import { describe, expect, it } from "vitest";
import { filterCourses } from "../../src/application/course-catalog";
import { getStudentDashboard } from "../../src/application/student-dashboard";
import { getLesson } from "../../src/application/lesson";
import { demoCourseRepository } from "../../src/infrastructure/demo/course-repository";

describe("recorrido de demostración del estudiante", () => {
  it("filtra el catálogo por búsqueda, categoría y nivel", async () => {
    const courses = await demoCourseRepository.list();

    expect(filterCourses(courses, { query: " PYTHON ", category: "programacion", level: "principiante" }).map((course) => course.slug)).toEqual(["fundamentos-python"]);
    expect(filterCourses(courses, { query: "python", category: "idiomas", level: "todos" })).toEqual([]);
  });

  it("muestra el curso en progreso y las actividades del panel", async () => {
    const dashboard = await getStudentDashboard(demoCourseRepository);

    if (!dashboard.continueCourse) throw new Error("Falta el curso en progreso");
    expect(dashboard.continueCourse.slug).toBe("fundamentos-python");
    expect(dashboard.continueCourse.progress).toBe(62);
    expect(dashboard.activities).toHaveLength(3);
  });

  it("encuentra la lección de muestra y rechaza rutas desconocidas", async () => {
    const lesson = await getLesson(demoCourseRepository, "fundamentos-python", "variables-y-tipos");

    expect(lesson?.title).toBe("Variables y tipos de datos");
    expect(lesson?.sections[0].code).toContain('nombre = "Valentina"');
    expect(lesson?.sections[1].items).toHaveLength(4);
    expect(await getLesson(demoCourseRepository, "fundamentos-python", "no-existe")).toBeNull();
  });
});
