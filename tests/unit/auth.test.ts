import { describe, expect, it } from "vitest";
import { resolveLoginEmail, validateLogin, validateRegistration } from "../../src/application/auth";

describe("validación de acceso", () => {
  it("resuelve solo los usuarios de demostración sin alterar correos personales", () => {
    expect(resolveLoginEmail(" Alumno1 ")).toBe("alumno1@demo.aulaia.test");
    expect(resolveLoginEmail("profesor1")).toBe("profesor1@demo.aulaia.test");
    expect(resolveLoginEmail("persona@ejemplo.com")).toBe("persona@ejemplo.com");
    expect(validateLogin(resolveLoginEmail("administrador-inventado"), "clave")).not.toBeNull();
  });
  it("rechaza credenciales incompletas antes de llamar a Supabase", () => {
    expect(validateLogin("correo-invalido", "123")).toBe("Ingresa un correo válido.");
    expect(validateLogin("persona@ejemplo.com", "")).toBe("Ingresa tu contraseña.");
    expect(validateLogin("persona@ejemplo.com", "clave-segura")).toBeNull();
  });

  it("exige nombre y contraseña suficiente al crear una cuenta", () => {
    expect(validateRegistration("", "persona@ejemplo.com", "12345678")).toBe("Ingresa tu nombre.");
    expect(validateRegistration("Ana", "persona@ejemplo.com", "1234567")).toBe("Usa una contraseña de al menos 8 caracteres.");
    expect(validateRegistration("Ana", "persona@ejemplo.com", "12345678")).toBeNull();
  });
});
