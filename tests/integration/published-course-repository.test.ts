// @vitest-environment node
import { createClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPublishedCourse } from "../../backend/src/infrastructure/supabase/content-repository";
import { createSupabaseServerClient } from "../../backend/src/infrastructure/supabase/server";

vi.mock("../../backend/src/infrastructure/supabase/server");

const course = { slug: "python", title: "Python", level: "principiante", description: "Introducción" };
const courseModule = { course_slug: "python", slug: "bases", title: "Bases", position: 1 };
const lesson = {
  course_slug: "python", module_slug: "bases", slug: "variables", title: "Variables", position: 1,
  duration_minutes: 18, intro: "Introducción", content: "Contenido", example_code: "x = 1", tip: "Prueba otro valor",
};

function serveCourse(response: (url: URL) => unknown) {
  const requests: URL[] = [];
  vi.mocked(createSupabaseServerClient).mockResolvedValue(createClient("https://aulaia.example", "test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input) => {
      const url = new URL(String(input));
      requests.push(url);
      return Response.json(response(url));
    } },
  }));
  return requests;
}

describe("lectura del contenido publicado", () => {
  beforeEach(() => vi.resetAllMocks());

  it("recupera el curso, sus módulos y las lecciones en una única consulta", async () => {
    const requests = serveCourse((url) => {
      if (url.pathname.endsWith("/modules")) return [courseModule];
      if (url.pathname.endsWith("/lessons")) return [lesson];
      return [{ ...course, modules: [{ ...courseModule, lessons: [lesson] }] }];
    });

    await expect(getPublishedCourse("python")).resolves.toMatchObject({
      title: "Python",
      modules: [{ title: "Bases", lessons: [{ title: "Variables", durationMinutes: 18, content: "Contenido" }] }],
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].searchParams.get("is_published")).toBe("eq.true");
    expect(requests[0].searchParams.get("slug")).toBe("eq.python");
  });

  it("conserva los módulos sin lecciones y distingue un curso ausente", async () => {
    serveCourse((url) => {
      if (url.pathname.endsWith("/modules")) return [courseModule];
      return url.searchParams.get("slug") === "eq.python"
        ? [{ ...course, modules: [{ ...courseModule, lessons: [] }] }]
        : [];
    });

    await expect(getPublishedCourse("python")).resolves.toMatchObject({ modules: [{ title: "Bases", lessons: [] }] });
    await expect(getPublishedCourse("otro")).resolves.toBeNull();
  });
});
