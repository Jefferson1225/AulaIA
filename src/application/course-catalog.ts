import type { Course, CourseCategory, CourseLevel } from "../domain/course";

export interface CourseFilters {
  query: string;
  category: CourseCategory | "todas";
  level: CourseLevel | "todos";
}

function normalize(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
}

export function filterCourses(courses: Course[], filters: CourseFilters): Course[] {
  const query = normalize(filters.query);

  return courses.filter((course) => {
    const matchesQuery = !query || normalize(`${course.title} ${course.description} ${course.categoryLabel}`).includes(query);
    const matchesCategory = filters.category === "todas" || course.category === filters.category;
    const matchesLevel = filters.level === "todos" || course.level === filters.level;
    return matchesQuery && matchesCategory && matchesLevel;
  });
}
