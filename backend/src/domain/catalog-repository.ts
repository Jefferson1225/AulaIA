import type { CatalogCategory, Course } from "./course";

export interface CatalogSnapshot {
  categories: CatalogCategory[];
  courses: Course[];
}

export interface CatalogRepository {
  listPublished(): Promise<CatalogSnapshot>;
}
