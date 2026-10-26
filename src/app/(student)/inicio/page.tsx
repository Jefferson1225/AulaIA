import type { Metadata } from "next";
import { getStudentDashboard } from "../../../application/student-dashboard";
import { demoCourseRepository } from "../../../infrastructure/demo/course-repository";
import { HomeView } from "../../../presentation/views/HomeView";
import { buildLearningDashboard } from "../../../application/learning-progress";
import { getSupabaseConfig } from "../../../infrastructure/supabase/config";
import { requireLearningUser } from "../../../infrastructure/supabase/learning-access";
import { createLearningRepository, listLearningContent } from "../../../infrastructure/supabase/learning-repository";
import { supabaseCatalogRepository } from "../../../infrastructure/supabase/catalog-repository";
import { getProfile } from "../../../infrastructure/supabase/profile-repository";

export const metadata: Metadata = { title: "Inicio · AulaIA" };

export default async function StudentHomePage() {
  if (getSupabaseConfig()) {
    const { client, user } = await requireLearningUser();
    const [snapshot, catalog, profile] = await Promise.all([
      createLearningRepository(client, user.id).read(), supabaseCatalogRepository.listPublished(), getProfile(user.id),
    ]);
    const enrolledSlugs = new Set(snapshot.enrollments.map((item) => item.courseSlug));
    const content = await listLearningContent(client, catalog.courses.filter((course) => enrolledSlugs.has(course.slug)).map((course) => course.slug));
    const data = buildLearningDashboard(catalog.courses, content, snapshot);
    return <HomeView {...data} displayName={profile?.fullName || user.email?.split("@")[0] || "estudiante"} />;
  }
  const data = await getStudentDashboard(demoCourseRepository);
  return <HomeView {...data} />;
}
