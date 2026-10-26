import type { SupabaseClient } from "@supabase/supabase-js";
import type { LearningCourse, LearningRepository } from "../../domain/learning";

interface EnrollmentRow { course_slug: string; enrolled_at: string }
interface CompletionRow { course_slug: string; lesson_slug: string; completed_at: string }

export function createLearningRepository(client: SupabaseClient, userId: string): LearningRepository {
  return {
    async read() {
      const [enrollments, completions] = await Promise.all([
        client.from("enrollments").select("course_slug,enrolled_at").eq("user_id", userId).order("enrolled_at", { ascending: false }),
        client.from("lesson_completions").select("course_slug,lesson_slug,completed_at").eq("user_id", userId),
      ]);
      if (enrollments.error || completions.error) throw new Error("No se pudo consultar tu avance. Comprueba la migración de matrículas.");
      return {
        enrollments: ((enrollments.data ?? []) as EnrollmentRow[]).map((item) => ({ courseSlug: item.course_slug, enrolledAt: item.enrolled_at })),
        completions: ((completions.data ?? []) as CompletionRow[]).map((item) => ({ courseSlug: item.course_slug, lessonSlug: item.lesson_slug, completedAt: item.completed_at })),
      };
    },
    async enroll(courseSlug) {
      const { error } = await client.from("enrollments").upsert({ user_id: userId, course_slug: courseSlug }, {
        onConflict: "user_id,course_slug", ignoreDuplicates: true,
      });
      if (error) throw new Error("No se pudo registrar tu matrícula.");
    },
    async setCompleted({ courseSlug, lessonSlug, completed }) {
      const query = completed
        ? client.from("lesson_completions").upsert({ user_id: userId, course_slug: courseSlug, lesson_slug: lessonSlug }, { onConflict: "user_id,course_slug,lesson_slug", ignoreDuplicates: true })
        : client.from("lesson_completions").delete().eq("user_id", userId).eq("course_slug", courseSlug).eq("lesson_slug", lessonSlug);
      const { error } = await query;
      if (error) throw new Error("No se pudo guardar el estado de la lección.");
    },
  };
}

/** Solo carga los identificadores, títulos y orden que necesita el panel, sin cuerpos de lecciones. */
export async function listLearningContent(client: SupabaseClient, courseSlugs: string[]): Promise<LearningCourse[]> {
  if (!courseSlugs.length) return [];
  const [modules, lessons] = await Promise.all([
    client.from("modules").select("course_slug,slug,position").in("course_slug", courseSlugs),
    client.from("lessons").select("course_slug,module_slug,slug,title,position").in("course_slug", courseSlugs),
  ]);
  if (modules.error || lessons.error) throw new Error("No se pudo consultar el contenido de tus cursos.");
  const moduleRows = (modules.data ?? []) as { course_slug: string; slug: string; position: number }[];
  const lessonRows = (lessons.data ?? []) as { course_slug: string; module_slug: string; slug: string; title: string; position: number }[];
  return courseSlugs.map((slug) => ({
    slug,
    modules: moduleRows.filter((item) => item.course_slug === slug).map((item) => ({
      slug: item.slug, position: item.position,
      lessons: lessonRows.filter((lesson) => lesson.course_slug === slug && lesson.module_slug === item.slug)
        .map((lesson) => ({ slug: lesson.slug, title: lesson.title, position: lesson.position })),
    })),
  }));
}
