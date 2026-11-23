import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseContentSlug } from "@aulaia/backend/application/content-management";
import { getDemoPublishedCourse } from "@aulaia/backend/infrastructure/demo/content-repository";
import { getSupabaseConfig } from "@aulaia/backend/infrastructure/supabase/config";
import { getPublishedCourse } from "@aulaia/backend/infrastructure/supabase/content-repository";
import { CourseOverviewView } from "../../../../presentation/views/CourseOverviewView";
import { buildCourseProgress } from "@aulaia/backend/application/learning-progress";
import { requireStudentForRender } from "@/app/render-data";
import { createLearningRepository } from "@aulaia/backend/infrastructure/supabase/learning-repository";
import { enrollCourseAction } from "@aulaia/backend/interfaces/actions/learning";
import { createAssessmentRepository } from "@aulaia/backend/infrastructure/supabase/assessment-repository";

export const metadata: Metadata = { title: "Contenido del curso · AulaIA" };

export default async function CoursePage({ params, searchParams }: { params: Promise<{ curso: string }>; searchParams: Promise<{ estado?: string }> }) {
  const { curso } = await params;
  let slug: string;
  try { slug = parseContentSlug(curso); } catch { notFound(); }
  if (getSupabaseConfig()) {
    const { client, user } = await requireStudentForRender();
    const [course, snapshot, query, assessments] = await Promise.all([
      getPublishedCourse(slug),
      createLearningRepository(client, user.id).read(),
      searchParams,
      createAssessmentRepository(client, user.id).listPublished(slug),
    ]);
    if (!course) notFound();
    return <CourseOverviewView course={course} progress={buildCourseProgress(course, snapshot)} enrollAction={enrollCourseAction} status={query.estado} assessments={assessments} />;
  }
  const course = await getDemoPublishedCourse(slug);
  if (!course) notFound();
  return <CourseOverviewView course={course} demo />;
}
