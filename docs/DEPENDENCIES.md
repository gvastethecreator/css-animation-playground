# Dependency review

Reviewed on 2026-08-14. pnpm is the only package manager for this project.
`pnpm outdated --format json` returned `{}` after the upgrade.

## Updated runtime packages

| Package              |      From |        To | Changelog result and project impact                                                                                                                                                                                                                                                  |
| -------------------- | --------: | --------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `react`, `react-dom` |  `19.2.6` |  `19.2.8` | The patch improves React Server Component decoding. This app is client-only, so the update is low risk and keeps the React line current. [Release](https://github.com/react/react/releases/tag/v19.2.8)                                                                              |
| `three`              | `0.184.0` | `0.185.1` | r185 changes WebGPU alpha, loaders, AO, matrix updates, and several deprecated APIs. The project uses WebGL and none of the removed APIs; both rendering modes were exercised in a real browser. [Migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide#184--185) |
| `lucide-react`       |  `1.17.0` |  `1.31.0` | The current line adds and refines icons. Existing imports still compile and render. [Releases](https://github.com/lucide-icons/lucide/releases)                                                                                                                                      |
| `zustand`            |  `5.0.14` |  `5.0.15` | Patch-level state-store fixes; the project keeps Zustand limited to ephemeral UI state. [Releases](https://github.com/pmndrs/zustand/releases)                                                                                                                                       |

## Updated build and test packages

| Package                            |       From |                 To | Changelog result and project impact                                                                                                                                                                                                                                                                |
| ---------------------------------- | ---------: | -----------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite-plus`                        |   `0.1.23` |            `0.2.9` | The 0.2 line bundles the supported Vite, Vitest, Oxlint, and Oxfmt versions. The project was migrated with `vp migrate`; direct duplicate tool packages were removed. [Release](https://github.com/voidzero-dev/vite-plus/releases/tag/v0.2.9)                                                     |
| `vite`                             |    `8.0.8` | Vite+ core `0.2.9` | `vite` is a workspace catalog alias to `@voidzero-dev/vite-plus-core`, keeping the build and Vite+ command surface on the same release.                                                                                                                                                            |
| `typescript`                       |    `6.0.3` |            `7.0.2` | TypeScript 7 is the native compiler, introduces stricter defaults, and has no stable programmatic API yet. This project invokes `tsc` as a CLI, so it can use the native compiler without a compatibility package. [Release](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) |
| `tailwindcss`, `@tailwindcss/vite` |    `4.3.0` |            `4.3.3` | Patch releases fix Vite reload behavior, source scanning, Firefox focus-visible handling, Windows/Node 26 behavior, and CSS generation edge cases. [Releases](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.3)                                                                     |
| `@vitejs/plugin-react`             |    `6.0.1` |            `6.0.5` | The latest patch restores linear React Compiler preset filtering and avoids the regression introduced by the earlier filter. [Release](https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react%406.0.5)                                                                              |
| `@testing-library/jest-dom`        |    `6.9.1` |            `7.0.1` | v7 requires Node 22 and a direct `@testing-library/dom` peer. The peer is explicit and the project engine floor is `22.22.2`. [Releases](https://github.com/testing-library/jest-dom/releases)                                                                                                     |
| `@testing-library/dom`             | transitive |    `10.4.1` direct | Added as the required jest-dom v7 peer. The installed version is shared with `@testing-library/react`. [Releases](https://github.com/testing-library/dom-testing-library/releases)                                                                                                                 |
| `jsdom`                            |   `29.0.2` |           `30.0.1` | v30 raises the Node floor, adds CSS APIs, and fixes CSS computed-style behavior; v30.0.1 repairs `calc()` handling and improves large range operations. [Releases](https://github.com/jsdom/jsdom/releases/tag/30.0.1)                                                                             |

## Updated type packages

| Package            |      From |        To | Impact                                                                         |
| ------------------ | --------: | --------: | ------------------------------------------------------------------------------ |
| `@types/node`      |  `25.6.0` |  `26.2.0` | Aligns development types with Node 26. No runtime code is shipped.             |
| `@types/react`     | `19.2.15` | `19.2.18` | Patch type corrections; the full typecheck passes.                             |
| `@types/react-dom` |  `19.2.3` |  `19.2.4` | Patch type corrections; the full typecheck passes.                             |
| `@types/three`     | `0.184.1` | `0.185.4` | Types now match Three r185. The Three.js renderer and loaders compile and run. |

Type-only package changes are maintained in the
[DefinitelyTyped repository](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/master/types).

## Migration decisions

- pnpm `11.21.0` remains pinned in `packageManager`.
- Bun is not an operational dependency. Bun lockfiles are ignored and no Bun
  command remains in active scripts or documentation.
- Vite+ owns its bundled Vite, Vitest, Oxlint, and Oxfmt versions. Keeping
  direct copies would create duplicate binaries and version drift.
- Node `>=22.22.2` is now required because jest-dom 7 and jsdom 30 no longer
  support the previous Node 20 floor.
