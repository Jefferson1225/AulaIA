import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TutorChat } from "../../frontend/src/presentation/components/TutorChat";
import type { TutorTurn } from "../../backend/src/domain/tutor";

const turn: TutorTurn = { id: "eca30000-0000-4000-8000-000000000011", conversation_id: "eca30000-0000-4000-8000-000000000021", question: "¿Qué es int?", answer: "Es el tipo de los enteros.", status: "succeeded", feedback: null, feedback_comment: null, created_at: "2026-10-26T20:00:00Z", truncated: false };
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); sessionStorage.clear(); });
function openTutor() { fireEvent.click(screen.getByRole("button", { name: "Abrir Tutor IA" })); }
describe("Conversación del tutor", () => {
  it("presenta código legible sin ejecutar HTML ni cargar imágenes del modelo", () => {
    render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" initialTurns={[{ ...turn, answer: '**Entero**\n\n```python\nedad = 24\n```\n\n<script>alert(1)</script>\n\n![externa](https://example.invalid/tracking.png)' }]} />);
    openTutor();
    expect(screen.getByText("Entero").tagName).toBe("STRONG");
    expect(screen.getByText("edad = 24").closest("pre")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
  it("recupera respuestas guardadas y permite valorar su utilidad", async () => {
    vi.stubGlobal("fetch", async () => Response.json({ saved: true }));
    render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" initialTurns={[turn]} />);
    openTutor();
    expect(screen.getByText("Es el tipo de los enteros.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Útil" }));
    await waitFor(() => expect(screen.getByText("Valoración guardada." )).toBeInTheDocument());
  });
  it("conserva la pregunta cuando el servidor rechaza la consulta", async () => {
    vi.stubGlobal("fetch", async () => Response.json({ error: "Presupuesto agotado" }, { status: 429 }));
    render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" />);
    openTutor();
    fireEvent.change(screen.getByLabelText("Pregunta al Tutor IA"), { target: { value: "¿Qué es bool?" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Presupuesto agotado"));
    expect(screen.getByLabelText("Pregunta al Tutor IA")).toHaveValue("¿Qué es bool?");
  });

  it("empieza como botón y abre el chat sin consultar la API", () => {
    vi.stubGlobal("fetch", () => { throw new Error("Abrir el tutor no debe hacer llamadas"); });
    render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" initialTurns={[turn]} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir Tutor IA" })).toHaveAttribute("aria-expanded", "false");
    openTutor();
    expect(screen.getByRole("dialog", { name: "Tutor IA de la lección" })).toBeVisible();
    expect(screen.getByLabelText("Pregunta al Tutor IA")).toHaveFocus();
    expect(screen.getByText("Es el tipo de los enteros.")).toBeVisible();
  });

  it("cierra con Escape, devuelve el foco y conserva el borrador al volver a abrir", () => {
    render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" />);
    openTutor();
    fireEvent.change(screen.getByLabelText("Pregunta al Tutor IA"), { target: { value: "¿Otro ejemplo?" } });
    fireEvent.keyDown(screen.getByLabelText("Pregunta al Tutor IA"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir Tutor IA" })).toHaveFocus();
    openTutor();
    expect(screen.getByLabelText("Pregunta al Tutor IA")).toHaveValue("¿Otro ejemplo?");
    fireEvent.click(screen.getByRole("button", { name: "Minimizar Tutor IA" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("conserva una respuesta que termina de llegar mientras el panel está minimizado", async () => {
    let respond!: (response: Response) => void;
    vi.stubGlobal("fetch", () => new Promise<Response>((resolve) => { respond = resolve; }));
    render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" />);
    openTutor();
    fireEvent.change(screen.getByLabelText("Pregunta al Tutor IA"), { target: { value: "¿Qué es int?" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    fireEvent.click(screen.getByRole("button", { name: "Minimizar Tutor IA" }));
    await act(async () => respond(Response.json({ answer: turn.answer, id: turn.id, conversationId: turn.conversation_id, truncated: false })));
    openTutor();
    expect(screen.getByText("Es el tipo de los enteros.")).toBeVisible();
    expect(screen.getByLabelText("Pregunta al Tutor IA")).toHaveValue("");
  });

  it("muestra una invitación discreta sin abrir el chat ni consultar la IA", () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", () => { throw new Error("El aviso no debe consultar la IA"); });
    render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" />);
    expect(screen.queryByText("¿Necesitas ayuda?")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(25000));
    expect(screen.getByText("¿Necesitas ayuda?")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Descartar ayuda" }));
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.queryByText("¿Necesitas ayuda?")).not.toBeInTheDocument();
  });

  it("no repite la invitación al cambiar de lección durante la misma sesión de estudio", () => {
    vi.useFakeTimers();
    const first = render(<TutorChat courseSlug="python" lessonSlug="variables" lessonTitle="Variables" />);
    act(() => vi.advanceTimersByTime(25000));
    expect(screen.getByText("¿Necesitas ayuda?")).toBeVisible();
    first.unmount();
    render(<TutorChat courseSlug="python" lessonSlug="condicionales" lessonTitle="Condicionales" />);
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.queryByText("¿Necesitas ayuda?")).not.toBeInTheDocument();
  });
});
