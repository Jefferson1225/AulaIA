import { describe, expect, it } from "vitest";
import { parseAssessmentInput, parseQuestionInput, parseSubmission, submissionFromForm } from "../../src/application/assessments";

const assessmentId = "ea000000-0000-4000-8000-000000000001";
const questionId = "ea000000-0000-4000-8000-000000000002";
const requestId = "ea000000-0000-4000-8000-000000000003";

describe("validación de evaluaciones", () => {
  it("valida datos de evaluación y el mínimo aprobatorio sobre 20", () => {
    expect(parseAssessmentInput({ courseSlug: "fundamentos-python", title: " Evaluación Python ", description: "", passingScore: "12" })).toMatchObject({ title: "Evaluación Python", passingScore: 12 });
    expect(() => parseAssessmentInput({ courseSlug: "../admin", title: "Prueba", description: "", passingScore: 12 })).toThrow();
    expect(() => parseAssessmentInput({ courseSlug: "python", title: "Prueba", description: "", passingScore: 21 })).toThrow();
  });

  it("requiere cuatro alternativas no vacías y una clave válida", () => {
    const input = { assessmentId, prompt: "¿Qué tipo es 24?", options: ["int", "str", "bool", "float"], correctOption: "0", position: "1" };
    expect(parseQuestionInput(input).correctOption).toBe(0);
    expect(() => parseQuestionInput({ ...input, options: ["int", "str"] })).toThrow();
    expect(() => parseQuestionInput({ ...input, options: ["int", "str", " ", "float"] })).toThrow();
    expect(() => parseQuestionInput({ ...input, correctOption: 4 })).toThrow();
  });

  it("rechaza selecciones fuera de rango y preguntas duplicadas", () => {
    const answer = { questionId, optionIndex: 0 };
    expect(() => parseSubmission({ assessmentId, requestId, version: 1, answers: [answer, answer] })).toThrow();
    expect(() => parseSubmission({ assessmentId, requestId, version: 1, answers: [{ questionId, optionIndex: 4 }] })).toThrow();
    expect(() => parseSubmission({ assessmentId, requestId, version: 1, answers: [] })).toThrow();
  });

  it("exige una versión válida para detectar formularios abiertos antes de una edición", () => {
    const input = { assessmentId, requestId, version: 2, answers: [{ questionId, optionIndex: 0 }] };
    expect(parseSubmission(input)).toHaveProperty("version", 2);
    expect(() => parseSubmission({ ...input, version: undefined })).toThrow();
  });

  it("extrae solo las respuestas del formulario sin aceptar nota o usuario enviados", () => {
    const form = new FormData();
    form.set("assessmentId", assessmentId); form.set("requestId", requestId); form.set("version", "1");
    form.set(`answer-${questionId}`, "2"); form.set("score", "20"); form.set("userId", "otra-persona");
    expect(submissionFromForm(form)).toEqual({ assessmentId, requestId, version: 1, answers: [{ questionId, optionIndex: 2 }] });
  });
});
