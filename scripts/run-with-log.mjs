import { createWriteStream, existsSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const [, , rawLabel, ...commandParts] = process.argv;

if (!rawLabel || commandParts.length === 0) {
  process.stderr.write("Usage: bun run ./scripts/run-with-log.mjs <label> <command>\n");
  process.exit(1);
}

const label = rawLabel.replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
const command = commandParts.join(" ");
const logsDir = path.resolve(process.cwd(), "logs");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logPath = path.join(logsDir, `${label}-${timestamp}.log`);
const latestPath = path.join(logsDir, `${label}.latest.log`);

mkdirSync(logsDir, { recursive: true });

const stream = createWriteStream(logPath, { flags: "a" });

const write = (chunk, target) => {
  const text = chunk.toString();
  target.write(text);
  stream.write(text);
};

stream.write(`[task] ${label}\n`);
stream.write(`[cwd] ${process.cwd()}\n`);
stream.write(`[command] ${command}\n`);
stream.write(`[startedAt] ${new Date().toISOString()}\n\n`);

const child = spawn(command, {
  cwd: process.cwd(),
  env: process.env,
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});

child.stdout.on("data", (chunk) => write(chunk, process.stdout));
child.stderr.on("data", (chunk) => write(chunk, process.stderr));

child.on("close", (code) => {
  stream.write(`\n[finishedAt] ${new Date().toISOString()}\n`);
  stream.write(`[exitCode] ${code ?? 1}\n`);
  stream.end(() => {
    if (existsSync(latestPath)) {
      rmSync(latestPath, { force: true });
    }
    copyFileSync(logPath, latestPath);
    process.exit(code ?? 1);
  });
});
