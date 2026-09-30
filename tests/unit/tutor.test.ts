import { describe, expect, it } from "vitest";
import { prepareTutorQuestion } from "../../src/application/tutor";
import { demoCourseRepository } from "../../src/infrastructure/demo/course-repository";

describe("Tutor IA", () => {
  it("utiliza el contenido de la lección y limita el tamaño de la pregunta", async () => {
    const lesson = await demoCourseRepository.findLesson("fundamentos-python", "variables-y-tipos");
    if (!lesson) throw new Error("Falta la lección de prueba");

    const request = prepareTutorQuestion(lesson, "¿Qué es una variable?", "Fundamentos de Python");
    expect(request.system).toContain("Variables y tipos de datos");
    expect(request.system).toContain("Fundamentos de Python");
    expect(request.question).toBe("¿Qué es una variable?");
    expect(() => prepareTutorQuestion(lesson, "x".repeat(1001), "Fundamentos de Python")).toThrow("Pregunta demasiado larga.");
  });
});
