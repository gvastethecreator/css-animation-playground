import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const env = { ...process.env };

if (process.platform === "win32") {
  const binDir = path.resolve(process.cwd(), "node_modules", ".bin");
  const preferredExecutable = path.join(binDir, "tsgolint.exe");
  const fallbackExecutable = path.join(binDir, "tsgolint.cmd");
  const configuredPath = env.OXLINT_TSGOLINT_PATH
    ? path.resolve(process.cwd(), env.OXLINT_TSGOLINT_PATH)
    : null;

  if (!configuredPath || !existsSync(configuredPath)) {
    if (existsSync(preferredExecutable)) {
      env.OXLINT_TSGOLINT_PATH = preferredExecutable;
    } else if (existsSync(fallbackExecutable)) {
      env.OXLINT_TSGOLINT_PATH = fallbackExecutable;
    }
  }
}

const child = spawn("vp", ["check"], {
  cwd: process.cwd(),
  env,
  shell: true,
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
