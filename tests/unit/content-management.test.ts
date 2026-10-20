import { describe, expect, it } from "vitest";
import { canManageContent, parseContentSlug, parseCourseInput, parseLessonInput, parseModuleInput } from "../../src/application/content-management";

describe("gestión de contenido académico", () => {
  it("reserva la edición para administradores", () => {
    expect(canManageContent("admin")).toBe(true);
    expect(canManageContent("student")).toBe(false);
    expect(canManageContent("teacher")).toBe(false);
  });

  it("valida identificadores antes de usarlos en rutas o eliminaciones", () => {
    expect(parseContentSlug("robotica-basica")).toBe("robotica-basica");
    expect(() => parseContentSlug("../otro")).toThrow();
  });

  it("acepta un curso completo y rechaza identificadores inseguros", () => {
    const valid = {
      slug: "robotica-basica", title: " Robótica básica ", categorySlug: "programacion",
      level: "principiante", durationHours: "12", description: " Construye un robot. ",
      symbol: "⚙", isPublished: false,
    };

    expect(parseCourseInput(valid)).toMatchObject({ title: "Robótica básica", durationHours: 12, description: "Construye un robot." });
    expect(() => parseCourseInput({ ...valid, slug: "../../admin" })).toThrow();
  });

  it("exige posición positiva y pertenencia a un curso para el módulo", () => {
    expect(parseModuleInput({ courseSlug: "robotica-basica", slug: "primeros-pasos", title: " Primeros pasos ", position: "1" }))
      .toEqual({ courseSlug: "robotica-basica", slug: "primeros-pasos", title: "Primeros pasos", position: 1 });
    expect(() => parseModuleInput({ courseSlug: "robotica-basica", slug: "primeros-pasos", title: "Módulo", position: "0" })).toThrow();
  });

  it("requiere contenido real y duración válida antes de guardar una lección", () => {
    const valid = {
      courseSlug: "robotica-basica", moduleSlug: "primeros-pasos", slug: "componentes",
      title: " Componentes ", position: "2", durationMinutes: "15", intro: " Conoce las piezas. ",
      content: " Sensores y actuadores. ", exampleCode: "", tip: " Practica. ",
    };

    expect(parseLessonInput(valid)).toMatchObject({ title: "Componentes", durationMinutes: 15, content: "Sensores y actuadores." });
    expect(() => parseLessonInput({ ...valid, content: "  " })).toThrow();
  });
});
