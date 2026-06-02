# CSS 3D Playground

An interactive playground to design, preview, and export 3D animations from a
visual editor with a live timeline, dual rendering engines (CSS and Three.js),
and code export for popular animation libraries.

The project is built on a **Bun-first** toolchain: **Vite+ on Vite 8**,
**React 19 + TypeScript**, **Tailwind CSS 4**, **Vitest 4**, **OXC**
(`oxlint` + `oxfmt`), and recommends **GSAP** as the primary export /
animation target.

## Features

- **Dual rendering**: edit and preview with the **CSS** engine or the
  **Three.js** engine, on the same state.
- **Visual timeline** with keyframes, multi-select, scrubbing, and per-track
  easing controls.
- **Transform controls** for perspective, translate, rotate, scale, skew,
  filters, and appearance.
- **Local persistence** of the document and undo/redo history with
  automatic session restore.
- **Media support**: image, video (`.webm`), and `.glb` / `.gltf` 3D models.
- **Code export** to CSS, GSAP, Anime.js, and Three.js.
- **Tokenized design system** in Tailwind for consistent visual utilities.
- **Automated quality gates**: typecheck, lint, test, build, and local
  log files.

## Stack

| Layer                     | Tool                                                        |
| ------------------------- | ----------------------------------------------------------- |
| Runtime                   | React 19 + TypeScript                                       |
| Dev / build               | Vite+ on Vite 8                                             |
| Styling                   | Tailwind CSS 4                                              |
| UI state                  | Zustand 5 (small, UI-only state)                            |
| History / persistence     | Local hooks (`useHistoryManager`, `useStageElementManager`) |
| 3D                        | Three.js                                                    |
| Recommended animation lib | GSAP                                                        |
| Tests                     | Vitest 4 + Testing Library + jsdom                          |
| Lint / format             | OXC (`oxlint`, `oxfmt`)                                     |
| Package manager           | Bun                                                         |

## Quick start

### Requirements

- **Bun** `>= 1.3.11`
- **Node.js** `>= 20` for auxiliary tooling

### Install

```bash
bun install
```

### Develop

```bash
bun run dev
```

The local server defaults to `http://localhost:3000`.

## Scripts

The most important scripts are listed below. Several of them also write
timestamped logs to `logs/` via `scripts/run-with-log.mjs`.

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `bun run dev`           | Start the dev server with Vite+          |
| `bun run check`         | Run the integrated Vite+ checks          |
| `bun run typecheck`     | Run `tsc --noEmit`                       |
| `bun run lint`          | Run `oxlint --deny-warnings`             |
| `bun run lint:fix`      | Auto-fix lint issues with OXC            |
| `bun run format`        | Format the project with `oxfmt`          |
| `bun run format:check`  | Verify formatting without writing        |
| `bun run test`          | Run the Vitest suite                     |
| `bun run test:watch`    | Run the suite in watch mode              |
| `bun run test:coverage` | Generate coverage reports in `coverage/` |
| `bun run build`         | Build for production into `dist/`        |
| `bun run preview`       | Preview the local production build       |
| `bun run clean`         | Remove `dist/`, `coverage/`, and `logs/` |

## Usage flow

1. **Pick the stage element**: card, cube, text, image, or model.
2. **Adjust transforms and styles** from the sidebar.
3. **Add keyframes** with the diamond button next to each property.
4. **Edit easing and time** directly on the timeline.
5. **Preview the result** with scrub, play/pause, and loop.
6. **Export the code** from the lower panel for the selected engine.

## Documentation

- `architecture.md`: architecture, data flow, and responsibilities.
- `code-rules.md`: coding standards and contribution rules.
- `design.md`: UX and interaction patterns.
- `design-system.md`: visual tokens and component base styles.
- `prd.md`: product requirements and roadmap.
- `docs/README.md`: index of project documentation.
- `docs/USAGE.md`: operational guide for the local environment.
- `docs/WORKLOG.md`: changes from the most recent modernization pass.
- `TECH-DEBT.md`: prioritized technical debt and follow-ups.
- `CONTRIBUTING.md`: how to contribute.
- `CHANGELOG.md`: release notes.
- `SECURITY.md`: how to report vulnerabilities.

## License

[MIT](./LICENSE).
