// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { CatalogView } from "../../src/presentation/views/CatalogView";
import { demoCourseRepository } from "../../src/infrastructure/demo/course-repository";

const categories = [
  { slug: "programacion", name: "Programación", position: 1 },
  { slug: "idiomas", name: "Idiomas", position: 2 },
  { slug: "robotica", name: "Robótica", position: 3 },
];

describe("vista del catálogo", () => {
  it("permite filtrar cursos y recuperar la lista completa", async () => {
    render(<CatalogView courses={await demoCourseRepository.list()} categories={categories} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar cursos" }), { target: { value: "Python" } });
    expect(screen.getByText("Fundamentos de Python")).toBeInTheDocument();
    expect(screen.queryByText("Inglés profesional para negocios")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Categoría" }), { target: { value: "idiomas" } });
    expect(screen.getByText("No encontramos cursos con esos filtros")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByText("Inglés profesional para negocios")).toBeInTheDocument();
  });

  it("muestra y filtra una categoría recibida desde los datos", async () => {
    const courses = await demoCourseRepository.list();
    render(<CatalogView courses={[...courses, { ...courses[0], slug: "robotica-basica", title: "Robótica básica", category: "robotica", categoryLabel: "Robótica", progress: null }]} categories={categories} />);

    expect(screen.getByRole("option", { name: "Robótica" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Categoría" }), { target: { value: "robotica" } });
    expect(screen.getByText("Robótica básica")).toBeInTheDocument();
    expect(screen.queryByText("Fundamentos de Python")).not.toBeInTheDocument();
  });
});
