import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseAssessmentId } from "../../../../../../application/assessments";
import { parseEnrollmentSlug } from "../../../../../../application/learning-progress";
import { requireLearningUser } from "../../../../../../infrastructure/supabase/learning-access";
import { createLearningRepository } from "../../../../../../infrastructure/supabase/learning-repository";
import { createAssessmentRepository } from "../../../../../../infrastructure/supabase/assessment-repository";
import { AssessmentView } from "../../../../../../presentation/views/AssessmentView";
import { submitAssessmentAction } from "../../../evaluation-actions";
export const metadata: Metadata = { title: "Resolver evaluación · AulaIA" };

export default async function AssessmentPage({ params,searchParams }: { params: Promise<{ curso: string; evaluacion: string }>; searchParams: Promise<{ estado?: string }> }) {
  const { client,user } = await requireLearningUser();
  const raw=await params;
  let courseSlug: string; let id: string;
  try { courseSlug=parseEnrollmentSlug(raw.curso); id=parseAssessmentId(raw.evaluacion); } catch { notFound(); }
  const repository=createAssessmentRepository(client,user.id);
  const [assessment,snapshot,attempts,query]=await Promise.all([repository.getPublished(id,courseSlug),createLearningRepository(client,user.id).read(),repository.listAttempts(id),searchParams]);
  if (!assessment) notFound();
  const enrolled=snapshot.enrollments.some((item)=>item.courseSlug===courseSlug);
  const questions=enrolled ? await repository.getQuestions(id) : [];
  return <AssessmentView assessment={assessment} questions={questions} enrolled={enrolled} attempts={attempts} requestId={randomUUID()} submitAction={submitAssessmentAction} status={query.estado} />;
}
