import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const relativePath of ['dist', 'coverage', 'logs']) {
  const target = path.resolve(projectRoot, relativePath);
  if (!target.startsWith(`${projectRoot}${path.sep}`) || !existsSync(target)) continue;
  rmSync(target, { recursive: true, force: true });
  process.stdout.write(`Removed ${relativePath}\n`);
}
