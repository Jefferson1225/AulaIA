import type { PublishedCourse } from "../../domain/content";
import { mapPublishedCourse, type LessonRow, type ModuleRow, type PublishedCourseRow } from "./content-mapper";
import { createSupabaseServerClient } from "./server";

type CourseWithContent = PublishedCourseRow & {
  modules: (ModuleRow & { lessons: LessonRow[] })[];
};

export async function getPublishedCourse(courseSlug: string): Promise<PublishedCourse | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select(`
      slug,title,level,description,
      modules(
        course_slug,slug,title,position,
        lessons(course_slug,module_slug,slug,title,position,duration_minutes,intro,content,example_code,tip)
      )
    `)
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .maybeSingle<CourseWithContent>();

  if (error) throw new Error("No se pudo consultar el contenido del curso.");
  if (!data) return null;
  return mapPublishedCourse(data, data.modules, data.modules.flatMap(({ lessons }) => lessons));
}
