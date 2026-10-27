import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseAssessmentId } from "../../../../../../../../application/assessments";
import { parseEnrollmentSlug } from "../../../../../../../../application/learning-progress";
import { requireLearningUser } from "../../../../../../../../infrastructure/supabase/learning-access";
import { createAssessmentRepository } from "../../../../../../../../infrastructure/supabase/assessment-repository";
import { AssessmentResultView } from "../../../../../../../../presentation/views/AssessmentResultView";
export const metadata: Metadata = { title: "Resultado de evaluación · AulaIA" };

export default async function AssessmentResultPage({ params }: { params: Promise<{ curso: string; evaluacion: string; intento: string }> }) {
  const { client,user } = await requireLearningUser();
  const raw=await params;
  let courseSlug: string; let assessmentId: string; let attemptId: string;
  try { courseSlug=parseEnrollmentSlug(raw.curso); assessmentId=parseAssessmentId(raw.evaluacion); attemptId=parseAssessmentId(raw.intento); } catch { notFound(); }
  const repository=createAssessmentRepository(client,user.id);
  const attempt=await repository.getAttempt(attemptId,assessmentId,courseSlug);
  if (!attempt) notFound();
  return <AssessmentResultView attempt={attempt} retryAvailable={Boolean(await repository.getPublished(assessmentId,courseSlug))} />;
}
