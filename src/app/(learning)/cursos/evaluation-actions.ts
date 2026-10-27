"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseAssessmentId, submissionFromForm } from "../../../application/assessments";
import { parseEnrollmentSlug } from "../../../application/learning-progress";
import { requireLearningUser } from "../../../infrastructure/supabase/learning-access";
import { createAssessmentRepository } from "../../../infrastructure/supabase/assessment-repository";

export async function submitAssessmentAction(form: FormData): Promise<void> {
  const { client,user } = await requireLearningUser();
  let courseSlug: string;
  let assessmentId: string;
  try { courseSlug=parseEnrollmentSlug(form.get("courseSlug")); assessmentId=parseAssessmentId(form.get("assessmentId")); }
  catch { redirect("/catalogo"); }
  const path = `/cursos/${courseSlug}/evaluaciones/${assessmentId}`;
  let resultId: string;
  try {
    const input=submissionFromForm(form);
    const repository=createAssessmentRepository(client,user.id);
    if (!await repository.getPublished(assessmentId,courseSlug)) throw new Error("Evaluación no disponible.");
    resultId=parseAssessmentId(await repository.submit(input));
  } catch { redirect(`${path}?estado=error`); }
  revalidatePath(path);
  revalidatePath(`/cursos/${courseSlug}`);
  redirect(`${path}/resultados/${resultId}`);
}
