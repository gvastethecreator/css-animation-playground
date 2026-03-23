# CSS 3D Playground

**CSS 3D Playground** is a powerful, interactive, in-browser tool designed for developers and designers to explore, create, and visualize complex CSS 3D transformations and animations in real-time.

It provides a rich user interface with sliders, a 3D stage, and a full-featured animation timeline, making it easy to build intricate effects and export the code to popular formats like vanilla CSS, GSAP, Anime.js, Framer Motion, and even Three.js.

## ✨ Core Features

- **Multi-Engine Rendering**: Choose between standard **CSS** for web-native transforms or **Three.js** for a high-performance WebGL-based rendering environment.
- **Real-time Transform Controls**: Manipulate properties like `perspective`, `translate`, `rotate`, `scale`, and `skew` with immediate visual feedback.
- **Interactive 3D Stage**: A `preserve-3d` stage with a movable camera, zoom functionality, and a perspective grid to help visualize the 3D space.
- **Advanced Animation Timeline**:
  - Create keyframes for any transform property.
  - Drag-and-drop keyframes to adjust timing and values.
  - Multi-select and edit keyframes.
  - Scrub the timeline to see the animation update live.
  - Control playback, looping, duration, and FPS.
- **Easing Editor**: Choose from a wide range of preset easing functions or create custom `cubic-bezier` curves with an interactive editor.
- **Animation Presets**: Instantly apply complex, pre-built animations like "Shake", "Drop In", and "Flip" to jumpstart your work.
- **Code Export**: Generate production-ready code for your static transforms or full animations in multiple formats:
  - **CSS** (`@keyframes`)
  - **GSAP** (GreenSock Animation Platform)
  - **Anime.js**
  - **Framer Motion**
  - **Three.js** (via GSAP)
- **State Persistence**: Your entire workspace, including transforms, animations, and uploaded media, is automatically saved to `localStorage`. Resume your session anytime by simply reopening the page.
- **Custom Stage Elements**: Animate different elements like cards, cubes, text, or even your own uploaded images, videos, and **3D models (.glb, .gltf)**.

## 🚀 Getting Started

### Prerequisites

- **Bun** >= 1.1 (recommended) or **Node.js** >= 18

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

Opens the dev server at `http://localhost:3000`.

### Build

```bash
bun run build
```

Runs TypeScript type-checking and produces an optimized production build in `dist/`.

### Other Scripts

| Command                  | Description                         |
|--------------------------|-------------------------------------|
| `bun run typecheck`      | TypeScript type-check only          |
| `bun run lint`           | OXLint check                        |
| `bun run lint:fix`       | OXLint auto-fix                     |
| `bun run format`         | OXFmt format all files              |
| `bun run format:check`   | Check formatting without writing    |
| `bun run test`           | Run unit tests with Vitest          |
| `bun run test:watch`     | Run tests in watch mode             |
| `bun run test:coverage`  | Run tests with coverage report      |
| `bun run preview`        | Preview production build locally    |
| `bun run clean`          | Remove dist/ and logs/ directories  |

The application will load and you can start creating!

## 🔧 How to Use the Application

1. **Use the Sidebar**: The left panel contains all the controls for `transform` properties.
    - Use the sliders to adjust values in real-time.
    - Click the diamond icon next to a property to add a keyframe at the current timeline position.
2. **Select an Engine**: Use the engine selector in the header to switch between `CSS` and `Three.js` rendering. Note that 3D models are only visible in the Three.js engine.
3. **Navigate the Stage**:
    - **Click and drag** the stage to pan the camera (offset).
    - Use the **mouse wheel** to zoom in and out.
    - Use the camera controls on the left to reset the view or focus on specific origin points.
4. **Animate with the Timeline**:
    - The timeline appears at the bottom. Click the title or arrow to expand it.
    - Click on the timeline ruler to move the **playhead** (the red scrubber).
    - Click `Play` to see your animation in action.
    - **Click a keyframe** to open the Easing Editor.
    - **Right-click a keyframe** to delete it.
    - **Click and drag** keyframes to change their time.
    - **Shift-click** or **drag a selection box** to select multiple keyframes.
5. **Export Your Code**:
    - Open the "Code Export" panel at the bottom.
    - The exported code will automatically match the currently selected engine.
    - Click "Copy" to copy the generated code to your clipboard.

## 🛠 Tech Stack

| Layer | Tool |
|-------|------|
| Runtime | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| 3D | Three.js 0.181 |
| Tests | Vitest 3 + @testing-library/react |
| Lint | OXLint (OXC) |
| Format | OXFmt (OXC) |
| Package manager | Bun |
