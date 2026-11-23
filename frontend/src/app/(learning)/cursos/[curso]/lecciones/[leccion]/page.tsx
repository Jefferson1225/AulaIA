import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findLessonInCourse } from "@aulaia/backend/application/content-access";
import { getLesson } from "@aulaia/backend/application/lesson";
import { demoCourseRepository } from "@aulaia/backend/infrastructure/demo/course-repository";
import { getSupabaseConfig } from "@aulaia/backend/infrastructure/supabase/config";
import { getPublishedCourse } from "@aulaia/backend/infrastructure/supabase/content-repository";
import { LessonView } from "../../../../../../presentation/views/LessonView";
import { buildCourseProgress } from "@aulaia/backend/application/learning-progress";
import { requireStudentForRender } from "@/app/render-data";
import { createLearningRepository } from "@aulaia/backend/infrastructure/supabase/learning-repository";
import { setLessonCompletedAction } from "@aulaia/backend/interfaces/actions/learning";
import { readTutorHistory } from "@aulaia/backend/infrastructure/supabase/tutor-repository";

export const metadata: Metadata = { title: "Lección · AulaIA" };

export default async function LessonPage({ params, searchParams }: { params: Promise<{ curso: string; leccion: string }>; searchParams: Promise<{ estado?: string }> }) {
  const { curso, leccion } = await params;
  if (getSupabaseConfig()) {
    const { client, user } = await requireStudentForRender();
    const tutorAvailable = Boolean(process.env.DEEPSEEK_API_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
    const [course, snapshot, query, turns] = await Promise.all([
      getPublishedCourse(curso),
      createLearningRepository(client, user.id).read(),
      searchParams,
      tutorAvailable ? readTutorHistory(client, user.id, curso, leccion) : [],
    ]);
    if (!course) notFound();
    const lesson = findLessonInCourse(course, leccion);
    if (!lesson) notFound();
    return <LessonView lesson={lesson} tutorAvailable={tutorAvailable} tutorInitialTurns={turns} progress={buildCourseProgress(course, snapshot)} completionAction={setLessonCompletedAction} status={query.estado} />;
  }
  const lesson = await getLesson(demoCourseRepository, curso, leccion);
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
