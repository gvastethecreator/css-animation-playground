# Contributing

This project welcomes bug reports, fixes, and small features that match the existing scope.

## Project layout

- `App.tsx` orchestrates state and the main UI sections.
- `components/` holds React UI. `components/timeline/` is the timeline subtree.
- `hooks/` holds shared stateful logic (history, stage element, animation player).
- `store/` keeps small, UI-only state in Zustand.
- `tests/` runs with Vitest + Testing Library + jsdom.
- `docs/` holds project documentation beyond the root README.
- `docs/architecture.md` and `docs/code-rules.md` describe the contract for new code.
- `CONTEXT.md` defines timeline, track, and stage-media terms.

## Local setup

Requirements: pnpm `>=12` and Node.js `>= 22.22.2`.

```bash
pnpm install
pnpm run dev
```

## Validation

Before you open a pull request, run:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

`pnpm run check` runs the integrated Vite+ check. The `typecheck`, `lint`, `test`, `coverage`, `clean`, and `build` scripts also write timestamped logs to `logs/` (gitignored). If a command fails, the matching `*.latest.log` shows the last output.

## Coding rules

Follow `docs/code-rules.md`. Highlights:

- TypeScript strict mode. No `any` without a justification comment.
- Functional components only. Type props with a dedicated interface.
- `React.memo` for components that re-render often with stable props.
- Tailwind for styling. No new CSS-in-JS or `.css` files.
- Keep persistence (`localStorage`) inside the history and stage hooks. Do not call `localStorage` from new components.
- Mark long-running actions as undoable by calling `commitChanges` from `useHistoryManager` (passed down from `App.tsx`).

## Commit messages

This project uses **Conventional Commits** in English. Common types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `build`, `ci`, `security`. Example:

```
feat(timeline): add multi-select drag box
```

Do not mention publication status or external hosting in commit messages.

## Pull requests

- One focused change per PR.
- Include or update tests for behavior changes.
- Update `docs/` or the root `README.md` if the user-facing surface changes.
- Link any issue or discussion the PR closes.

## Reporting issues

Use the GitHub issue tracker. For security-relevant reports, follow `SECURITY.md`.
