import { createWriteStream, existsSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const [, , rawLabel, ...commandParts] = process.argv;

if (!rawLabel || commandParts.length === 0) {
  process.stderr.write('Usage: node ./scripts/run-with-log.mjs <label> <command>\n');
  process.exit(1);
}

const label = rawLabel.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
const command = commandParts.join(' ');
const logsDir = path.resolve(process.cwd(), 'logs');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = path.join(logsDir, `${label}-${timestamp}.log`);
const latestPath = path.join(logsDir, `${label}.latest.log`);

mkdirSync(logsDir, { recursive: true });

const stream = createWriteStream(logPath, { flags: 'a' });

const write = (chunk, target) => {
  const text = chunk.toString();
  target.write(text);
  stream.write(text);
};

stream.write(`[task] ${label}\n`);
stream.write(`[cwd] ${process.cwd()}\n`);
stream.write(`[command] ${command}\n`);
stream.write(`[startedAt] ${new Date().toISOString()}\n\n`);

// Silence Node 25's process warnings when this script spawns node
// workers (e.g. `vp test` uses a forks pool and triggers a noisy
// `--localstorage-file was provided without a valid path` warning).
// The warning is harmless — the workers never read localStorage —
// so suppressing it in test/lint/check scripts is preferable to
// threading a valid path through vitest's worker config.
const childEnv = { ...process.env };
if (/^(test|coverage|lint|lint-fix|check)$/i.test(label)) {
  childEnv.NODE_NO_WARNINGS = childEnv.NODE_NO_WARNINGS ?? '1';
}

const child = spawn(command, {
  cwd: process.cwd(),
  env: childEnv,
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

child.stdout.on('data', (chunk) => write(chunk, process.stdout));
child.stderr.on('data', (chunk) => write(chunk, process.stderr));

child.on('close', (code) => {
  stream.write(`\n[finishedAt] ${new Date().toISOString()}\n`);
  stream.write(`[exitCode] ${code ?? 1}\n`);
  stream.end(() => {
    try {
      if (existsSync(latestPath)) {
        rmSync(latestPath, { force: true });
      }
      copyFileSync(logPath, latestPath);
    } catch {
      // The wrapped command may have removed `logs/` (e.g. `pnpm run
      // clean`). The per-run log is already on disk; only the
      // `latest.log` shortcut is missing, which is not a failure.
    }
    process.exit(code ?? 1);
  });
});
