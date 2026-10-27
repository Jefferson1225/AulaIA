import { describe, expect, it } from "vitest";
import { answerTutorQuestion } from "../../src/application/tutor-service";
import type { TutorRequestStore } from "../../src/application/tutor-service";
import { demoCourseRepository } from "../../src/infrastructure/demo/course-repository";

async function context() {
  const lesson = await demoCourseRepository.findLesson("fundamentos-python", "variables-y-tipos");
  if (!lesson) throw new Error("Lección ausente");
  return { userId: "user", requestId: "request", conversationId: "conversation", lesson, courseTitle: "Python", question: "¿Qué es int?", history: [], budget: 0.02 };
}

describe("Caso de uso del tutor", () => {
  it("rechaza presupuesto agotado antes de realizar una operación pagada", async () => {
    let paid = false;
    const store: TutorRequestStore = { begin: async () => "budget", finish: async () => { throw new Error("No debe finalizar"); } };
    await expect(answerTutorQuestion(await context(), store, async () => { paid = true; throw new Error("Cobro indebido"); })).rejects.toMatchObject({ status: 429 });
    expect(paid).toBe(false);
  });
  it("devuelve el resultado solo después de guardar la respuesta y su consumo", async () => {
    let saved: unknown;
    const store: TutorRequestStore = { begin: async () => "ok", finish: async (_id, value) => { saved = value; } };
    const result = await answerTutorQuestion(await context(), store, async () => ({ answer: "Entero.", model: "flash", promptTokens: 100, completionTokens: 20, cachedTokens: 0, truncated: false }));
    expect(saved).toMatchObject({ answer: "Entero.", promptTokens: 100, completionTokens: 20, errorCode: null });
    expect(result.answer).toBe("Entero.");
  });
  it("conserva el fallo para diagnóstico sin guardar el contenido sensible del error", async () => {
    let saved: unknown;
    const store: TutorRequestStore = { begin: async () => "ok", finish: async (_id, value) => { saved = value; } };
    await expect(answerTutorQuestion(await context(), store, async () => { throw new Error("secret-key"); })).rejects.toThrow("No pudimos obtener");
    expect(saved).toMatchObject({ answer: null, errorCode: "unknown" });
    expect(JSON.stringify(saved)).not.toContain("secret-key");
  });
});
