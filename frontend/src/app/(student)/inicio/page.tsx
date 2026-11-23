import type { Metadata } from "next";
import { getStudentDashboard } from "@aulaia/backend/application/student-dashboard";
import { demoCourseRepository } from "@aulaia/backend/infrastructure/demo/course-repository";
import { HomeView } from "../../../presentation/views/HomeView";
import { buildLearningDashboard } from "@aulaia/backend/application/learning-progress";
import { getSupabaseConfig } from "@aulaia/backend/infrastructure/supabase/config";
import { requireLearningUser } from "@aulaia/backend/infrastructure/supabase/learning-access";
import { createLearningRepository, listLearningContent } from "@aulaia/backend/infrastructure/supabase/learning-repository";
import { supabaseCatalogRepository } from "@aulaia/backend/infrastructure/supabase/catalog-repository";
import { getProfile } from "@aulaia/backend/infrastructure/supabase/profile-repository";
import { listPublishedAssessments } from "@aulaia/backend/infrastructure/supabase/assessment-repository";

export const metadata: Metadata = { title: "Inicio · AulaIA" };

export default async function StudentHomePage() {
  if (getSupabaseConfig()) {
    const { client, user } = await requireLearningUser();
    const [snapshot, catalog, profile] = await Promise.all([
      createLearningRepository(client, user.id).read(), supabaseCatalogRepository.listPublished(), getProfile(user.id),
    ]);
    const enrolledSlugs = new Set(snapshot.enrollments.map((item) => item.courseSlug));
    const visibleEnrollments = catalog.courses.filter((course) => enrolledSlugs.has(course.slug)).map((course) => course.slug);
    const [content, assessments] = await Promise.all([
      listLearningContent(client, visibleEnrollments),
      listPublishedAssessments(client, visibleEnrollments),
    ]);
    const data = buildLearningDashboard(catalog.courses, content, snapshot);
    return <HomeView {...data} assessments={assessments} displayName={profile?.fullName || user.email?.split("@")[0] || "estudiante"} />;
  }
  const data = await getStudentDashboard(demoCourseRepository);
  return <HomeView {...data} />;
}
