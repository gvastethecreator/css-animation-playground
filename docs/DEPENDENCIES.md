# Dependency notes

Checked on 2026-08-29. pnpm is the only package manager. `packageManager` is `pnpm@12.0.0`.

`pnpm outdated` was empty after this pass. `pnpm audit --prod` reported no known vulnerabilities.

## Runtime

| Package              | Version   | Notes                                                                                                                 |
| -------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| `react`, `react-dom` | `19.2.8`  | Client-only app. Patch stays on the current React 19 line.                                                            |
| `three`              | `0.185.1` | WebGL renderer. r185 migration notes: [184 to 185](https://github.com/mrdoob/three.js/wiki/Migration-Guide#184--185). |
| `lucide-react`       | `1.35.0`  | Icon set. Existing imports still compile. [Releases](https://github.com/lucide-icons/lucide/releases)                 |
| `zustand`            | `5.0.15`  | UI-only store.                                                                                                        |
| `gsap`               | `3.15.0`  | Recommended export target.                                                                                            |

## Build and test

| Package                            | Version  | Notes                                                                                                                                                                                                                                                                    |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `vite-plus`                        | `0.3.0`  | Bundles Vite, Vitest, Oxlint, and Oxfmt. Catalog alias keeps `vite` on `@voidzero-dev/vite-plus-core@0.3.0`. Global install layout change in 0.3.0 does not move existing `~/.vite-plus` trees. [Release](https://github.com/voidzero-dev/vite-plus/releases/tag/v0.3.0) |
| `typescript`                       | `7.0.2`  | Native TypeScript 7 CLI (`tsc --noEmit`).                                                                                                                                                                                                                                |
| `tailwindcss`, `@tailwindcss/vite` | `4.3.3`  | [v4.3.3](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.3)                                                                                                                                                                                                |
| `@vitejs/plugin-react`             | `6.1.1`  | Quiet compiler diagnostics by default. This project does not enable the React Compiler. [Release](https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react%406.1.1)                                                                                         |
| `@testing-library/react`           | `16.3.3` | Patch.                                                                                                                                                                                                                                                                   |
| `@testing-library/jest-dom`        | `7.0.1`  | Needs Node 22 and a direct `@testing-library/dom` peer.                                                                                                                                                                                                                  |
| `@testing-library/dom`             | `10.4.1` | Explicit peer for jest-dom v7.                                                                                                                                                                                                                                           |
| `jsdom`                            | `30.0.1` | Node 22 floor.                                                                                                                                                                                                                                                           |

## Types

| Package            | Version   |
| ------------------ | --------- |
| `@types/node`      | `26.4.0`  |
| `@types/react`     | `19.2.18` |
| `@types/react-dom` | `19.2.5`  |
| `@types/three`     | `0.185.4` |

Type-only packages: [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/master/types).

## Decisions

- pnpm stays pinned at `12.0.0`.
- Bun is not an operational dependency. Bun lockfiles are ignored.
- Vite+ owns Vite, Vitest, Oxlint, and Oxfmt. Direct copies of those tools would drift.
- Node `>=22.22.2` is required by jest-dom 7 and jsdom 30.
- React Compiler support in plugin-react 6.1 is unused. Do not enable it without a dedicated pass.
