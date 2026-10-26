import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findLessonInCourse } from "../../../../../../application/content-access";
import { getLesson } from "../../../../../../application/lesson";
import { demoCourseRepository } from "../../../../../../infrastructure/demo/course-repository";
import { getSupabaseConfig } from "../../../../../../infrastructure/supabase/config";
import { getPublishedCourse } from "../../../../../../infrastructure/supabase/content-repository";
import { LessonView } from "../../../../../../presentation/views/LessonView";
import { buildCourseProgress } from "../../../../../../application/learning-progress";
import { requireLearningUser } from "../../../../../../infrastructure/supabase/learning-access";
import { createLearningRepository } from "../../../../../../infrastructure/supabase/learning-repository";
import { setLessonCompletedAction } from "../../../actions";

export const metadata: Metadata = { title: "Lección · AulaIA" };

export default async function LessonPage({ params, searchParams }: { params: Promise<{ curso: string; leccion: string }>; searchParams: Promise<{ estado?: string }> }) {
  const { curso, leccion } = await params;
  if (getSupabaseConfig()) {
    const { client, user } = await requireLearningUser();
    const course = await getPublishedCourse(curso);
    if (!course) notFound();
    const lesson = findLessonInCourse(course, leccion);
    if (!lesson) notFound();
    const [snapshot, query] = await Promise.all([createLearningRepository(client, user.id).read(), searchParams]);
    return <LessonView lesson={lesson} tutorAvailable={Boolean(process.env.DEEPSEEK_API_KEY)} progress={buildCourseProgress(course, snapshot)} completionAction={setLessonCompletedAction} status={query.estado} />;
  }
  const lesson = await getLesson(demoCourseRepository, curso, leccion);
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
