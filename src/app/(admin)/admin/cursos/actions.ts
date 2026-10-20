"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseContentSlug, parseCourseInput, parseLessonInput, parseModuleInput } from "../../../../application/content-management";
import { requireContentAdmin } from "../../../../infrastructure/supabase/admin-access";
import {
  createCourse, createLesson, createModule, deleteDraftCourse, deleteLesson, deleteModule,
  updateCourse, updateLesson, updateModule, type ContentClient,
} from "../../../../infrastructure/supabase/admin-content-repository";

const value = (form: FormData, key: string) => String(form.get(key) ?? "");
const detailPath = (courseSlug: string) => `/admin/cursos/${encodeURIComponent(courseSlug)}`;

async function runMutation(
  courseSlug: string,
  work: (client: ContentClient) => Promise<void>,
  successPath: string,
  failurePath: string,
): Promise<never> {
  const client = await requireContentAdmin();
  try {
    await work(client);
  } catch {
    redirect(`${failurePath}?estado=error`);
  }
  revalidatePath("/admin/cursos");
  revalidatePath(detailPath(courseSlug));
  revalidatePath("/catalogo");
  revalidatePath(`/cursos/${encodeURIComponent(courseSlug)}`);
  redirect(`${successPath}?estado=guardado`);
}

export async function createCourseAction(form: FormData): Promise<void> {
  const slug = value(form, "slug");
  await runMutation(slug, (client) => createCourse(client, parseCourseInput({
    slug,
    title: value(form, "title"),
    categorySlug: value(form, "categorySlug"),
    level: value(form, "level"),
    durationHours: value(form, "durationHours"),
    description: value(form, "description"),
    symbol: value(form, "symbol"),
    isPublished: false,
  })), detailPath(slug), "/admin/cursos");
}

export async function updateCourseAction(form: FormData): Promise<void> {
  const slug = value(form, "slug");
  await runMutation(slug, (client) => updateCourse(client, parseCourseInput({
    slug,
    title: value(form, "title"),
    categorySlug: value(form, "categorySlug"),
    level: value(form, "level"),
    durationHours: value(form, "durationHours"),
    description: value(form, "description"),
    symbol: value(form, "symbol"),
    isPublished: form.get("isPublished") === "on",
  })), detailPath(slug), detailPath(slug));
}

export async function deleteCourseAction(form: FormData): Promise<void> {
  const slug = value(form, "slug");
  await runMutation(slug, (client) => {
    if (form.get("confirm") !== "on") throw new Error("Confirma la eliminación.");
    return deleteDraftCourse(client, parseContentSlug(slug));
  }, "/admin/cursos", detailPath(slug));
}

export async function createModuleAction(form: FormData): Promise<void> {
  const courseSlug = value(form, "courseSlug");
  await runMutation(courseSlug, (client) => createModule(client, parseModuleInput({
    courseSlug,
    slug: value(form, "slug"),
    title: value(form, "title"),
    position: value(form, "position"),
  })), detailPath(courseSlug), detailPath(courseSlug));
}

export async function updateModuleAction(form: FormData): Promise<void> {
  const courseSlug = value(form, "courseSlug");
  await runMutation(courseSlug, (client) => updateModule(client, parseModuleInput({
    courseSlug,
    slug: value(form, "slug"),
    title: value(form, "title"),
    position: value(form, "position"),
  })), detailPath(courseSlug), detailPath(courseSlug));
}

export async function deleteModuleAction(form: FormData): Promise<void> {
  const courseSlug = value(form, "courseSlug");
  await runMutation(courseSlug, (client) => {
    if (form.get("confirm") !== "on") throw new Error("Confirma la eliminación.");
    return deleteModule(client, parseContentSlug(courseSlug), parseContentSlug(value(form, "slug")));
  }, detailPath(courseSlug), detailPath(courseSlug));
}

function lessonInput(form: FormData) {
  return parseLessonInput({
    courseSlug: value(form, "courseSlug"), moduleSlug: value(form, "moduleSlug"),
    slug: value(form, "slug"), title: value(form, "title"),
    position: value(form, "position"), durationMinutes: value(form, "durationMinutes"),
    intro: value(form, "intro"), content: value(form, "content"),
    exampleCode: value(form, "exampleCode"), tip: value(form, "tip"),
  });
}

export async function createLessonAction(form: FormData): Promise<void> {
  const courseSlug = value(form, "courseSlug");
  await runMutation(courseSlug, (client) => createLesson(client, lessonInput(form)), detailPath(courseSlug), detailPath(courseSlug));
}

export async function updateLessonAction(form: FormData): Promise<void> {
  const courseSlug = value(form, "courseSlug");
  await runMutation(courseSlug, (client) => updateLesson(client, lessonInput(form)), detailPath(courseSlug), detailPath(courseSlug));
}

export async function deleteLessonAction(form: FormData): Promise<void> {
  const courseSlug = value(form, "courseSlug");
  await runMutation(courseSlug, (client) => {
    if (form.get("confirm") !== "on") throw new Error("Confirma la eliminación.");
    return deleteLesson(client, parseContentSlug(courseSlug), parseContentSlug(value(form, "slug")));
  }, detailPath(courseSlug), detailPath(courseSlug));
}
