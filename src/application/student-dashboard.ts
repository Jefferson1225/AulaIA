import type { CourseRepository } from "../domain/course-repository";

export async function getStudentDashboard(repository: CourseRepository) {
  const [courses, activities] = await Promise.all([repository.list(), repository.listActivities()]);
  const enrolledCourses = courses.filter((course) => course.progress !== null);
  const continueCourse = enrolledCourses.find((course) => course.progress !== null && course.progress < 100) ?? null;

  return {
    continueCourse,
    enrolledCourses,
    activities,
    recommendedCourses: courses.filter((course) => course.progress === null).slice(0, 3),
  };
}
