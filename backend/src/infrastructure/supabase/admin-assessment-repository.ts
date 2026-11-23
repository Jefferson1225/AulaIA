import type { SupabaseClient } from "@supabase/supabase-js";
import type { Assessment, AssessmentInput, ManagedAssessment, QuestionInput } from "../../domain/assessment";
import { assessmentColumns, mapAssessment } from "./assessment-repository";

export async function listManagedAssessments(client: SupabaseClient): Promise<Assessment[]> {
  const { data, error } = await client.from("assessments").select(assessmentColumns).order("created_at", { ascending: false });
  if (error) throw new Error("No se pudieron consultar las evaluaciones.");
  return (data ?? []).map(mapAssessment);
}
export async function getManagedAssessment(client: SupabaseClient, id: string): Promise<ManagedAssessment | null> {
  const { data, error } = await client.rpc("get_managed_assessment", { p_id: id });
  if (error) throw new Error("No se pudo consultar la evaluación.");
  return data as ManagedAssessment | null;
}
export async function saveAssessment(client: SupabaseClient, input: AssessmentInput): Promise<string> {
  const { data, error } = await client.rpc("save_assessment", { p_id: input.id ?? null, p_course_slug: input.courseSlug, p_title: input.title, p_description: input.description, p_passing_score: input.passingScore });
  if (error || typeof data !== "string") throw new Error("No se pudo guardar la evaluación.");
  return data;
}
export async function saveAssessmentQuestion(client: SupabaseClient, input: QuestionInput): Promise<void> {
  const { error } = await client.rpc("save_assessment_question", { p_assessment_id: input.assessmentId, p_question_id: input.id ?? null, p_prompt: input.prompt, p_options: input.options, p_correct_option: input.correctOption, p_position: input.position });
  if (error) throw new Error("No se pudo guardar la pregunta.");
}
export async function deleteAssessmentQuestion(client: SupabaseClient, assessmentId: string, questionId: string): Promise<void> {
  const { error } = await client.rpc("delete_assessment_question", { p_assessment_id: assessmentId, p_question_id: questionId });
  if (error) throw new Error("No se pudo eliminar la pregunta.");
}
export async function setAssessmentPublished(client: SupabaseClient, id: string, published: boolean): Promise<void> {
  const { error } = await client.rpc("set_assessment_published", { p_id: id, p_published: published });
  if (error) throw new Error("No se pudo cambiar la publicación.");
}
export async function deleteAssessment(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.rpc("delete_assessment", { p_id: id });
  if (error) throw new Error("No se pudo eliminar la evaluación.");
}
