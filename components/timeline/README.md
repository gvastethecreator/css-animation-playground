# Timeline components

Timeline UI for the playground.

- **`Timeline.tsx`**: container for keyframes, scrubbing, and track controls. Renders the ruler, tracks, and keyframes.
- **`TimelineRuler.tsx`**: time ruler. Tick marks follow zoom and duration.
- **`TimelineControls.tsx`**: play, pause, loop, duration, FPS, and the global easing editor entry.
- **`EasingEditor.tsx`**: popover to pick a preset easing or open a custom bezier editor for one keyframe.
- **`BezierEditor.tsx`**: cubic-bezier editor used inside `EasingEditor`.
- **`EasingCurve.tsx`**: SVG preview of an easing curve.
- **`CondensedTimelineView.tsx`**: compact summary shown when the main timeline panel is collapsed.
