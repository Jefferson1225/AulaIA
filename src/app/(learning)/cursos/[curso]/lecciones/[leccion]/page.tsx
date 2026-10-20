import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findLessonInCourse } from "../../../../../../application/content-access";
import { getLesson } from "../../../../../../application/lesson";
import { demoCourseRepository } from "../../../../../../infrastructure/demo/course-repository";
import { getSupabaseConfig } from "../../../../../../infrastructure/supabase/config";
import { getPublishedCourse } from "../../../../../../infrastructure/supabase/content-repository";
import { LessonView } from "../../../../../../presentation/views/LessonView";

export const metadata: Metadata = { title: "Lección · AulaIA" };

export default async function LessonPage({ params }: { params: Promise<{ curso: string; leccion: string }> }) {
  const { curso, leccion } = await params;
  let lesson;
  if (getSupabaseConfig()) {
    const course = await getPublishedCourse(curso);
    lesson = course ? findLessonInCourse(course, leccion) : null;
  } else {
    lesson = await getLesson(demoCourseRepository, curso, leccion);
  }
  if (!lesson) notFound();
  return <LessonView lesson={lesson} tutorAvailable={Boolean(process.env.DEEPSEEK_API_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))} />;
}
