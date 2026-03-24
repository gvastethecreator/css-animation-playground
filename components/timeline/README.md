# Timeline Components

This directory contains all the components related to the animation timeline feature of the CSS 3D Playground.

## Overview

- **`Timeline.tsx`**: The main container component that orchestrates the entire timeline functionality, including keyframe management, scrubbing, and track controls. It renders the ruler, tracks, and keyframes.
- **`TimelineRuler.tsx`**: Renders the time-based ruler at the top of the timeline, dynamically adjusting its tick marks based on zoom level and duration.
- **`TimelineControls.tsx`**: The set of playback controls (play, pause, loop, etc.) and inputs for setting animation duration and FPS. It also contains the entry point to the global easing editor.
- **`EasingEditor.tsx`**: The popover component that allows users to select a preset easing function or switch to a custom bezier curve editor for a specific keyframe.
- **`BezierEditor.tsx`**: An interactive cubic-bezier curve editor used within the `EasingEditor` for creating custom easing functions.
- **`EasingCurve.tsx`**: A small, reusable component that renders a visual SVG representation of an easing curve.
- **`CondensedTimelineView.tsx`**: A compact, visual summary of the animation, displayed when the main timeline panel is collapsed.
