# Components

React UI for CSS 3D Playground. Each file has one job.

## Structure

- **Root sections**: `Sidebar.tsx`, `Stage.tsx`, and `Timeline.tsx` compose the main layout.
- **Shared controls**: `RangeControl.tsx`, `Tooltip.tsx`, and `ControlGroup.tsx` repeat across the editor.
- **Stage elements**: `Stage*` files (`StageCard.tsx`, `StageCube.tsx`) are the objects on the stage.
- **Renderer**: `ThreeCanvas.tsx` owns the Three.js / WebGL engine.
- **Subtrees**: large features live in a directory. Timeline lives in `timeline/`.
