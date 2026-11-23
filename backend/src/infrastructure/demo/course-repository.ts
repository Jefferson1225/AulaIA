import type { Course, LearningActivity, Lesson } from "../../domain/course";
import type { CourseRepository } from "../../domain/course-repository";

const courses: Course[] = [
  {
    slug: "fundamentos-python",
    title: "Fundamentos de Python",
    category: "programacion",
    categoryLabel: "Programación",
    level: "principiante",
    durationHours: 18,
    description: "Aprende a programar desde cero con ejercicios y ejemplos prácticos.",
    symbol: "⟨/⟩",
    progress: 62,
  },
  {
    slug: "analisis-datos",
    title: "Análisis de datos con Excel y SQL",
    category: "datos",
    categoryLabel: "Ciencia de datos",
    level: "principiante",
    durationHours: 24,
    description: "Organiza, consulta y visualiza información para tomar mejores decisiones.",
    symbol: "ƒ(x)",
    progress: 28,
  },
  {
    slug: "ingles-profesional",
    title: "Inglés profesional para negocios",
    category: "idiomas",
    categoryLabel: "Idiomas",
    level: "intermedio",
    durationHours: 16,
    description: "Comunícate con seguridad en reuniones, correos y presentaciones.",
    symbol: "Aa",
    progress: 8,
  },
  {
    slug: "algebra-machine-learning",
    title: "Álgebra lineal para Machine Learning",
    category: "matematicas",
    categoryLabel: "Matemáticas",
    level: "intermedio",
    durationHours: 20,
    description: "Domina vectores, matrices y conceptos que sustentan los modelos de IA.",
    symbol: "∑",
    progress: null,
  },
  {
    slug: "diseno-interfaces",
    title: "Diseño de interfaces digitales",
    category: "diseno",
    categoryLabel: "Diseño",
    level: "principiante",
    durationHours: 10,
    description: "Crea interfaces claras y consistentes centradas en las personas.",
    symbol: "◐",
    progress: null,
  },
  {
    slug: "introduccion-ia",
    title: "Introducción a la Inteligencia Artificial",
    category: "datos",
    categoryLabel: "Ciencia de datos",
    level: "principiante",
    durationHours: 14,
    description: "Explora los principios, aplicaciones y límites de la IA actual.",
    symbol: "✦",
    progress: null,
  },
];

const activities: LearningActivity[] = [
  { title: "Evaluación del Módulo 1", detail: "Fundamentos de Python · 10 preguntas", kind: "evaluation" },
  { title: "Lección 3: Estructuras de control", detail: "Fundamentos de Python · 20 min", kind: "lesson" },
  { title: "Práctica guiada", detail: "Variables y tipos de datos · 6 ejercicios", kind: "practice" },
];

const lesson: Lesson = {
  slug: "variables-y-tipos",
  courseSlug: "fundamentos-python",
  title: "Variables y tipos de datos",
  number: 2,
  totalLessons: 6,
  durationMinutes: 18,
  moduleTitle: "Módulo 1 · Fundamentos",
  intro: "Aprende cómo guardar información y reconocer los valores básicos que usarás en tus programas.",
  sections: [
    {
      title: "¿Qué es una variable?",
      text: "En Python, una variable es un nombre que guarda un valor para usarlo más tarde. No necesitas declarar su tipo: Python lo identifica automáticamente.",
      code: 'nombre = "Valentina"\nedad = 24\naltura = 1.68\nes_estudiante = True',
    },
    {
      title: "Tipos de datos básicos",
      text: "Estos son los cuatro tipos más comunes cuando empiezas:",
      items: [
        { label: "int", description: "números enteros, como 24." },
        { label: "float", description: "números decimales, como 1.68." },
        { label: "str", description: 'texto, como "hola".' },
        { label: "bool", description: "verdadero o falso." },
      ],
    },
  ],
  tip: "Puedes consultar el tipo de un valor con type(). Por ejemplo, type(24) devuelve int.",
};

export const demoCourseRepository: CourseRepository = {
  async list() {
    return courses;
  },
  async listActivities() {
    return activities;
  },
  async findLesson(courseSlug, lessonSlug) {
    return courseSlug === lesson.courseSlug && lessonSlug === lesson.slug ? lesson : null;
  },
};
