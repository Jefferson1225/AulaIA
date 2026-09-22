// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { LoginView } from "../../src/presentation/views/LoginView";
import { LessonView } from "../../src/presentation/views/LessonView";
import { demoCourseRepository } from "../../src/infrastructure/demo/course-repository";

describe("vistas de ejemplo", () => {
  it("ofrece acceso claro a la demostración sin simular autenticación", () => {
    render(<LoginView />);

    expect(screen.getByRole("link", { name: "Entrar como estudiante" })).toHaveAttribute("href", "/inicio");
    expect(screen.getByText(/autenticación con Supabase se incorporará/)).toBeInTheDocument();
  });

  it("muestra el contenido académico y distingue el Tutor IA de demostración", async () => {
    const lesson = await demoCourseRepository.findLesson("fundamentos-python", "variables-y-tipos");
    if (!lesson) throw new Error("Falta la lección de ejemplo");

    render(<LessonView lesson={lesson} />);

    expect(screen.getByRole("heading", { name: "Variables y tipos de datos" })).toBeInTheDocument();
    expect(screen.getByText(/nombre = "Valentina"/)).toBeInTheDocument();
    expect(screen.getByText(/Tutor IA · Vista previa/)).toBeInTheDocument();
  });
});
