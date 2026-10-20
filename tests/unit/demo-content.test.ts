import { describe, expect, it } from "vitest";
import { findLessonInCourse } from "../../src/application/content-access";
import { getDemoPublishedCourse } from "../../src/infrastructure/demo/content-repository";

describe("contenido de demostración", () => {
  it("conserva la lección de Python sin Supabase y no inventa lecciones para otros cursos", async () => {
    const python = await getDemoPublishedCourse("fundamentos-python");
    const ingles = await getDemoPublishedCourse("ingles-profesional");

    expect(python?.modules).toHaveLength(1);
    expect(python && findLessonInCourse(python, "variables-y-tipos")?.title).toBe("Variables y tipos de datos");
    expect(ingles?.modules).toEqual([]);
    expect(await getDemoPublishedCourse("desconocido")).toBeNull();
  });
});
