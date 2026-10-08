import { describe, expect, it } from "vitest";
import { mapCatalogCourses } from "../../src/infrastructure/supabase/catalog-mapper";

describe("adaptador del catálogo", () => {
  it("convierte cursos publicados en tarjetas con su categoría y sin progreso ficticio", () => {
    const courses = mapCatalogCourses(
      [{ slug: "robotica-basica", title: "Robótica básica", category_slug: "robotica", level: "principiante", duration_hours: 12, description: "Construye tu primer robot.", symbol: "⚙" }],
      [{ slug: "robotica", name: "Robótica", position: 1 }],
    );

    expect(courses).toEqual([{ slug: "robotica-basica", title: "Robótica básica", category: "robotica", categoryLabel: "Robótica", level: "principiante", durationHours: 12, description: "Construye tu primer robot.", symbol: "⚙", progress: null }]);
  });
});
