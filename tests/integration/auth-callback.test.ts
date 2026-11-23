// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const state = vi.hoisted(() => ({ error: null as null | { message: string } }));
vi.mock("../../backend/src/infrastructure/supabase/server", () => ({ createSupabaseServerClient: async () => ({ auth: { exchangeCodeForSession: async () => ({ error: state.error }) } }) }));
import { GET } from "../../frontend/src/app/auth/callback/route";
afterEach(() => { state.error = null; vi.unstubAllEnvs(); });
describe("ConfirmaciÃ³n de correo", () => {
  it("devuelve al inicio sin aceptar una redirecciÃ³n externa", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://aulaia.example");
    const response = await GET(new NextRequest("https://aulaia.example/auth/callback?code=valid-code&next=https://attacker.invalid"));
    expect(response.headers.get("location")).toBe("https://aulaia.example/inicio");
  });
  it("envÃ­a al acceso cuando el enlace no contiene cÃ³digo", async () => {
    const response = await GET(new NextRequest("http://localhost:3000/auth/callback"));
    expect(response.headers.get("location")).toContain("/login?estado=confirmacion_fallida");
  });
  it("no da por confirmada una sesiÃ³n que Supabase rechazÃ³", async () => {
    state.error = { message: "expired" };
    const response = await GET(new NextRequest("http://localhost:3000/auth/callback?code=expired"));
    expect(response.headers.get("location")).toContain("confirmacion_fallida");
  });
});
