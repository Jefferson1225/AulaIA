import type { Metadata } from "next";
import { demoCatalogRepository } from "../../../infrastructure/demo/catalog-repository";
import { getSupabaseConfig } from "../../../infrastructure/supabase/config";
import { supabaseCatalogRepository } from "../../../infrastructure/supabase/catalog-repository";
import { CatalogView } from "../../../presentation/views/CatalogView";

export const metadata: Metadata = { title: "Catálogo · AulaIA" };

export default async function CatalogPage() {
  const repository = getSupabaseConfig() ? supabaseCatalogRepository : demoCatalogRepository;
  const { categories, courses } = await repository.listPublished();
  return <CatalogView courses={courses} categories={categories} />;
}
