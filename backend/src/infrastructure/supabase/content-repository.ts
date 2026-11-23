import type { PublishedCourse } from "../../domain/content";
import { mapPublishedCourse, type LessonRow, type ModuleRow, type PublishedCourseRow } from "./content-mapper";
import { createSupabaseServerClient } from "./server";

export async function getPublishedCourse(courseSlug: string): Promise<PublishedCourse | null> {
  const supabase = await createSupabaseServerClient();
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("slug,title,level,description")
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (courseError) throw new Error("No se pudo consultar el curso.");
  if (!course) return null;

  const [modulesResult, lessonsResult] = await Promise.all([
    supabase.from("modules").select("course_slug,slug,title,position").eq("course_slug", courseSlug).order("position"),
    supabase.from("lessons").select("course_slug,module_slug,slug,title,position,duration_minutes,intro,content,example_code,tip").eq("course_slug", courseSlug).order("position"),
  ]);

  if (modulesResult.error || lessonsResult.error) throw new Error("No se pudo cargar el contenido del curso. Revisa la migración de Supabase.");
  return mapPublishedCourse(course as PublishedCourseRow, (modulesResult.data ?? []) as ModuleRow[], (lessonsResult.data ?? []) as LessonRow[]);
}
