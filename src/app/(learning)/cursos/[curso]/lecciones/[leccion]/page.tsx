import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLesson } from "../../../../../../application/lesson";
import { demoCourseRepository } from "../../../../../../infrastructure/demo/course-repository";
import { LessonView } from "../../../../../../presentation/views/LessonView";

export const metadata: Metadata = { title: "Lección · AulaIA" };

export default async function LessonPage({ params }: { params: Promise<{ curso: string; leccion: string }> }) {
  const { curso, leccion } = await params;
  const lesson = await getLesson(demoCourseRepository, curso, leccion);
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
