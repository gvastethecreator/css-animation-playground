# AI Agent Contribution Guidelines

This document provides a set of specific instructions and context for AI agents (like Google Gemini) that will assist in the development of the **CSS 3D Playground**. Adhering to these guidelines will ensure that generated code is consistent with the project's architecture and quality standards.

## 1. Core Mandate

Your primary goal is to act as a world-class senior frontend engineer. You will be asked to modify the existing application by adding features, refactoring code, or fixing bugs. Your responses should be minimal, correct, and adhere to all project conventions.

## 2. Understanding the Architecture

Before making any changes, you must understand the key architectural patterns of this project:

- **Root Component**: `App.tsx` is the orchestrator. It holds the primary state and passes data and callbacks down to its children.
- **State Management**: The project does **not** use a global state library like Redux or Zustand. State is managed via:
  1.  **Custom Hooks**: For complex, cross-cutting concerns. The two most important are:
      - `useHistoryManager`: Handles **everything** related to undo/redo and `localStorage` persistence of the core animation state. When a user action should be "undoable," you must interact with this hook's `commitChanges` function.
      - `useStageElementManager`: Manages the visible element on the stage and handles image/video uploads and their persistence.
  2.  **State Colocation**: UI-specific state that is not saved (e.g., panel visibility, current selection) is kept within the `App.tsx` component or, if only used by one component, within that component itself.
- **Data Flow**: Unidirectional. State flows down from `App.tsx` as props. Events flow up from child components via callback functions.
- **Modular Components**: The `components` directory contains reusable UI pieces. Complex components like `Timeline` are broken down into their own sub-directory (`components/timeline/`).

## 3. Rules for Generating Code

### 3.1. State and Logic

- **DO NOT** introduce global state management libraries (Redux, Zustand, MobX, etc.).
- **DO NOT** access `localStorage` directly from within a React component. All persistence logic **MUST** go through the `useHistoryManager` or `useStageElementManager` hooks.
- If you need to make a user's action undoable, ensure you call the `commitChanges` function (which is passed down from `App.tsx`) at the end of the interaction (e.g., on mouse up, on change commit).
- Place any new, complex, shared logic into a new custom hook in the `/hooks` directory. For example, if you were to add theme management, you would create a `useThemeManager.ts` hook.
- All type definitions shared across multiple files **MUST** be placed in `types.ts`. Component-specific props interfaces should live in the component's file.

### 3.2. Components

- When creating a new component, place it in the `/components` directory.
- New components **MUST** be functional components using React Hooks.
- All props **MUST** be strictly typed with TypeScript interfaces.
- Use `React.memo` on components that are pure and may re-render often with the same props.
- Adhere to the existing styling conventions using **Tailwind CSS**. Do not introduce new styling methods (e.g., CSS-in-JS, separate `.css` files).

### 3.3. API Integration (Gemini API)

If asked to integrate AI features using the `@google/genai` library:

- Follow the provided coding guidelines for the Gemini API precisely.
- Initialize the client (`new GoogleGenAI({apiKey: process.env.API_KEY})`) only when needed. Assume `process.env.API_KEY` is available.
- When asking the model to generate structured data (e.g., animation keyframes), use the `responseSchema` feature to ensure the output is valid JSON that matches our `types.ts` definitions.
- For interactive features (e.g., "animate this based on my description"), consider using `FunctionCalling` to allow the model to call predefined functions within the app (e.g., `addKeyframe(...)`, `setTransform(...)`). This is more robust than parsing natural language output.

### 3.4. Output Format

- When providing code changes, you **MUST** use the specified XML format.
- Only include files that have been changed.
- Provide a clear, concise description of the changes made for each file.
- The content of the file within the `<![CDATA[]]>` block **MUST** be the full, complete content of the file, not just a diff.
