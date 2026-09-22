export type CourseCategory = "programacion" | "datos" | "idiomas" | "matematicas" | "diseno" | "negocios";
export type CourseLevel = "principiante" | "intermedio" | "avanzado";

export interface Course {
  slug: string;
  title: string;
  category: CourseCategory;
  categoryLabel: string;
  level: CourseLevel;
  durationHours: number;
  description: string;
  symbol: string;
  progress: number | null;
}

export interface Lesson {
  slug: string;
  courseSlug: string;
  title: string;
  number: number;
  totalLessons: number;
  durationMinutes: number;
  moduleTitle: string;
  intro: string;
  sections: {
    title: string;
    text: string;
    code?: string;
    items?: { label: string; description: string }[];
  }[];
  tip: string;
}

export interface LearningActivity {
  title: string;
  detail: string;
  kind: "evaluation" | "lesson" | "practice";
}
