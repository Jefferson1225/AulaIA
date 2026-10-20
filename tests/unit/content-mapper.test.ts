import { describe, expect, it } from "vitest";
import { findLessonInCourse } from "../../src/application/content-access";
import { mapPublishedCourse } from "../../src/infrastructure/supabase/content-mapper";

describe("adaptador de cursos y lecciones", () => {
  it("ordena módulos y lecciones y entrega el contenido al recorrido del estudiante", () => {
    const course = mapPublishedCourse(
      { slug: "robotica-basica", title: "Robótica básica", level: "principiante", description: "Aprende robótica." },
      [
        { course_slug: "robotica-basica", slug: "avanzado", title: "Avanzado", position: 2 },
        { course_slug: "robotica-basica", slug: "inicio", title: "Inicio", position: 1 },
      ],
      [
        { course_slug: "robotica-basica", module_slug: "inicio", slug: "sensores", title: "Sensores", position: 2, duration_minutes: 12, intro: "Entradas", content: "Un sensor mide.", example_code: "", tip: "Prueba uno." },
        { course_slug: "robotica-basica", module_slug: "inicio", slug: "componentes", title: "Componentes", position: 1, duration_minutes: 10, intro: "Piezas", content: "Un robot tiene piezas.", example_code: "led = 1", tip: "Observa." },
      ],
    );

    expect(course.modules.map((module) => module.slug)).toEqual(["inicio", "avanzado"]);
    expect(course.modules[0].lessons.map((lesson) => lesson.slug)).toEqual(["componentes", "sensores"]);
    expect(findLessonInCourse(course, "componentes")).toMatchObject({
      courseTitle: "Robótica básica", moduleTitle: "Inicio", number: 1, totalLessons: 2,
      sections: [{ title: "Contenido", text: "Un robot tiene piezas.", code: "led = 1" }],
    });
    expect(findLessonInCourse(course, "desconocida")).toBeNull();
  });
});
