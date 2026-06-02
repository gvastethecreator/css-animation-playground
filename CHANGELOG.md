# Changelog

All notable changes to **CSS 3D Playground** are documented here. The format
is based on [Keep a Changelog](https://keepachangelog.com/) and the project
adheres to [Semantic Versioning](https://semver.org/) as far as the
application surface allows.

## [Unreleased]

### Added

- Minimal GitHub Actions CI running `typecheck`, `lint`, `test`, and `build`.
- `CONTRIBUTING.md`, `SECURITY.md`, and `CODE_OF_CONDUCT.md`.
- MIT `LICENSE`.

### Changed

- README and `architecture.md` translated to English.
- Header "View source on GitHub" link now points to
  `https://github.com/gvastethecreator/css-animation-playground`.
- `.vscode/settings.json` no longer carries a personal local path.
- `package.json` now declares the project name, description, keywords,
  `repository`, `homepage`, and `bugs` fields for the public repository.

### Removed

- `eslint.config.js` (empty stub; project uses OXC `oxlint`/`oxfmt`).
- `metadata.json` (leftover from upstream scaffolding template; unused).
- Personal Windows path and personal GitHub URL from git history via
  `git filter-repo`.

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
