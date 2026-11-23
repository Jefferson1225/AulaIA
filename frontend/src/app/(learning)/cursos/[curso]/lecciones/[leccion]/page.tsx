import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findLessonInCourse } from "@aulaia/backend/application/content-access";
import { getLesson } from "@aulaia/backend/application/lesson";
import { demoCourseRepository } from "@aulaia/backend/infrastructure/demo/course-repository";
import { getSupabaseConfig } from "@aulaia/backend/infrastructure/supabase/config";
import { getPublishedCourse } from "@aulaia/backend/infrastructure/supabase/content-repository";
import { LessonView } from "../../../../../../presentation/views/LessonView";
import { buildCourseProgress } from "@aulaia/backend/application/learning-progress";
import { requireLearningUser } from "@aulaia/backend/infrastructure/supabase/learning-access";
import { createLearningRepository } from "@aulaia/backend/infrastructure/supabase/learning-repository";
import { setLessonCompletedAction } from "@aulaia/backend/interfaces/actions/learning";
import { readTutorHistory } from "@aulaia/backend/infrastructure/supabase/tutor-repository";

export const metadata: Metadata = { title: "Lección · AulaIA" };

export default async function LessonPage({ params, searchParams }: { params: Promise<{ curso: string; leccion: string }>; searchParams: Promise<{ estado?: string }> }) {
  const { curso, leccion } = await params;
  if (getSupabaseConfig()) {
    const { client, user } = await requireLearningUser();
    const course = await getPublishedCourse(curso);
    if (!course) notFound();
    const lesson = findLessonInCourse(course, leccion);
    if (!lesson) notFound();
    const [snapshot, query, turns] = await Promise.all([createLearningRepository(client, user.id).read(), searchParams, readTutorHistory(client, user.id, curso, leccion)]);
    return <LessonView lesson={lesson} tutorAvailable={Boolean(process.env.DEEPSEEK_API_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY)} tutorInitialTurns={turns} progress={buildCourseProgress(course, snapshot)} completionAction={setLessonCompletedAction} status={query.estado} />;
  }
  const lesson = await getLesson(demoCourseRepository, curso, leccion);
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
