import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseAssessmentId } from "@aulaia/backend/application/assessments";
import { buildCourseProgress, canTakeCourseAssessments, parseEnrollmentSlug } from "@aulaia/backend/application/learning-progress";
import { requireLearningUser } from "@aulaia/backend/infrastructure/supabase/learning-access";
import { createLearningRepository } from "@aulaia/backend/infrastructure/supabase/learning-repository";
import { createAssessmentRepository } from "@aulaia/backend/infrastructure/supabase/assessment-repository";
import { getPublishedCourse } from "@aulaia/backend/infrastructure/supabase/content-repository";
import { AssessmentView } from "../../../../../../presentation/views/AssessmentView";
import { submitAssessmentAction } from "@aulaia/backend/interfaces/actions/assessments";
export const metadata: Metadata = { title: "Resolver evaluación · AulaIA" };

export default async function AssessmentPage({ params,searchParams }: { params: Promise<{ curso: string; evaluacion: string }>; searchParams: Promise<{ estado?: string }> }) {
  const { client,user } = await requireLearningUser();
  const raw=await params;
  let courseSlug: string; let id: string;
  try { courseSlug=parseEnrollmentSlug(raw.curso); id=parseAssessmentId(raw.evaluacion); } catch { notFound(); }
  const repository=createAssessmentRepository(client,user.id);
  const [assessment, course, snapshot, attempts, query] = await Promise.all([
    repository.getPublished(id, courseSlug), getPublishedCourse(courseSlug),
    createLearningRepository(client, user.id).read(), repository.listAttempts(id), searchParams,
  ]);
  if (!assessment || !course) notFound();
  const progress = buildCourseProgress(course, snapshot);
  const questions = canTakeCourseAssessments(progress) ? await repository.getQuestions(id) : [];
  return <AssessmentView assessment={assessment} questions={questions} progress={progress} attempts={attempts} requestId={randomUUID()} submitAction={submitAssessmentAction} status={query.estado} />;
}
