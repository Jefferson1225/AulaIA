import type { CatalogCategory, Course, CourseLevel } from "../../domain/course";

export interface CatalogCourseRow {
  slug: string;
  title: string;
  category_slug: string;
  level: CourseLevel;
  duration_hours: number;
  description: string;
  symbol: string;
}

export function mapCatalogCourses(rows: CatalogCourseRow[], categories: CatalogCategory[]): Course[] {
  const labels = new Map(categories.map((category) => [category.slug, category.name]));
  return rows.map((row) => {
    const categoryLabel = labels.get(row.category_slug);
    if (!categoryLabel) throw new Error(`Falta la categoría ${row.category_slug}.`);
    return {
      slug: row.slug,
      title: row.title,
      category: row.category_slug,
      categoryLabel,
      level: row.level,
      durationHours: row.duration_hours,
      description: row.description,
      symbol: row.symbol,
      progress: null,
    };
  });
}
