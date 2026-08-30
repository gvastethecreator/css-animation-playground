# Code map · css-animation-playground

generated: 2026-08-29T18:00:00Z
commit: 8d3b41cd6ea2
scope: .

counts: 13 nodes · 27 edges · 0 flows · 0 unknown

## Modules

- `app` · `App.tsx` · module · App
  callers: index (imports)
  callees: components (imports), external-dependencies (imports), hooks (imports), store (imports), types (imports), utils (imports)
  tests: (none)
  entry: App.tsx:stageElementRef

- `components` · `components` · interface · Components
  callers: app (imports)
  callees: easing (imports), external-dependencies (imports), hooks (imports), types (imports), utils (imports)
  tests: tests/codeOutputPanel.test.tsx, tests/components.render.test.tsx, tests/stageImage.test.tsx
  entry: components/ActivationSwitch.tsx:ActivationSwitchProps

- `easing` · `easing.ts` · module · Easing
  callers: components (imports), utils (imports)
  callees: types (imports), utils (imports)
  tests: tests/easing.test.ts
  entry: easing.ts:NEWTON_ITERATIONS

- `external-dependencies` · `App.tsx` · external · External
  callers: app (imports), components (imports), hooks (imports), index (imports), store (imports), types (imports), utils (imports), vite-config (imports)
  callees: (none)
  tests: (none)
  entry: App.tsx:react

- `global-d` · `global.d.ts` · module · Global.D
  callers: (none)
  callees: (none)
  tests: (none)
  entry: global.d.ts:/// <reference types="vite-plus" />

- `hooks` · `hooks` · module · Hooks
  callers: app (imports), components (imports)
  callees: external-dependencies (imports), store (imports), types (imports), utils (imports)
  tests: tests/useAnimationPlayer.test.ts, tests/useHistoryManager.test.ts, tests/useHotkeys.test.ts, tests/usePreviewAnimator.test.ts, tests/useStageDragHandlers.test.ts
  entry: hooks/useAnimationPlayer.ts:useAnimationPlayer

- `index` · `index.tsx` · module · Index
  callers: (none)
  callees: app (imports), external-dependencies (imports)
  tests: (none)
  entry: index.tsx:rootElement

- `repository` · `package.json` · module · Repository
  callers: (none)
  callees: scripts (calls)
  tests: (none)
  entry: package.json:{

- `scripts` · `scripts` · service · Scripts
  callers: repository (calls)
  callees: (none)
  tests: (none)
  entry: scripts/clean-generated.mjs:projectRoot

- `store` · `store` · database · Store
  callers: app (imports), hooks (imports)
  callees: external-dependencies (imports), types (imports)
  tests: tests/useAppStore.test.ts, tests/useStageViewport.test.ts
  entry: store/useAppStore.ts:UIState

- `types` · `types.ts` · module · Types
  callers: app (imports), components (imports), easing (imports), hooks (imports), store (imports), utils (imports)
  callees: external-dependencies (imports)
  tests: tests/animationEditing.test.ts, tests/animationSampling.test.ts, tests/codeOutputPanel.test.tsx, tests/stageImage.test.tsx, tests/styleUtils.test.ts
  entry: types.ts:TransformState

- `utils` · `utils` · module · Utils
  callers: app (imports), components (imports), easing (imports), hooks (imports)
  callees: easing (imports), external-dependencies (imports), types (imports)
  tests: tests/animationEditing.test.ts, tests/animationSampling.test.ts, tests/mathUtils.test.ts, tests/stageMedia.test.ts, tests/styleUtils.test.ts
  entry: utils/animationEditing.ts:toggleKeyframe

- `vite-config` · `vite.config.ts` · module · Vite.Config
  callers: (none)
  callees: external-dependencies (imports)
  tests: (none)
  entry: vite.config.ts:rootDir

## Edges

- app -> components · imports
- app -> external-dependencies · imports
- app -> hooks · imports
- app -> store · imports
- app -> types · imports
- app -> utils · imports
- components -> easing · imports
- components -> external-dependencies · imports
- components -> hooks · imports
- components -> types · imports
- components -> utils · imports
- easing -> types · imports
- easing -> utils · imports
- hooks -> external-dependencies · imports
- hooks -> store · imports
- hooks -> types · imports
- hooks -> utils · imports
- index -> app · imports
- index -> external-dependencies · imports
- repository -> scripts · calls
- store -> external-dependencies · imports
- store -> types · imports
- types -> external-dependencies · imports
- utils -> easing · imports
- utils -> external-dependencies · imports
- utils -> types · imports
- vite-config -> external-dependencies · imports

## Unknown

- none

## Flows

- none
