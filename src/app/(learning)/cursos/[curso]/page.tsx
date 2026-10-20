import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseContentSlug } from "../../../../application/content-management";
import { getDemoPublishedCourse } from "../../../../infrastructure/demo/content-repository";
import { getSupabaseConfig } from "../../../../infrastructure/supabase/config";
import { getPublishedCourse } from "../../../../infrastructure/supabase/content-repository";
import { CourseOverviewView } from "../../../../presentation/views/CourseOverviewView";

export const metadata: Metadata = { title: "Contenido del curso · AulaIA" };

export default async function CoursePage({ params }: { params: Promise<{ curso: string }> }) {
  const { curso } = await params;
  let slug: string;
  try { slug = parseContentSlug(curso); } catch { notFound(); }
  const course = getSupabaseConfig() ? await getPublishedCourse(slug) : await getDemoPublishedCourse(slug);
  if (!course) notFound();
  return <CourseOverviewView course={course} />;
}
