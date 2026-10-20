import type { Metadata } from "next";
import { requireContentAdmin } from "../../../../infrastructure/supabase/admin-access";
import { listContentCategories, listManagedCourses } from "../../../../infrastructure/supabase/admin-content-repository";
import { AdminCoursesView } from "../../../../presentation/views/AdminCoursesView";
import { createCourseAction } from "./actions";

export const metadata: Metadata = { title: "Gestión de cursos · AulaIA" };

export default async function AdminCoursesPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const client = await requireContentAdmin();
  const [categories, courses, query] = await Promise.all([
    listContentCategories(client), listManagedCourses(client), searchParams,
  ]);
  return <AdminCoursesView categories={categories} courses={courses} createAction={createCourseAction} status={query.estado} />;
}
