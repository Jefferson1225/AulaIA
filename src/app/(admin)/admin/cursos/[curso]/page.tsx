import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseContentSlug } from "../../../../../application/content-management";
import { requireContentAdmin } from "../../../../../infrastructure/supabase/admin-access";
import { getManagedCourse, listContentCategories } from "../../../../../infrastructure/supabase/admin-content-repository";
import { AdminCourseDetailView } from "../../../../../presentation/views/AdminCourseDetailView";
import {
  createLessonAction, createModuleAction, deleteCourseAction, deleteLessonAction,
  deleteModuleAction, updateCourseAction, updateLessonAction, updateModuleAction,
} from "../actions";

export const metadata: Metadata = { title: "Editar curso · AulaIA" };

export default async function AdminCoursePage({
  params, searchParams,
}: {
  params: Promise<{ curso: string }>;
  searchParams: Promise<{ estado?: string }>;
}) {
  const { curso } = await params;
  let slug: string;
  try { slug = parseContentSlug(curso); } catch { notFound(); }
  const client = await requireContentAdmin();
  const [course, categories, query] = await Promise.all([
    getManagedCourse(client, slug), listContentCategories(client), searchParams,
  ]);
  if (!course) notFound();
  return <AdminCourseDetailView course={course} categories={categories} status={query.estado} actions={{
    updateCourse: updateCourseAction,
    deleteCourse: deleteCourseAction,
    createModule: createModuleAction,
    updateModule: updateModuleAction,
    deleteModule: deleteModuleAction,
    createLesson: createLessonAction,
    updateLesson: updateLessonAction,
    deleteLesson: deleteLessonAction,
  }} />;
}
