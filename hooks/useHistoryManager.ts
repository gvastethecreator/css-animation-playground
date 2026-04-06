import { useCallback, useEffect, useRef, useReducer } from "react";
import {
  TransformState,
  AnimationData,
  defaultTransformState,
  TrackControlState,
  AnimationDirection,
  EasingValue,
  EngineConfig,
} from "../types";

export interface HistoryState {
  transforms: TransformState;
  animationData: AnimationData;
  timelineDuration: number;
  timelineIsLooping: boolean;
  timelineDirection: AnimationDirection;
  timelineEasing: EasingValue;
  trackControls: Partial<Record<keyof TransformState, TrackControlState>>;
  engineConfig: EngineConfig;
  timelinePlayOnClick: boolean;
}

const APP_STORAGE_KEY = "css3d-playground-state";

export const defaultEngineConfig: EngineConfig = {
  gsap: {
    easeAmplitude: 1,
    easePeriod: 0.3,
  },
  animejs: {
    elasticity: 500,
  },
};

const defaultHistoryState: HistoryState = {
  transforms: defaultTransformState,
  animationData: {},
  timelineDuration: 5000,
  timelineIsLooping: true,
  timelineDirection: "normal",
  timelineEasing: "linear",
  trackControls: {},
  engineConfig: defaultEngineConfig,
  timelinePlayOnClick: false,
};

const getInitialState = (): HistoryState => {
  try {
    const savedState = localStorage.getItem(APP_STORAGE_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Merge with defaults to ensure all keys exist, especially for users with old state saved
      return {
        ...defaultHistoryState,
        ...parsed,
        transforms: { ...defaultTransformState, ...parsed.transforms },
        engineConfig: {
          ...defaultEngineConfig,
          ...parsed.engineConfig,
          gsap: { ...defaultEngineConfig.gsap, ...parsed.engineConfig?.gsap },
          animejs: { ...defaultEngineConfig.animejs, ...parsed.engineConfig?.animejs },
        },
      };
    }
  } catch {
    // Ignore invalid persisted state and fall back to defaults.
  }
  return defaultHistoryState;
};

const MAX_HISTORY = 50;

type HistoryAction =
  | { type: "PUSH"; state: HistoryState }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET" };

interface HistoryStack {
  entries: HistoryState[];
  index: number;
}

function historyReducer(stack: HistoryStack, action: HistoryAction): HistoryStack {
  switch (action.type) {
    case "PUSH": {
      const entries = stack.entries.slice(0, stack.index + 1);
      entries.push(action.state);
      if (entries.length > MAX_HISTORY) entries.shift();
      return { entries, index: entries.length - 1 };
    }
    case "UNDO":
      return stack.index > 0 ? { ...stack, index: stack.index - 1 } : stack;
    case "REDO":
      return stack.index < stack.entries.length - 1 ? { ...stack, index: stack.index + 1 } : stack;
    case "RESET": {
      const fresh = {
        ...defaultHistoryState,
        transforms: { ...defaultTransformState },
        engineConfig: { ...defaultEngineConfig },
      };
      return { entries: [fresh], index: 0 };
    }
  }
}

export function useHistoryManager() {
  const [stack, dispatch] = useReducer(historyReducer, undefined, () => ({
    entries: [getInitialState()],
    index: 0,
  }));
  const isRestoringHistoryRef = useRef(false);

  const currentState = stack.entries[stack.index];

  useEffect(() => {
    try {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(currentState));
    } catch {
      // Ignore storage quota and unavailable storage failures.
    }
  }, [currentState]);

  const saveStateToHistory = useCallback((newState: HistoryState) => {
    dispatch({ type: "PUSH", state: newState });
  }, []);

  const handleUndo = useCallback((): HistoryState | null => {
    if (stack.index <= 0) return null;
    isRestoringHistoryRef.current = true;
    dispatch({ type: "UNDO" });
    const restored = stack.entries[stack.index - 1];
    requestAnimationFrame(() => {
      isRestoringHistoryRef.current = false;
    });
    return restored;
  }, [stack.index, stack.entries]);

  const handleRedo = useCallback((): HistoryState | null => {
    if (stack.index >= stack.entries.length - 1) return null;
    isRestoringHistoryRef.current = true;
    dispatch({ type: "REDO" });
    const restored = stack.entries[stack.index + 1];
    requestAnimationFrame(() => {
      isRestoringHistoryRef.current = false;
    });
    return restored;
  }, [stack.index, stack.entries]);

  const resetHistory = useCallback(() => {
    dispatch({ type: "RESET" });
    return {
      ...defaultHistoryState,
      transforms: { ...defaultTransformState },
      engineConfig: { ...defaultEngineConfig },
    };
  }, []);

  return {
    currentState,
    saveStateToHistory,
    handleUndo,
    handleRedo,
    resetHistory,
    canUndo: stack.index > 0,
    canRedo: stack.index < stack.entries.length - 1,
    isRestoring: isRestoringHistoryRef,
  };
}
