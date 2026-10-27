import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { findLessonInCourse } from "../../../application/content-access";
import { buildCourseProgress } from "../../../application/learning-progress";
import { boundedTutorHistory } from "../../../application/tutor-metrics";
import { answerTutorQuestion, TutorRequestError } from "../../../application/tutor-service";
import { askDeepSeek } from "../../../infrastructure/deepseek/tutor";
import { getSupabaseConfig } from "../../../infrastructure/supabase/config";
import { getPublishedCourse } from "../../../infrastructure/supabase/content-repository";
import { createLearningRepository } from "../../../infrastructure/supabase/learning-repository";
import { createSupabaseServerClient } from "../../../infrastructure/supabase/server";
import { createTutorRequestStore, readTutorHistory } from "../../../infrastructure/supabase/tutor-repository";

export const runtime = "nodejs";
export const maxDuration = 45;
const slug = z.string().min(1).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const scopeSchema = z.object({ courseSlug: slug, lessonSlug: slug });
const questionSchema = scopeSchema.extend({ question: z.string().trim().min(1).max(1000), requestId: z.uuid(), conversationId: z.uuid().optional() }).strict();
const feedbackSchema = z.object({ id: z.uuid(), feedback: z.enum(["positive", "negative"]), comment: z.string().trim().max(500).default("") }).strict();
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function session() {
  if (!getSupabaseConfig()) return null;
  const client = await createSupabaseServerClient();
  const { data: { user }, error } = await client.auth.getUser();
  return error || !user ? null : { client, user };
}
async function payload(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new TutorRequestError(400, "Solicitud inválida.");
  const raw = await request.text();
  if (raw.length > 4000) throw new TutorRequestError(413, "Solicitud demasiado larga.");
  try { return JSON.parse(raw) as unknown; } catch { throw new TutorRequestError(400, "Solicitud inválida."); }
}
function errorResponse(error: unknown) {
  if (error instanceof TutorRequestError) return json({ error: error.message }, error.status);
  return json({ error: "No se pudo completar la operación del tutor. Recarga el historial antes de volver a preguntar." }, 503);
}

export async function GET(request: NextRequest) {
  const current = await session();
  if (!current) return json({ error: "Inicia sesión para usar el Tutor IA." }, 401);
  const parsed = scopeSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return json({ error: "Lección inválida." }, 400);
  try {
    const turns = await readTutorHistory(current.client, current.user.id, parsed.data.courseSlug, parsed.data.lessonSlug);
    return json({ turns });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) {
  const current = await session();
  if (!current) return json({ error: "Inicia sesión para usar el Tutor IA." }, 401);
  const budget = Number(process.env.TUTOR_MAX_BUDGET_USD ?? 0);
  if (!process.env.DEEPSEEK_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY || !Number.isFinite(budget) || budget <= 0) {
    return json({ error: "El Tutor IA no tiene un presupuesto o una configuración disponible." }, 503);
  }
  try {
    const parsed = questionSchema.safeParse(await payload(request));
    if (!parsed.success) return json({ error: "Solicitud inválida. Escribe una pregunta de hasta 1000 caracteres." }, 400);
    const body = parsed.data;
    const course = await getPublishedCourse(body.courseSlug);
    const lesson = course && findLessonInCourse(course, body.lessonSlug);
    if (!course || !lesson) return json({ error: "Lección no encontrada." }, 404);
    const snapshot = await createLearningRepository(current.client, current.user.id).read();
    const progress = buildCourseProgress(course, snapshot);
    if (!progress.enrolled) return json({ error: "Matricúlate en este curso para usar su tutor." }, 403);
    const conversationId = body.conversationId ?? crypto.randomUUID();
    const turns = body.conversationId ? await readTutorHistory(current.client, current.user.id, body.courseSlug, body.lessonSlug, conversationId) : [];
    const result = await answerTutorQuestion({ requestId: body.requestId, conversationId, userId: current.user.id,
      lesson, courseTitle: course.title, question: body.question, history: boundedTutorHistory(turns), progress, budget,
    }, createTutorRequestStore(), askDeepSeek);
    return json({ answer: result.answer, id: result.id, conversationId, truncated: result.truncated });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: NextRequest) {
  const current = await session();
  if (!current) return json({ error: "Inicia sesión para valorar respuestas." }, 401);
  try {
    const parsed = feedbackSchema.safeParse(await payload(request));
    if (!parsed.success) return json({ error: "Valoración inválida." }, 400);
    const { id, feedback, comment } = parsed.data;
    const { error } = await current.client.rpc("rate_tutor_response", { p_id: id, p_feedback: feedback, p_comment: comment });
    if (error) return json({ error: "No se pudo guardar la valoración de esta respuesta." }, 403);
    return json({ saved: true });
  } catch (error) { return errorResponse(error); }
}
