import type { CourseLevel } from "./course";

export interface ContentLesson {
  slug: string;
  title: string;
  position: number;
  durationMinutes: number;
  intro: string;
  content: string;
  exampleCode: string;
  tip: string;
}

export interface ContentModule {
  slug: string;
  title: string;
  position: number;
  lessons: ContentLesson[];
}

export interface PublishedCourse {
  slug: string;
  title: string;
  level: CourseLevel;
  description: string;
  modules: ContentModule[];
}

export interface ManagedCourse extends PublishedCourse {
  categorySlug: string;
  durationHours: number;
  symbol: string;
  isPublished: boolean;
}

export interface CourseInput {
  slug: string;
  title: string;
  categorySlug: string;
  level: CourseLevel;
  durationHours: number;
  description: string;
  symbol: string;
  isPublished: boolean;
}

export interface ModuleInput {
  courseSlug: string;
  slug: string;
  title: string;
  position: number;
}

export interface LessonInput {
  courseSlug: string;
  moduleSlug: string;
  slug: string;
  title: string;
  position: number;
  durationMinutes: number;
  intro: string;
  content: string;
  exampleCode: string;
  tip: string;
}
