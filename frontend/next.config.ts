import type { NextConfig } from "next";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const repositoryRoot = resolve(__dirname, "..");
// Next.js ya procesó el entorno de frontend. Lee también el archivo privado del workspace.
const workspaceEnv = resolve(repositoryRoot, ".env.local");
if (existsSync(workspaceEnv)) process.loadEnvFile(workspaceEnv);

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  transpilePackages: ["@aulaia/backend"],
  outputFileTracingRoot: repositoryRoot,
  turbopack: { root: repositoryRoot },
};

export default nextConfig;
