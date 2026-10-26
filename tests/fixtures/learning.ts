import type { PublishedCourse } from "../../src/domain/content";

export const learningCourse: PublishedCourse = {
  slug: "robotica-basica", title: "Robótica básica", description: "Sensores y movimiento", level: "principiante",
  modules: [{ slug: "sensores", title: "Sensores", position: 1, lessons: [
    { slug: "sensores", title: "Conocer los sensores", position: 1, durationMinutes: 10, intro: "Introducción", content: "Contenido", exampleCode: "", tip: "" },
    { slug: "mediciones", title: "Tomar mediciones", position: 2, durationMinutes: 15, intro: "Introducción", content: "Contenido", exampleCode: "", tip: "" },
  ] }, { slug: "movimiento", title: "Movimiento", position: 2, lessons: [
    { slug: "motores", title: "Controlar motores", position: 1, durationMinutes: 20, intro: "Introducción", content: "Contenido", exampleCode: "", tip: "" },
  ] }],
};

export const enrolledSnapshot = {
  enrollments: [{ courseSlug: "robotica-basica", enrolledAt: "2026-10-21T10:00:00Z" }],
  completions: [{ courseSlug: "robotica-basica", lessonSlug: "sensores", completedAt: "2026-10-21T11:00:00Z" }],
};
