import { describe, expect, it } from "vitest";
import { answerTutorQuestion, createTutorService } from "../../backend/src/application/tutor-service";
import type { TutorRequestStore } from "../../backend/src/application/tutor-service";
import { demoCourseRepository } from "../../backend/src/infrastructure/demo/course-repository";
import { enrolledSnapshot, learningCourse } from "../fixtures/learning";
import type { TutorServiceDependencies } from "../../backend/src/application/tutor-service";
import { vi } from "vitest";

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

function serviceContext() {
  const events: string[] = [];
  const dependencies: TutorServiceDependencies = {
    context: {
      findCourse: async () => learningCourse,
      readLearning: async () => enrolledSnapshot,
      readHistory: async () => [],
      saveFeedback: async () => {},
    },
    requests: {
      begin: async () => { events.push("reserve"); return "ok"; },
      finish: async () => { events.push("save"); },
    },
    provider: vi.fn(async () => {
      events.push("provider");
      return { answer: "Un sensor mide una magnitud.", model: "flash", promptTokens: 100, completionTokens: 20, cachedTokens: 0, truncated: false };
    }),
  };
  const question = { courseSlug: "robotica-basica", lessonSlug: "sensores", question: "¿Qué es un sensor?", requestId: "request", budget: 0.02 };
  return { dependencies, events, question };
}

describe("Mediación de negocio entre datos y proveedor IA", () => {
  it("impide llamar al proveedor cuando el estudiante no está matriculado", async () => {
    const { dependencies, events, question } = serviceContext();
    dependencies.context.readLearning = async () => ({ enrollments: [], completions: [] });
    await expect(createTutorService("user", dependencies).ask(question)).rejects.toMatchObject({ status: 403 });
    expect(events).toEqual([]);
  });

  it("rechaza una lección que no pertenece al curso antes de reservar consumo", async () => {
    const { dependencies, events, question } = serviceContext();
    await expect(createTutorService("user", dependencies).ask({ ...question, lessonSlug: "ajena" })).rejects.toMatchObject({ status: 404 });
    expect(events).toEqual([]);
  });

  it("prepara el contexto y entrega al proveedor únicamente mensajes, guardando antes de responder", async () => {
    const { dependencies, events, question } = serviceContext();
    const result = await createTutorService("user", dependencies).ask(question);
    expect(result.answer).toBe("Un sensor mide una magnitud.");
    expect(result.conversationId).toBeTruthy();
    expect(events).toEqual(["reserve", "provider", "save"]);
    expect(dependencies.provider).toHaveBeenCalledWith(expect.stringContaining("Robótica básica"), question.question, []);
  });

  it("detiene un presupuesto inválido antes de leer datos o llamar al proveedor", async () => {
    const { dependencies, events, question } = serviceContext();
    dependencies.context.findCourse = async () => { throw new Error("No debe consultar datos"); };
    await expect(createTutorService("user", dependencies).ask({ ...question, budget: 0 })).rejects.toMatchObject({ status: 503 });
    expect(events).toEqual([]);
  });

  it("no devuelve historial de un curso sin matrícula", async () => {
    const { dependencies, question } = serviceContext();
    dependencies.context.readLearning = async () => ({ enrollments: [], completions: [] });
    await expect(createTutorService("user", dependencies).history(question)).rejects.toMatchObject({ status: 403 });
  });

  it("no repite una consulta pagada si falla el guardado de la respuesta", async () => {
    const { dependencies, events, question } = serviceContext();
    dependencies.requests.finish = async () => { throw new Error("Base de datos no disponible"); };
    await expect(createTutorService("user", dependencies).ask(question)).rejects.toThrow("Base de datos no disponible");
    expect(events).toEqual(["reserve", "provider"]);
  });

  it("entrega solo los últimos tres intercambios exitosos de la conversación recuperada", async () => {
    const { dependencies, question } = serviceContext();
    dependencies.context.readHistory = async () => [1, 2, 3, 4].map((n) => ({
      id: String(n), conversation_id: "conversation", question: `Pregunta ${n}`, answer: `Respuesta ${n}`,
      status: "succeeded", feedback: null, feedback_comment: null, created_at: "2026-11-07", truncated: false,
    }));
    await createTutorService("user", dependencies).ask({ ...question, conversationId: "conversation" });
    expect(dependencies.provider).toHaveBeenCalledWith(expect.any(String), question.question, [
      { role: "user", content: "Pregunta 2" }, { role: "assistant", content: "Respuesta 2" },
      { role: "user", content: "Pregunta 3" }, { role: "assistant", content: "Respuesta 3" },
      { role: "user", content: "Pregunta 4" }, { role: "assistant", content: "Respuesta 4" },
    ]);
  });
});
