# Usage guide

## Product flow

1. Pick the element on the stage.
2. Adjust transforms, filters, and appearance in the sidebar.
3. Add keyframes from the property controls.
4. Edit easing, duration, and playback on the timeline.
5. Preview the result in CSS or Three.js.
6. Export the code from the lower panel.

## Local development

### Install

Node.js `>=22.22.2` and pnpm `>=11.21.0` are required.

```bash
pnpm install
```

### Develop

```bash
pnpm run dev
```

The server binds to `127.0.0.1:3000` by default. Set `VITE_HOST` to opt into
another interface.

### Quick validation

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

## Logs

The main scripts write outputs to `logs/`:

- `typecheck.latest.log`
- `lint.latest.log`
- `test.latest.log`
- `build.latest.log`

Timestamped versions are also kept for local auditing.

## VS Code tasks

The workspace includes short tasks with emoji prefixes for:

- development
- build
- check
- typecheck
- lint
- format
- test
- coverage
- clean
- preview
- dependency install, outdated check, and audit

## Operational notes

- The Three.js engine is loaded on demand.
- 3D models are only visualized correctly in Three.js mode.
- Local persistence saves history, configuration, and selected media.
