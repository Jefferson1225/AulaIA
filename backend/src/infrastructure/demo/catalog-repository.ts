import type { CatalogRepository } from "../../domain/catalog-repository";
import { demoCourseRepository } from "./course-repository";

export const demoCatalogRepository: CatalogRepository = {
  async listPublished() {
    const courses = await demoCourseRepository.list();
    const categories = Array.from(new Map(courses.map((course) => [
      course.category,
      { slug: course.category, name: course.categoryLabel, position: 0 },
    ])).values()).map((category, index) => ({ ...category, position: index + 1 }));
    return { categories, courses };
  },
};
