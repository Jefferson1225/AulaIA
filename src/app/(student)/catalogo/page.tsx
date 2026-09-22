import type { Metadata } from "next";
import { demoCourseRepository } from "../../../infrastructure/demo/course-repository";
import { CatalogView } from "../../../presentation/views/CatalogView";

export const metadata: Metadata = { title: "Catálogo · AulaIA" };

export default async function CatalogPage() {
  const courses = await demoCourseRepository.list();
  return <CatalogView courses={courses} />;
}
