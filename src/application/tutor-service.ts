import type { Lesson } from "../domain/course";
import type { TutorMessage, TutorReply } from "../domain/tutor";
import { prepareTutorQuestion } from "./tutor";
import { reserveTutorCost } from "./tutor-metrics";

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
