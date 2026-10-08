import type { CatalogRepository } from "../../domain/catalog-repository";
import type { CatalogCategory } from "../../domain/course";
import { mapCatalogCourses, type CatalogCourseRow } from "./catalog-mapper";
import { createSupabaseServerClient } from "./server";

export const supabaseCatalogRepository: CatalogRepository = {
  async listPublished() {
    const supabase = await createSupabaseServerClient();
    const [categoriesResult, coursesResult] = await Promise.all([
      supabase.from("categories").select("slug,name,position").order("position", { ascending: true }),
      supabase.from("courses").select("slug,title,category_slug,level,duration_hours,description,symbol").eq("is_published", true).order("title", { ascending: true }),
    ]);

    if (categoriesResult.error || coursesResult.error) throw new Error("No se pudo cargar el catálogo de Supabase.");
    const categories = (categoriesResult.data ?? []) as CatalogCategory[];
    const courses = mapCatalogCourses((coursesResult.data ?? []) as CatalogCourseRow[], categories);
    return { categories, courses };
  },
};
