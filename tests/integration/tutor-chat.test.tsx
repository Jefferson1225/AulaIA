import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TutorChat } from "../../src/presentation/components/TutorChat";
import type { TutorTurn } from "../../src/domain/tutor";

const turn: TutorTurn = { id: "eca30000-0000-4000-8000-000000000011", conversation_id: "eca30000-0000-4000-8000-000000000021", question: "¿Qué es int?", answer: "Es el tipo de los enteros.", status: "succeeded", feedback: null, feedback_comment: null, created_at: "2026-10-26T20:00:00Z", truncated: false };
afterEach(() => vi.unstubAllGlobals());
describe("Conversación del tutor", () => {
  it("presenta código legible sin ejecutar HTML ni cargar imágenes del modelo", () => {
    render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" initialTurns={[{ ...turn, answer: '**Entero**\n\n```python\nedad = 24\n```\n\n<script>alert(1)</script>\n\n![externa](https://example.invalid/tracking.png)' }]} />);
    expect(screen.getByText("Entero").tagName).toBe("STRONG");
    expect(screen.getByText("edad = 24").closest("pre")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
  it("recupera respuestas guardadas y permite valorar su utilidad", async () => {
    vi.stubGlobal("fetch", async () => Response.json({ saved: true }));
    render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" initialTurns={[turn]} />);
    expect(screen.getByText("Es el tipo de los enteros.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Útil" }));
    await waitFor(() => expect(screen.getByText("Valoración guardada." )).toBeInTheDocument());
  });
  it("conserva la pregunta cuando el servidor rechaza la consulta", async () => {
    vi.stubGlobal("fetch", async () => Response.json({ error: "Presupuesto agotado" }, { status: 429 }));
    render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" />);
    fireEvent.change(screen.getByLabelText("Pregunta al Tutor IA"), { target: { value: "¿Qué es bool?" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Presupuesto agotado"));
    expect(screen.getByLabelText("Pregunta al Tutor IA")).toHaveValue("¿Qué es bool?");
  });
});
