import type { CourseInput, LessonInput, ModuleInput } from "../../domain/content";
import type { CatalogCategory } from "../../domain/course";
import type { ManagedCourse } from "../../domain/content";
import { mapPublishedCourse, type LessonRow, type ModuleRow, type PublishedCourseRow } from "./content-mapper";
import { createSupabaseServerClient } from "./server";

export type ContentClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

interface ManagedCourseRow extends PublishedCourseRow {
  category_slug: string;
  duration_hours: number;
  symbol: string;
  is_published: boolean;
}

function mapManagedCourse(row: ManagedCourseRow, modules: ModuleRow[] = [], lessons: LessonRow[] = []): ManagedCourse {
  return {
    ...mapPublishedCourse(row, modules, lessons),
    categorySlug: row.category_slug,
    durationHours: row.duration_hours,
    symbol: row.symbol,
    isPublished: row.is_published,
  };
}

export async function listContentCategories(client: ContentClient): Promise<CatalogCategory[]> {
  const { data, error } = await client.from("categories").select("slug,name,position").order("position");
  if (error) throw new Error("No se pudieron cargar las categorías.");
  return (data ?? []) as CatalogCategory[];
}

export async function listManagedCourses(client: ContentClient): Promise<ManagedCourse[]> {
  const { data, error } = await client.from("courses")
    .select("slug,title,category_slug,level,duration_hours,description,symbol,is_published")
    .order("title");
  if (error) throw new Error("No se pudieron cargar los cursos.");
  return ((data ?? []) as ManagedCourseRow[]).map((row) => mapManagedCourse(row));
}

export async function getManagedCourse(client: ContentClient, slug: string): Promise<ManagedCourse | null> {
  const { data: course, error: courseError } = await client.from("courses")
    .select("slug,title,category_slug,level,duration_hours,description,symbol,is_published")
    .eq("slug", slug).maybeSingle();
  if (courseError) throw new Error("No se pudo consultar el curso.");
  if (!course) return null;

  const [modulesResult, lessonsResult] = await Promise.all([
    client.from("modules").select("course_slug,slug,title,position").eq("course_slug", slug).order("position"),
    client.from("lessons").select("course_slug,module_slug,slug,title,position,duration_minutes,intro,content,example_code,tip").eq("course_slug", slug).order("position"),
  ]);
  if (modulesResult.error || lessonsResult.error) throw new Error("No se pudo consultar el contenido del curso.");
  return mapManagedCourse(course as ManagedCourseRow, (modulesResult.data ?? []) as ModuleRow[], (lessonsResult.data ?? []) as LessonRow[]);
}

function assertSaved(error: { message: string } | null, message: string) {
  if (error) throw new Error(message);
}

function assertChanged(error: { message: string } | null, rows: { slug: string }[] | null, message: string) {
  if (error || !rows?.length) throw new Error(message);
}

export async function createCourse(client: ContentClient, input: CourseInput) {
  const { error } = await client.from("courses").insert({
    slug: input.slug, title: input.title, category_slug: input.categorySlug, level: input.level,
    duration_hours: input.durationHours, description: input.description, symbol: input.symbol,
    is_published: input.isPublished,
  });
  assertSaved(error, "No se pudo crear el curso.");
}

export async function updateCourse(client: ContentClient, input: CourseInput) {
  const { data, error } = await client.from("courses").update({
    title: input.title, category_slug: input.categorySlug, level: input.level,
    duration_hours: input.durationHours, description: input.description, symbol: input.symbol,
    is_published: input.isPublished,
  }).eq("slug", input.slug).select("slug");
  assertChanged(error, data, "No se pudo actualizar el curso.");
}

export async function deleteDraftCourse(client: ContentClient, slug: string) {
  const { data, error } = await client.from("courses").delete().eq("slug", slug).eq("is_published", false).select("slug");
  assertChanged(error, data, "No se pudo eliminar el curso borrador.");
}

export async function createModule(client: ContentClient, input: ModuleInput) {
  const { error } = await client.from("modules").insert({
    course_slug: input.courseSlug, slug: input.slug, title: input.title, position: input.position,
  });
  assertSaved(error, "No se pudo crear el módulo.");
}

export async function updateModule(client: ContentClient, input: ModuleInput) {
  const { data, error } = await client.from("modules").update({ title: input.title, position: input.position })
    .eq("course_slug", input.courseSlug).eq("slug", input.slug).select("slug");
  assertChanged(error, data, "No se pudo actualizar el módulo.");
}

export async function deleteModule(client: ContentClient, courseSlug: string, moduleSlug: string) {
  const { data, error } = await client.from("modules").delete().eq("course_slug", courseSlug).eq("slug", moduleSlug).select("slug");
  assertChanged(error, data, "No se pudo eliminar el módulo.");
}

export async function createLesson(client: ContentClient, input: LessonInput) {
  const { error } = await client.from("lessons").insert({
    course_slug: input.courseSlug, module_slug: input.moduleSlug, slug: input.slug,
    title: input.title, position: input.position, duration_minutes: input.durationMinutes,
    intro: input.intro, content: input.content, example_code: input.exampleCode, tip: input.tip,
  });
  assertSaved(error, "No se pudo crear la lección.");
}

export async function updateLesson(client: ContentClient, input: LessonInput) {
  const { data, error } = await client.from("lessons").update({
    module_slug: input.moduleSlug, title: input.title, position: input.position,
    duration_minutes: input.durationMinutes, intro: input.intro, content: input.content,
    example_code: input.exampleCode, tip: input.tip,
  }).eq("course_slug", input.courseSlug).eq("slug", input.slug).select("slug");
  assertChanged(error, data, "No se pudo actualizar la lección.");
}

export async function deleteLesson(client: ContentClient, courseSlug: string, lessonSlug: string) {
  const { data, error } = await client.from("lessons").delete().eq("course_slug", courseSlug).eq("slug", lessonSlug).select("slug");
  assertChanged(error, data, "No se pudo eliminar la lección.");
}
