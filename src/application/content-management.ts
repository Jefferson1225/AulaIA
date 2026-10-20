import { z } from "zod";
import type { UserRole } from "../domain/profile";
import type { CourseInput, ModuleInput, LessonInput } from "../domain/content";

const slug = z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const title = z.string().trim().min(3).max(120);
const positiveInteger = z.coerce.number().int().positive();

const courseSchema = z.object({
  slug,
  title,
  categorySlug: slug,
  level: z.enum(["principiante", "intermedio", "avanzado"]),
  durationHours: positiveInteger,
  description: z.string().trim().max(2000),
  symbol: z.string().trim().min(1).max(12),
  isPublished: z.boolean(),
});

const moduleSchema = z.object({
  courseSlug: slug,
  slug,
  title,
  position: positiveInteger,
});

const lessonSchema = z.object({
  courseSlug: slug,
  moduleSlug: slug,
  slug,
  title,
  position: positiveInteger,
  durationMinutes: positiveInteger,
  intro: z.string().trim().min(1).max(2000),
  content: z.string().trim().min(1).max(20000),
  exampleCode: z.string().trim().max(10000),
  tip: z.string().trim().max(2000),
});

export type { CourseInput, ModuleInput, LessonInput } from "../domain/content";

export const parseCourseInput = (value: unknown): CourseInput => courseSchema.parse(value);
export const parseModuleInput = (value: unknown): ModuleInput => moduleSchema.parse(value);
export const parseLessonInput = (value: unknown): LessonInput => lessonSchema.parse(value);
export const parseContentSlug = (value: unknown): string => slug.parse(value);

export function canManageContent(role: UserRole | null | undefined): boolean {
  return role === "admin";
}
