# Usage guide

How to run the local editor and the quality scripts.

## Product flow

1. Pick the element on the stage.
2. Adjust transforms, filters, and appearance in the sidebar.
3. Add keyframes from the property controls.
4. Edit easing, duration, and playback on the timeline.
5. Preview the result in CSS or Three.js.
6. Export the code from the lower panel.

## Local development

### Install

Node.js `>=22.22.2` and pnpm `>=12` are required.

```bash
pnpm install
```

### Develop

```bash
pnpm run dev
```

The server binds to `127.0.0.1:3000` by default. Set `VITE_HOST` if the server must listen on another interface.

### Quick validation

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

## Logs

The main scripts write output to `logs/`:

- `typecheck.latest.log`
- `lint.latest.log`
- `test.latest.log`
- `build.latest.log`

Timestamped copies stay on disk for local audit.

## VS Code tasks

`.vscode/tasks.json` lists daily tasks first: Dev, Test, Watch, Lint, Format, Types, Check, Build. Preview, Coverage, Clean, Install, Outdated, and Audit follow.

## Notes

- The Three.js engine loads on demand.
- 3D models visualize correctly only in Three.js mode.
- Local persistence saves history, configuration, and selected media.
