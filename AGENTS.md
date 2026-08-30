# Agent rules

Canonical always-on project rules for CSS 3D Playground. Other agent catalogs must point here.

## Stack and workspace

- Keep `packageManager` at `pnpm@12.0.0`. Do not change manager, bundler, or framework without approval.
- Log sink is `logs/` via `scripts/run-with-log.mjs`. Other folders must not collect logs.
- Code map lives at `docs/codemap/`. Agents read `codemap.md` first. Refresh json, md, html, and lock together. Do not hand-edit one artifact.
- Public repository: do not write tickets under tracked `docs/`. Live operator notes belong in `.scratch/`. Never print or commit secrets.

## Core mandate

Act as a careful senior frontend engineer. Add features, refactor, and fix bugs. Keep changes small, typed, and consistent with the rules below.

## Architecture

Load `docs/architecture.md` for runtime ownership and data flow. Load `CONTEXT.md` for timeline, track, and stage-media terms.

- Root component: `App.tsx` orchestrates editable state, timeline, stage, and export. State flows down. Events flow up.
- History-backed document state: `useHistoryManager` (`hooks/useHistoryManager.ts`). Owns undo/redo, snapshots, and `localStorage` for the editable document (`transforms`, `animationData`, `timelineDuration`, `trackControls`, `engineConfig`, and related fields). Any undoable user action must end in `commitChanges`.
- Stage element and media: `useStageElementManager` (`hooks/useStageElementManager.ts`). Owns the selected stage element and upload/persistence of images, video, and `.glb` / `.gltf` models.
- Ephemeral UI and runtime: Zustand at `store/useAppStore.ts` (panel sizes, gizmo mode, selected engine, scene offsets, zoom helpers, playhead). Do not put document state here.
- Reusable UI lives in `components/`. Timeline lives in `components/timeline/`.

## Code rules

Load `docs/code-rules.md` for naming, formatting, and component conventions.

### State and logic

- Do not add a global reducer store (Redux, MobX, and similar). Zustand is UI-only. Document state goes through `useHistoryManager`.
- Do not call `localStorage` from a React component. Persistence goes through `useHistoryManager` or `useStageElementManager`.
- For undoable actions, call `commitChanges` at interaction end (mouse up, change commit).
- Put new shared complex logic in `hooks/`. Shared types go in `types.ts`. Component props stay in the component file.

### Components

- New components live in `components/`.
- Use functional components with React Hooks.
- Type every props object with a TypeScript interface.
- Use `React.memo` on pure components that re-render often with the same props.
- Style with Tailwind CSS. Do not add CSS-in-JS or new `.css` files.

### Quality gates

- Format: `pnpm run format` (oxfmt).
- Lint: `pnpm run lint` (oxlint `--deny-warnings`).
- Tests: `pnpm run test` (Vitest + Testing Library + jsdom). Add or update tests when behavior changes.
- Typecheck: `pnpm run typecheck` (`tsc --noEmit`).
- Build: `pnpm run build`.
