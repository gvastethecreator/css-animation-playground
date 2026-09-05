# Dependency notes

Checked on 2026-09-05. pnpm is the only package manager. `packageManager` is `pnpm@12.0.0`.

`pnpm outdated` reported no remaining in-stack bumps after this pass. `pnpm audit --prod` reported no known vulnerabilities.

## Runtime

| Package              | Version   | Notes                                                                                                                 |
| -------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| `react`, `react-dom` | `19.2.8`  | Client-only app. Patch stays on the current React 19 line.                                                            |
| `three`              | `0.185.1` | WebGL renderer. r185 migration notes: [184 to 185](https://github.com/mrdoob/three.js/wiki/Migration-Guide#184--185). |
| `lucide-react`       | `1.40.0`  | Icon set. Existing imports still compile. [Releases](https://github.com/lucide-icons/lucide/releases)                 |
| `zustand`            | `5.0.15`  | UI-only store.                                                                                                        |
| `gsap`               | `3.15.0`  | Recommended export target.                                                                                            |

## Build and test

| Package                            | Version  | Notes                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite-plus`                        | `0.3.0`  | Bundles Vite, Oxlint, and Oxfmt. Catalog alias keeps `vite` on `@voidzero-dev/vite-plus-core@0.3.0`. Vite+ 0.3.0 still vendors Vitest 4.1.11; this repo overrides `vitest` (and `@vitest/mocker`) to `5.0.0` so `vp test` and `vite-plus/test` resolve Vitest 5. [Release](https://github.com/voidzero-dev/vite-plus/releases/tag/v0.3.0) |
| `vitest`                           | `5.0.0`  | Resolved runner for `pnpm run test` / `vp test`. Official Vitest 5 defaults apply (`clearMocks` on). Do not restore Vitest 4 defaults suite-wide.                                                                                                                                                                                         |
| `typescript`                       | `7.0.2`  | Native TypeScript 7 CLI (`tsc --noEmit`).                                                                                                                                                                                                                                                                                                 |
| `tailwindcss`, `@tailwindcss/vite` | `4.3.3`  | [v4.3.3](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.3)                                                                                                                                                                                                                                                                 |
| `@vitejs/plugin-react`             | `6.1.1`  | Quiet compiler diagnostics by default. This project does not enable the React Compiler. [Release](https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react%406.1.1)                                                                                                                                                          |
| `@testing-library/react`           | `16.3.3` | Patch.                                                                                                                                                                                                                                                                                                                                    |
| `@testing-library/jest-dom`        | `7.0.1`  | Needs Node 22 and a direct `@testing-library/dom` peer.                                                                                                                                                                                                                                                                                   |
| `@testing-library/dom`             | `10.4.1` | Explicit peer for jest-dom v7.                                                                                                                                                                                                                                                                                                            |
| `jsdom`                            | `30.0.1` | Node 22 floor.                                                                                                                                                                                                                                                                                                                            |

## Types

| Package            | Version   |
| ------------------ | --------- |
| `@types/node`      | `26.4.1`  |
| `@types/react`     | `19.2.18` |
| `@types/react-dom` | `19.2.7`  |
| `@types/three`     | `0.185.4` |

Type-only packages: [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/master/types).

## Decisions

- pnpm stays pinned at `12.0.0`.
- Bun is not an operational dependency. Bun lockfiles are ignored.
- Vite+ owns Vite, Oxlint, and Oxfmt. Vitest 5 is forced with pnpm overrides until a Vite+ release ships Vitest 5. Tests still import `vite-plus/test` and run through `vp test`.
- `vitest@5` wants `@vitest/browser-preview@5.0.0`. Vite+ 0.3.0 still installs preview 4.1.11. That peer warning is accepted; there is no second test runner.
- Node `>=22.22.2` is required by jest-dom 7 and jsdom 30.
- React Compiler support in plugin-react 6.1 is unused. Do not enable it without a dedicated pass.
