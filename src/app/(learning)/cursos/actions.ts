"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCompletionInput, parseEnrollmentSlug } from "../../../application/learning-progress";
import { requireLearningUser } from "../../../infrastructure/supabase/learning-access";
import { createLearningRepository } from "../../../infrastructure/supabase/learning-repository";

function refreshLearning(courseSlug: string) {
  revalidatePath("/inicio");
  revalidatePath("/catalogo");
  revalidatePath(`/cursos/${courseSlug}`);
  revalidatePath("/cursos/[curso]/lecciones/[leccion]", "page");
}

export async function enrollCourseAction(form: FormData): Promise<void> {
  const { client, user } = await requireLearningUser();
  let slug: string;
  try { slug = parseEnrollmentSlug(form.get("courseSlug")); } catch { redirect("/catalogo"); }
  const path = `/cursos/${slug}`;
  try {
    await createLearningRepository(client, user.id).enroll(slug);
  } catch { redirect(`${path}?estado=error`); }
  refreshLearning(slug);
  redirect(`${path}?estado=matriculado`);
}

export async function setLessonCompletedAction(form: FormData): Promise<void> {
  const { client, user } = await requireLearningUser();
  let input;
  try {
    const state = form.get("completed");
    input = parseCompletionInput({ courseSlug: form.get("courseSlug"), lessonSlug: form.get("lessonSlug"), completed: state === "true" ? true : state === "false" ? false : undefined });
  } catch { redirect("/catalogo"); }
  const path = `/cursos/${input.courseSlug}/lecciones/${input.lessonSlug}`;
  try {
    await createLearningRepository(client, user.id).setCompleted(input);
  } catch { redirect(`${path}?estado=error`); }
  refreshLearning(input.courseSlug);
  redirect(`${path}?estado=guardado`);
}
