import type { Metadata } from "next";
import { getStudentDashboard } from "../../../application/student-dashboard";
import { demoCourseRepository } from "../../../infrastructure/demo/course-repository";
import { HomeView } from "../../../presentation/views/HomeView";

export const metadata: Metadata = { title: "Inicio · AulaIA" };

export default async function StudentHomePage() {
  const data = await getStudentDashboard(demoCourseRepository);
  return <HomeView {...data} />;
}
