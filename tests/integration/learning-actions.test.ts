// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { enrollCourseAction, setLessonCompletedAction } from "../../src/app/(learning)/cursos/actions";

const session = vi.hoisted(() => ({ user: { id: "session-owner" } as { id: string } | null, client: null as SupabaseClient | null }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("../../src/infrastructure/supabase/config", () => ({ getSupabaseConfig: () => ({ url: "https://aulaia.example", key: "test-public-key" }) }));
vi.mock("../../src/infrastructure/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: async () => ({ data: { user: session.user }, error: null }) },
    from: session.client!.from.bind(session.client),
  }),
}));

const requests: { url: string; method: string; body: string | undefined }[] = [];
let databaseError = false;
beforeEach(() => {
  requests.length = 0;
  databaseError = false;
  session.user = { id: "session-owner" };
  session.client = createClient("https://aulaia.example", "test-public-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (url, init) => {
      requests.push({ url: String(url), method: init?.method ?? "GET", body: init?.body as string | undefined });
      return databaseError
        ? new Response(JSON.stringify({ code: "42501", message: "Denied" }), { status: 403, headers: { "Content-Type": "application/json" } })
        : new Response(null, { status: 204 });
    } },
  });
});

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("acciones de matrícula y completado", () => {
  it("liga la matrícula al usuario verificado aunque el formulario incluya otro usuario", async () => {
    await expect(enrollCourseAction(form({ courseSlug: "robotica-basica", user_id: "other-user" }))).rejects.toThrow("redirect:/cursos/robotica-basica?estado=matriculado");
    expect(JSON.parse(requests[0].body!)).toMatchObject({ user_id: "session-owner", course_slug: "robotica-basica" });
  });

  it("exige una sesión también cuando se invoca la acción directamente", async () => {
    session.user = null;
    await expect(enrollCourseAction(form({ courseSlug: "robotica-basica" }))).rejects.toThrow("redirect:/login");
    expect(requests).toHaveLength(0);
  });

  it("no escribe ante un estado de completado inválido", async () => {
    await expect(setLessonCompletedAction(form({ courseSlug: "robotica-basica", lessonSlug: "sensores", completed: "cualquier-cosa" }))).rejects.toThrow("redirect:/catalogo");
    expect(requests).toHaveLength(0);
  });

  it("un error de la base nunca devuelve confirmación de guardado", async () => {
    databaseError = true;
    await expect(setLessonCompletedAction(form({ courseSlug: "robotica-basica", lessonSlug: "sensores", completed: "true" }))).rejects.toThrow("redirect:/cursos/robotica-basica/lecciones/sensores?estado=error");
  });

  it("al desmarcar restringe la eliminación al curso, lección y propietario de la sesión", async () => {
    await expect(setLessonCompletedAction(form({ courseSlug: "robotica-basica", lessonSlug: "sensores", completed: "false", user_id: "other-user" }))).rejects.toThrow("estado=guardado");
    const request = requests[0];
    const url = new URL(request.url);
    expect(request.method).toBe("DELETE");
    expect(url.searchParams.get("user_id")).toBe("eq.session-owner");
    expect(url.searchParams.get("course_slug")).toBe("eq.robotica-basica");
    expect(url.searchParams.get("lesson_slug")).toBe("eq.sensores");
  });
});
