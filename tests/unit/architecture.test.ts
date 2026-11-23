// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = process.cwd();
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}
const sources = new Map([...files(resolve(root, "frontend/src")), ...files(resolve(root, "backend/src"))]
  .map((path) => [path, ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true)]));

function directive(source: ts.SourceFile, value: string) {
  return source.statements.some((s) => ts.isExpressionStatement(s) && ts.isStringLiteral(s.expression) && s.expression.text === value);
}
function imports(source: ts.SourceFile, runtimeOnly = false) {
  return source.statements.flatMap((s) => {
    if (!ts.isImportDeclaration(s) || !ts.isStringLiteral(s.moduleSpecifier)) return [];
    if (runtimeOnly && s.importClause?.isTypeOnly) return [];
    const bindings = s.importClause?.namedBindings;
    if (runtimeOnly && !s.importClause?.name && bindings && ts.isNamedImports(bindings) && bindings.elements.every((e) => e.isTypeOnly)) return [];
    return [s.moduleSpecifier.text];
  });
}
function localTarget(from: string, name: string) {
  const base = name.startsWith("@aulaia/backend/") ? resolve(root, "backend/src", name.slice("@aulaia/backend/".length))
    : name.startsWith(".") ? resolve(dirname(from), name) : null;
  return base && [base, `${base}.ts`, `${base}.tsx`].find((p) => sources.has(p));
}

describe("Límites de arquitectura", () => {
  it("mantiene dominio y lógica de negocio sin dependencias de infraestructura ni del framework", () => {
    const violations: string[] = [];
    for (const [path, source] of sources) {
      if (!/[\\/]backend[\\/]src[\\/](application|domain)[\\/]/.test(path)) continue;
      for (const name of imports(source)) {
        if (/supabase|deepseek|infrastructure|^next(?:\/|$)|^react(?:\/|$)/.test(name)) violations.push(`${relative(root, path)} -> ${name}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("impide que un componente de navegador alcance datos, claves o adaptadores del servidor", () => {
    const violations: string[] = [];
    const visited = new Set<string>();
    function visit(path: string) {
      if (visited.has(path)) return;
      visited.add(path);
      const source = sources.get(path)!;
      if (directive(source, "use server")) return;
      if (imports(source).includes("server-only") || /[\\/]backend[\\/]src[\\/](infrastructure|interfaces)[\\/]/.test(path)) {
        violations.push(relative(root, path)); return;
      }
      for (const name of imports(source, true)) {
        if (/^@supabase\//.test(name)) violations.push(`${relative(root, path)} -> ${name}`);
        const target = localTarget(path, name);
        if (target) visit(target);
      }
    }
    for (const [path, source] of sources) if (directive(source, "use client")) visit(path);
    expect(violations).toEqual([]);
  });

  it("mantiene el adaptador DeepSeek sin dependencias de base de datos ni herramientas SQL", () => {
    const source = sources.get(resolve(root, "backend/src/infrastructure/deepseek/tutor.ts"))!;
    expect(imports(source).filter((name) => name !== "server-only" && !name.includes("domain/"))).toEqual([]);
  });
});
