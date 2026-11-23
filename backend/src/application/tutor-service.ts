import type { Lesson } from "../domain/course";
import type { PublishedCourse } from "../domain/content";
import type { LearningSnapshot } from "../domain/learning";
import type { TutorFeedback, TutorMessage, TutorReply, TutorTurn } from "../domain/tutor";
import { findLessonInCourse } from "./content-access";
import { buildCourseProgress } from "./learning-progress";
import { prepareTutorQuestion } from "./tutor";
import { boundedTutorHistory, reserveTutorCost } from "./tutor-metrics";

export class TutorRequestError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}
export interface TutorRequestInput {
  requestId: string; conversationId: string; userId: string;
  lesson: Lesson; courseTitle: string; question: string; history: TutorMessage[];
  progress?: { completedLessons: number; totalLessons: number }; budget: number;
}
export interface TutorCompletion {
  answer: string | null; model: string | null; promptTokens: number | null;
  completionTokens: number | null; cachedTokens: number | null;
  latencyMs: number; errorCode: string | null; truncated: boolean;
}
export interface TutorRequestStore {
  begin(input: TutorRequestInput, reservation: number): Promise<string>;
  finish(id: string, completion: TutorCompletion): Promise<void>;
}

export interface TutorScope { courseSlug: string; lessonSlug: string }
export interface TutorQuestion extends TutorScope {
  question: string;
  requestId: string;
  conversationId?: string;
  budget: number;
}

/** Puertos del caso de uso: no recibe un cliente SQL ni credenciales del proveedor. */
export interface TutorServiceDependencies {
  context: {
    findCourse(slug: string): Promise<PublishedCourse | null>;
    readLearning(): Promise<LearningSnapshot>;
    readHistory(scope: TutorScope, conversationId?: string): Promise<TutorTurn[]>;
    saveFeedback(id: string, feedback: TutorFeedback, comment: string): Promise<void>;
  };
  requests: TutorRequestStore;
  provider(system: string, question: string, history: TutorMessage[]): Promise<TutorReply>;
}

/** La composición del servidor fija el usuario; nunca se toma del formulario del navegador. */
export function createTutorService(userId: string, dependencies: TutorServiceDependencies) {
  async function authorizedContext(scope: TutorScope) {
    const course = await dependencies.context.findCourse(scope.courseSlug);
    const lesson = course && findLessonInCourse(course, scope.lessonSlug);
    if (!course || !lesson) throw new TutorRequestError(404, "Lección no encontrada.");
    const progress = buildCourseProgress(course, await dependencies.context.readLearning());
    if (!progress.enrolled) throw new TutorRequestError(403, "Matricúlate en este curso para usar su tutor.");
    return { course, lesson, progress };
  }

  return {
    async ask(input: TutorQuestion) {
      if (!Number.isFinite(input.budget) || input.budget <= 0) {
        throw new TutorRequestError(503, "El Tutor IA no tiene un presupuesto disponible.");
      }
      if (!input.question.trim() || input.question.trim().length > 1000) {
        throw new TutorRequestError(400, "Escribe una pregunta de hasta 1000 caracteres.");
      }
      const { course, lesson, progress } = await authorizedContext(input);
      const conversationId = input.conversationId ?? crypto.randomUUID();
      const turns = input.conversationId ? await dependencies.context.readHistory(input, conversationId) : [];
      return answerTutorQuestion({
        requestId: input.requestId, conversationId, userId, lesson, courseTitle: course.title,
        question: input.question, history: boundedTutorHistory(turns), progress, budget: input.budget,
      }, dependencies.requests, dependencies.provider);
    },
    async history(scope: TutorScope) {
      await authorizedContext(scope);
      return dependencies.context.readHistory(scope);
    },
    async rate(id: string, feedback: TutorFeedback, comment: string) {
      if (!["positive", "negative"].includes(feedback) || comment.trim().length > 500) {
        throw new TutorRequestError(400, "Valoración inválida.");
      }
      // El repositorio utiliza la sesión del estudiante; PostgreSQL verifica la propiedad.
      await dependencies.context.saveFeedback(id, feedback, comment.trim());
    },
  };
}

export async function answerTutorQuestion(input: TutorRequestInput, store: TutorRequestStore,
  provider: (system: string, question: string, history: TutorMessage[]) => Promise<TutorReply>) {
  const prompt = prepareTutorQuestion(input.lesson, input.question, input.courseTitle, input.progress);
  const reserve = reserveTutorCost([{ role: "system", content: prompt.system }, ...input.history, { role: "user", content: prompt.question }]);
  const admission = await store.begin({ ...input, question: prompt.question }, reserve);
  const blocked: Record<string, string> = {
    budget: "El presupuesto del Tutor IA está agotado. Consulta con la administración.",
    quota: "Alcanzaste el límite de 30 preguntas por hoy. Vuelve mañana.",
    busy: "Ya tienes una consulta en curso. Espera un momento.",
    duplicate: "Esta consulta ya fue registrada. Recarga el historial para ver el resultado.",
  };
  if (admission !== "ok") throw new TutorRequestError(admission === "duplicate" ? 409 : 429, blocked[admission] ?? "El tutor no está disponible.");
  const started = performance.now();
  let reply: TutorReply;
  try {
    reply = await provider(prompt.system, prompt.question, input.history);
  } catch (caught) {
    const known = caught instanceof Error && "code" in caught && ["balance", "configuration", "rate_limit", "provider", "network", "empty", "usage"].includes(String(caught.code));
    await store.finish(input.requestId, { answer: null, model: null, promptTokens: null, completionTokens: null,
      cachedTokens: null, latencyMs: Math.round(performance.now() - started), errorCode: known ? String(caught.code) : "unknown", truncated: false });
    throw new TutorRequestError(502, known ? caught.message : "No pudimos obtener una respuesta. Inténtalo más tarde.");
  }
  // Una escritura fallida nunca dispara una segunda consulta pagada.
  await store.finish(input.requestId, { ...reply, latencyMs: Math.round(performance.now() - started), errorCode: null });
  return { ...reply, id: input.requestId, conversationId: input.conversationId };
}
