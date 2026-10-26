import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseContentSlug } from "../../../../application/content-management";
import { getDemoPublishedCourse } from "../../../../infrastructure/demo/content-repository";
import { getSupabaseConfig } from "../../../../infrastructure/supabase/config";
import { getPublishedCourse } from "../../../../infrastructure/supabase/content-repository";
import { CourseOverviewView } from "../../../../presentation/views/CourseOverviewView";
import { buildCourseProgress } from "../../../../application/learning-progress";
import { requireLearningUser } from "../../../../infrastructure/supabase/learning-access";
import { createLearningRepository } from "../../../../infrastructure/supabase/learning-repository";
import { enrollCourseAction } from "../actions";

export const metadata: Metadata = { title: "Contenido del curso · AulaIA" };

export default async function CoursePage({ params, searchParams }: { params: Promise<{ curso: string }>; searchParams: Promise<{ estado?: string }> }) {
  const { curso } = await params;
  let slug: string;
  try { slug = parseContentSlug(curso); } catch { notFound(); }
  const course = getSupabaseConfig() ? await getPublishedCourse(slug) : await getDemoPublishedCourse(slug);
  if (!course) notFound();
  if (getSupabaseConfig()) {
    const { client, user } = await requireLearningUser();
    const [snapshot, query] = await Promise.all([createLearningRepository(client, user.id).read(), searchParams]);
    return <CourseOverviewView course={course} progress={buildCourseProgress(course, snapshot)} enrollAction={enrollCourseAction} status={query.estado} />;
  }
  return <CourseOverviewView course={course} demo />;
}
