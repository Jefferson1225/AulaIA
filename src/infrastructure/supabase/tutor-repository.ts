import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TutorTurn } from "../../domain/tutor";
import type { TutorRequestStore } from "../../application/tutor-service";

const turnColumns = "id,conversation_id,question,answer,status,feedback,feedback_comment,created_at,truncated";

export async function readTutorHistory(client: SupabaseClient, userId: string, courseSlug: string, lessonSlug: string, conversationId?: string): Promise<TutorTurn[]> {
  if (!conversationId) {
    const latest = await client.from("tutor_requests").select("conversation_id").eq("user_id", userId)
      .eq("course_slug", courseSlug).eq("lesson_slug", lessonSlug).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (latest.error) throw new Error("No se pudo recuperar el historial del tutor.");
    conversationId = latest.data?.conversation_id;
    if (!conversationId) return [];
  }
  const { data, error } = await client.from("tutor_requests").select(turnColumns).eq("user_id", userId)
    .eq("course_slug", courseSlug).eq("lesson_slug", lessonSlug).eq("conversation_id", conversationId)
    .order("created_at", { ascending: false }).limit(30);
  if (error) throw new Error("No se pudo recuperar el historial del tutor.");
  return ((data ?? []) as TutorTurn[]).reverse();
}

export function createTutorRequestStore(): TutorRequestStore {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("El servidor del Tutor IA no está configurado.");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return {
    async begin(input, reservation) {
      const { data, error } = await client.rpc("begin_tutor_request", {
        p_id: input.requestId, p_conversation_id: input.conversationId, p_user_id: input.userId,
        p_course_slug: input.lesson.courseSlug, p_lesson_slug: input.lesson.slug,
        p_question: input.question, p_reserved_cost: reservation, p_budget: input.budget,
      });
      if (error) throw new Error("No se pudo registrar la consulta. Comprueba tu matrícula y la configuración del tutor.");
      return (data as { code: string }).code;
    },
    async finish(id, value) {
      const { error } = await client.rpc("finish_tutor_request", {
        p_id: id, p_answer: value.answer, p_model: value.model, p_prompt_tokens: value.promptTokens,
        p_completion_tokens: value.completionTokens, p_cached_tokens: value.cachedTokens,
        p_latency_ms: value.latencyMs, p_error_code: value.errorCode, p_truncated: value.truncated,
      });
      if (error) throw new Error("No se pudo confirmar el guardado de la respuesta. Recarga el historial antes de volver a preguntar.");
    },
  };
}
