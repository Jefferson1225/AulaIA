// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { LoginView } from "../../frontend/src/presentation/views/LoginView";
import { LessonView } from "../../frontend/src/presentation/views/LessonView";
import { demoCourseRepository } from "../../backend/src/infrastructure/demo/course-repository";

describe("vistas de ejemplo", () => {
  it("muestra un formulario de acceso y la demostración solo cuando Supabase no está configurado", () => {
    render(<LoginView configured={false} demoAvailable={true} />);

    expect(screen.getByRole("textbox", { name: "Correo electrónico o usuario" })).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explorar demostración" })).toHaveAttribute("href", "/inicio");
  });

  it("muestra el contenido académico y distingue el Tutor IA de demostración", async () => {
    const lesson = await demoCourseRepository.findLesson("fundamentos-python", "variables-y-tipos");
    if (!lesson) throw new Error("Falta la lección de ejemplo");

    render(<LessonView lesson={lesson} />);

    expect(screen.getByRole("heading", { name: "Variables y tipos de datos" })).toBeInTheDocument();
    expect(screen.getByText(/nombre = "Valentina"/)).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Abrir Tutor IA" }));
    expect(screen.getByText(/Tutor IA · Vista previa/)).toBeVisible();
  });

  it("usa el nombre y la navegación de una lección gestionada", async () => {
    const sample = await demoCourseRepository.findLesson("fundamentos-python", "variables-y-tipos");
    if (!sample) throw new Error("Falta la lección de prueba");
    render(<LessonView lesson={{
      ...sample,
      courseSlug: "robotica-basica",
      courseTitle: "Robótica básica",
      courseLevel: "intermedio",
      moduleTitle: "Sensores",
      moduleLessons: [{ slug: "variables-y-tipos", title: sample.title, durationMinutes: 18 }],
    }} />);

    expect(screen.getAllByRole("link", { name: "Volver al curso" })[0]).toHaveAttribute("href", "/cursos/robotica-basica");
    expect(screen.getByRole("link", { name: /Robótica básica/ })).toHaveAttribute("href", "/cursos/robotica-basica");
    expect(screen.getByText("intermedio")).toBeInTheDocument();
  });
});
