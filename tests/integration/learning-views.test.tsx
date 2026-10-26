// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { CourseOverviewView } from "../../src/presentation/views/CourseOverviewView";
import { LessonView } from "../../src/presentation/views/LessonView";
import { HomeView } from "../../src/presentation/views/HomeView";
import { buildCourseProgress, buildLearningDashboard } from "../../src/application/learning-progress";
import { findLessonInCourse } from "../../src/application/content-access";
import { learningCourse, enrolledSnapshot } from "../fixtures/learning";
import { LearningFeedback } from "../../src/presentation/components/LearningFeedback";

const action = async () => {};

describe("vistas de matrículas y avance", () => {
  it("ignora estados de URL que no pertenecen a las operaciones de aprendizaje", () => {
    const { container } = render(<LearningFeedback status="__proto__" />);
    expect(container).toBeEmptyDOMElement();
  });
  it("ofrece matrícula y envía el identificador del curso abierto", () => {
    render(<CourseOverviewView course={learningCourse} progress={buildCourseProgress(learningCourse, { enrollments: [], completions: [] })} enrollAction={action} />);
    const button = screen.getByRole("button", { name: "Matricularme en este curso" });
    expect(new FormData(button.closest("form")!).get("courseSlug")).toBe("robotica-basica");
  });

  it("muestra avance y enlaza la primera lección pendiente del curso", () => {
    render(<CourseOverviewView course={learningCourse} progress={buildCourseProgress(learningCourse, enrolledSnapshot)} enrollAction={action} />);
    expect(screen.queryByRole("button", { name: "Matricularme en este curso" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Progreso del curso: 33%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar curso" })).toHaveAttribute("href", "/cursos/robotica-basica/lecciones/mediciones");
    expect(screen.getByRole("link", { name: /Conocer los sensores.*Completada/ })).toBeInTheDocument();
  });

  it("pide matrícula para guardar el avance de una lección", () => {
    const lesson = findLessonInCourse(learningCourse, "sensores")!;
    render(<LessonView lesson={lesson} progress={buildCourseProgress(learningCourse, { enrollments: [], completions: [] })} completionAction={action} />);
    expect(screen.getByRole("link", { name: /Matricúlate para guardar tu avance/ })).toHaveAttribute("href", "/cursos/robotica-basica");
    expect(screen.queryByRole("button", { name: /Marcar como/ })).not.toBeInTheDocument();
  });

  it.each([false, true])("permite guardar y deshacer el completado (actual: %s)", (completed) => {
    const snapshot = { ...enrolledSnapshot, completions: completed ? enrolledSnapshot.completions : [] };
    render(<LessonView lesson={findLessonInCourse(learningCourse, "sensores")!} progress={buildCourseProgress(learningCourse, snapshot)} completionAction={action} />);
    const button = screen.getByRole("button", { name: completed ? "Marcar como pendiente" : "Marcar como completada" });
    const form = new FormData(button.closest("form")!);
    expect(form.get("courseSlug")).toBe("robotica-basica");
    expect(form.get("lessonSlug")).toBe("sensores");
    expect(form.get("completed")).toBe(completed ? "false" : "true");
  });

  it("el inicio de una cuenta nueva no inventa matrículas o actividades", () => {
    render(<HomeView {...buildLearningDashboard([], [], { enrollments: [], completions: [] })} displayName="Daniel" />);
    expect(screen.getByRole("heading", { name: /Hola, Daniel/ })).toBeInTheDocument();
    expect(screen.getByText(/Todavía no te has matriculado/)).toBeInTheDocument();
    expect(screen.queryByText(/Valentina/)).not.toBeInTheDocument();
    expect(screen.queryByText("Evaluación del Módulo 1")).not.toBeInTheDocument();
  });
});
