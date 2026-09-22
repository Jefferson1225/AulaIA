// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { CatalogView } from "../../src/presentation/views/CatalogView";
import { demoCourseRepository } from "../../src/infrastructure/demo/course-repository";

describe("vista del catálogo", () => {
  it("permite filtrar cursos y recuperar la lista completa", async () => {
    render(<CatalogView courses={await demoCourseRepository.list()} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar cursos" }), { target: { value: "Python" } });
    expect(screen.getByText("Fundamentos de Python")).toBeInTheDocument();
    expect(screen.queryByText("Inglés profesional para negocios")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Categoría" }), { target: { value: "idiomas" } });
    expect(screen.getByText("No encontramos cursos con esos filtros")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByText("Inglés profesional para negocios")).toBeInTheDocument();
  });
});
