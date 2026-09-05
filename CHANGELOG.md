# Changelog

All notable changes to **CSS 3D Playground** are documented here. The format
is based on [Keep a Changelog](https://keepachangelog.com/) and the project
adheres to [Semantic Versioning](https://semver.org/) as far as the
application surface allows.

## [Unreleased]

### Added

- Confirm dialog before Reset scene. Media errors show in the header chrome
  instead of `alert`. Engine selector states that CSS and Three.js preview the
  stage while GSAP and Anime.js change export only. Model placeholder can
  switch to Three.js. Keyboard help is a dialog, lists Ctrl on non-Mac, and
  opens with `?`.
- Responsive compact editor layout, reduced-motion handling, and accessible
  names for icon-only camera, timeline, history, and tooltip controls.
- Safe `clean` command and dependency maintenance VS Code tasks.
- Minimal GitHub Actions CI running `typecheck`, `lint`, `test`, and `build`.
- `CONTRIBUTING.md`, `SECURITY.md`, and `CODE_OF_CONDUCT.md`.
- MIT `LICENSE`.
- `tests/codeOutputPanel.test.tsx`: 10 targeted tests for the
  `CodeOutputPanel` code-export branches (CSS keyframes, GSAP timeline,
  anime.js keyframe arrays, three.js pivotGroup output, 3D model warning,
  panel collapse).

### Changed

- Test runner is Vitest 5 (`vp test` / `vite-plus/test`) via pnpm overrides
  while Vite+ 0.3.0 still vendors Vitest 4.1.11.
- `lucide-react` 1.40.0, `@types/node` 26.4.1, `@types/react-dom` 19.2.7.
- `packageManager` pin is `pnpm@12.0.0`.
- All direct dependencies moved to their latest releases, including
  TypeScript 7, Vite+ 0.3.0, Three r185, jsdom 30, and jest-dom 7.0.1.
- Vite, Vitest, Oxlint, and Oxfmt now come from the integrated Vite+
  toolchain; `pnpm-workspace.yaml` keeps Vite core and Vite+ aligned.
- The development server now binds to `127.0.0.1` by default.
- The Node.js requirement is now `>=22.22.2` for the current test stack.
- README and remaining live docs translated to English.
- Header "View source on GitHub" link now points to
  `https://github.com/gvastethecreator/css-animation-playground`.
- `.vscode/settings.json` no longer carries a personal local path.
- `package.json` now declares the project name, description, keywords,
  `repository`, `homepage`, and `bugs` fields for the public repository.
- Anime.js promoted to an officially supported code-export target
  alongside CSS, GSAP, and Three.js. The "legacy" framing in `README.md`
  is dropped; the open scope decision has been removed from
  `TECH-DEBT.md`.
- Cross-cutting operator docs were stripped from the public tree. Live
  docs stay in `docs/` (`README.md`, `USAGE.md`, `DEPENDENCIES.md`,
  `codemap/`). Historical English notes in this changelog remain. Dated
  operator reviews left the tracked tree.

### Fixed

- The Node `--localstorage-file` warning that surfaced once per Vitest
  worker under Node 25 is now suppressed via `NODE_NO_WARNINGS=1` in
  `scripts/run-with-log.mjs` for `test`, `coverage`, `lint`, `lint-fix`,
  and `check` labels. The full Vitest suite runs clean
  (`Test Files 12 passed (12) | Tests 119 passed (119)`).

### Removed

- Operator internals `CONTEXT.md`, `TECH-DEBT.md`, `docs/architecture.md`, `docs/code-rules.md`, `docs/design.md`, `docs/design-system.md`, and `docs/prd.md` from the tracked tree.
- Dated operator reviews and the work log from tracked `docs/` (local archive only).
- Superseded direct Vitest/Oxlint/Oxfmt dependencies and their duplicate
  formatter configuration.
- Obsolete `scripts/run-vp-check.mjs` wrapper.
- `eslint.config.js` (empty stub; project uses OXC `oxlint`/`oxfmt`).
- `metadata.json` (leftover from upstream scaffolding template; unused).
- `.prettierrc` (dead config; referenced a `prettier-plugin-tailwindcss`
  plugin that was not installed; project uses OXC `oxfmt` with
  `.oxfmtrc.json`).
- Personal Windows path and personal GitHub URL from git history via
  `git filter-repo`.
- `TECH-DEBT.md` items 1 (`--localstorage-file` warning) and 2
  (Three.js chunk further optimization); both resolved.

## [0.2.0] - 2026

### Added

- Lazy-loaded Three.js canvas with suspense fallback.
- Track solo/mute controls, multi-keyframe selection, and a condensed
  timeline view.
- `useResourceLoader` and `useThreeSetup` hooks.
- Resource loaders for images, video (`webm`), and `.glb` / `.gltf` models.

### Changed

- Stack upgraded to Bun-first tooling on top of Vite+ / Vite 8, React 19,
  TypeScript 5.8, Tailwind CSS 4, Vitest 4, and OXC (`oxlint`, `oxfmt`).
- `tsconfig.json` switched to `moduleResolution: "bundler"`.
- Source maps disabled in production builds.

### Fixed

- Localstorage polyfill for Node 25+ in `tests/setup.ts`.

## [0.1.0] - Initial prototype

- Interactive stage for CSS 3D transforms.
- Visual sidebar, keyframe timeline, and code export.
