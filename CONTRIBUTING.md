# Contributing

Thanks for your interest in the **CSS 3D Playground**! This project welcomes
bug reports, fixes, and small features that match the existing scope.

## Project layout

- `App.tsx` orchestrates state and wires the main UI sections.
- `components/` holds React UI pieces; `components/timeline/` is its own
  sub-tree for the timeline.
- `hooks/` is where shared stateful logic lives (history, stage element,
  animation player, etc.).
- `store/` keeps small, UI-only state in a Zustand store.
- `tests/` runs with Vitest + Testing Library + jsdom.
- `docs/` holds project documentation beyond the top-level README.
- `architecture.md` and `code-rules.md` describe the contract for new code.

## Local setup

Requirements: Bun `>= 1.3.11`, Node.js `>= 20` for auxiliary tooling.

```bash
bun install
bun run dev
```

## Validation

Before opening a pull request, please run the full set locally:

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

`bun run check` runs the integrated Vite+ check. The `typecheck`, `lint`,
`test`, `coverage`, `clean`, and `build` scripts also write timestamped logs
to `logs/` (already gitignored). If a command fails, the matching
`*.latest.log` shows the last output for quick triage.

## Coding rules

- Follow `code-rules.md`. Highlights:
  - TypeScript strict mode, no `any` without a justification comment.
  - Functional components only; props are typed with a dedicated interface.
  - `React.memo` for components that re-render often with stable props.
  - Tailwind for styling. No new CSS-in-JS or `.css` files.
- Keep persistence (`localStorage`) inside the existing history/stage hooks;
  do not call `localStorage` directly from new components.
- Mark long-running actions as undoable by going through `commitChanges` from
  `useHistoryManager` (passed down from `App.tsx`).

## Commit messages

This project uses **Conventional Commits** in English. Common scopes:
`feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `build`, `ci`,
`security`. Example:

```
feat(timeline): add multi-select drag box
```

Do **not** mention publication status or external hosting in commit messages.

## Pull requests

- One focused change per PR.
- Include or update tests for behavior changes.
- Update `docs/` or the top-level `README.md` if the user-facing surface
  changes.
- Link to any issue or discussion the PR closes.

## Reporting issues

Use the GitHub issue tracker. For security-relevant reports, follow
`SECURITY.md`.
