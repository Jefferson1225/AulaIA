import type { SupabaseClient } from "@supabase/supabase-js";
import type { Assessment, AssessmentAttempt, AssessmentQuestion, AssessmentRepository } from "../../domain/assessment";

export const assessmentColumns = "id,course_slug,title,description,passing_score,is_published,version";
interface AssessmentRow { id: string; course_slug: string; title: string; description: string; passing_score: number; is_published: boolean; version: number }
export function mapAssessment(row: AssessmentRow): Assessment {
  return { id: row.id, courseSlug: row.course_slug, title: row.title, description: row.description, passingScore: row.passing_score, isPublished: row.is_published, version: row.version };
}
const attemptColumns = "id,assessment_id,course_slug,assessment_title,score,passing_score,correct_count,total_questions,passed,submitted_at,answers";
interface AttemptRow {
  id: string; assessment_id: string; course_slug: string; assessment_title: string; score: number;
  passing_score: number; correct_count: number; total_questions: number; passed: boolean; submitted_at: string;
  answers: AssessmentAttempt["answers"];
}
function mapAttempt(row: AttemptRow): AssessmentAttempt {
  return { id: row.id, assessmentId: row.assessment_id, courseSlug: row.course_slug, assessmentTitle: row.assessment_title,
    score: Number(row.score), passingScore: row.passing_score, correctCount: row.correct_count, totalQuestions: row.total_questions,
    passed: row.passed, submittedAt: row.submitted_at, answers: row.answers };
}

export function createAssessmentRepository(client: SupabaseClient, userId: string): AssessmentRepository {
  return {
    async listPublished(courseSlug) {
      const { data, error } = await client.from("assessments").select(assessmentColumns).eq("course_slug", courseSlug).eq("is_published", true).order("created_at");
      if (error) throw new Error("No se pudieron consultar las evaluaciones.");
      return ((data ?? []) as AssessmentRow[]).map(mapAssessment);
    },
    async getPublished(id, courseSlug) {
      const { data, error } = await client.from("assessments").select(assessmentColumns).eq("id", id).eq("course_slug", courseSlug).eq("is_published", true).maybeSingle();
      if (error) throw new Error("No se pudo consultar la evaluación.");
      return data ? mapAssessment(data as AssessmentRow) : null;
    },
    async getQuestions(id) {
      const { data, error } = await client.from("assessment_questions").select("id,prompt,options,position").eq("assessment_id", id).order("position").order("id");
      if (error) throw new Error("No se pudieron consultar las preguntas.");
      return (data ?? []) as AssessmentQuestion[];
    },
    async listAttempts(id) {
      let query = client.from("assessment_attempts").select(attemptColumns).eq("user_id", userId).order("submitted_at", { ascending: false });
      if (id) query=query.eq("assessment_id", id);
      const { data, error } = await query;
      if (error) throw new Error("No se pudieron consultar tus intentos.");
      return ((data ?? []) as AttemptRow[]).map(mapAttempt);
    },
    async getAttempt(id, assessmentId, courseSlug) {
      const { data, error } = await client.from("assessment_attempts").select(attemptColumns).eq("id", id).eq("assessment_id", assessmentId).eq("course_slug", courseSlug).eq("user_id", userId).maybeSingle();
      if (error) throw new Error("No se pudo consultar el resultado.");
      return data ? mapAttempt(data as AttemptRow) : null;
    },
    async submit(input) {
      const { data, error } = await client.rpc("submit_assessment", { p_assessment_id: input.assessmentId, p_answers: input.answers, p_request_id: input.requestId, p_version: input.version });
      if (error || typeof data !== "string") throw new Error("No se pudo registrar el intento.");
      return data;
    },
  };
}
