import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseAssessmentId } from "@aulaia/backend/application/assessments";
import { parseEnrollmentSlug } from "@aulaia/backend/application/learning-progress";
import { requireStudentForRender } from "@/app/render-data";
import { createAssessmentRepository } from "@aulaia/backend/infrastructure/supabase/assessment-repository";
import { AssessmentResultView } from "../../../../../../../../presentation/views/AssessmentResultView";
export const metadata: Metadata = { title: "Resultado de evaluación · AulaIA" };

export default async function AssessmentResultPage({ params }: { params: Promise<{ curso: string; evaluacion: string; intento: string }> }) {
  const { client,user } = await requireStudentForRender();
  const raw=await params;
  let courseSlug: string; let assessmentId: string; let attemptId: string;
  try { courseSlug=parseEnrollmentSlug(raw.curso); assessmentId=parseAssessmentId(raw.evaluacion); attemptId=parseAssessmentId(raw.intento); } catch { notFound(); }
  const repository=createAssessmentRepository(client,user.id);
  const [attempt, assessment] = await Promise.all([
    repository.getAttempt(attemptId, assessmentId, courseSlug),
    repository.getPublished(assessmentId, courseSlug),
  ]);
  if (!attempt) notFound();
  return <AssessmentResultView attempt={attempt} retryAvailable={Boolean(assessment)} />;
}
