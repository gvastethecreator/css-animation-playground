# AI Agent Contribution Guidelines

This document gives AI coding agents the context and conventions they need to make changes to the **CSS 3D Playground** without breaking the existing architecture. Follow these guidelines so generated changes match the rest of the codebase.

## 1. Core Mandate

Act as a careful senior frontend engineer. Tasks include adding features, refactoring, and fixing bugs. Responses should be minimal, correct, and consistent with the conventions below.

## 2. Architecture

Before making changes, understand the key patterns:

- **Root component**: `App.tsx` is the orchestrator. It composes the editable state, the timeline, the stage, the export panel, and passes data and callbacks down to children.
- **State management**: no global reducer-based store. State is split across three layers:
  1.  **History-backed document state** in `useHistoryManager` (`hooks/useHistoryManager.ts`). Owns undo/redo, snapshots, and `localStorage` persistence of the editable document (`transforms`, `animationData`, `timelineDuration`, `trackControls`, `engineConfig`, etc.). Any user action that should be undoable must end by going through `commitChanges`.
  2.  **Stage element / media** in `useStageElementManager` (`hooks/useStageElementManager.ts`). Owns the currently selected stage element and the upload/persistence of images, video, and `.glb` / `.gltf` models.
  3.  **Small UI / runtime state** in a Zustand store at `store/useAppStore.ts`. Use it only for ephemeral UI state (panel sizes, gizmo mode, selected engine, scene offsets and zoom helpers). Do **not** use it for document state — that belongs in `useHistoryManager`.
- **Data flow**: unidirectional. State flows down from `App.tsx` as props. Events flow up from children via callbacks.
- **Modular components**: `components/` holds reusable UI pieces. Complex components like the timeline live in their own sub-directory (`components/timeline/`).

## 3. Rules for Generating Code

### 3.1. State and Logic

- Do **not** introduce a new global reducer-based store (Redux, MobX, etc.). The existing Zustand store in `store/useAppStore.ts` covers small UI state; document state goes through `useHistoryManager`.
- Do **not** call `localStorage` directly from a React component. All persistence must go through `useHistoryManager` or `useStageElementManager`.
- For any user action that should be undoable, end the interaction (e.g. on mouse up, on change commit) by calling `commitChanges` (passed down from `App.tsx`).
- Put new, complex, shared logic in a new custom hook under `hooks/`. Example: a theme manager would live in `hooks/useThemeManager.ts`.
- Type definitions used by more than one file go in `types.ts`. Component-specific props interfaces live in the component's file.

### 3.2. Components

- New components live in `components/`.
- Components must be functional components using React Hooks.
- All props must be strictly typed with a TypeScript interface.
- Use `React.memo` on components that are pure and may re-render often with the same props.
- Use Tailwind CSS for styling. Do not introduce CSS-in-JS or new `.css` files.

### 3.3. Quality Gates

- Match the existing OXC tooling: format with `bun run format` (oxfmt) and lint with `bun run lint` (oxlint with `--deny-warnings`).
- Keep tests green: `bun run test` (Vitest + Testing Library + jsdom). Add or update tests when you change behavior.
- Typecheck must pass: `bun run typecheck` (`tsc --noEmit`).
- The build must pass: `bun run build`.

See `docs/code-rules.md` for the full list of coding rules and `docs/architecture.md` for the runtime architecture in more detail.
