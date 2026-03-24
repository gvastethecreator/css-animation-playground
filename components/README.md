# Components

This directory contains all the React components that make up the user interface of the CSS 3D Playground. Each component is designed to be modular and focused on a specific piece of functionality.

## Structure

- **Root Components**: Components like `Sidebar.tsx`, `Stage.tsx`, and `Timeline.tsx` are top-level UI sections that compose the main layout.
- **Shared Components**: Smaller, reusable components like `RangeControl.tsx`, `Tooltip.tsx`, and `ControlGroup.tsx` are used throughout the application to build the UI consistently.
- **Stage Elements**: Components prefixed with `Stage` (e.g., `StageCard.tsx`, `StageCube.tsx`) represent the different objects that can be animated on the main stage.
- **Renderer Component**: `ThreeCanvas.tsx` is a special component that encapsulates all the logic for the Three.js/WebGL rendering engine.
- **Sub-directories**: More complex components, like the `Timeline`, have their own sub-directory (`timeline/`) to organize their child components and related logic.
