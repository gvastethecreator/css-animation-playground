import { create } from 'zustand';
import { StageStyleName, AnimationEngine, GizmoMode, AnimationDirection, EasingName } from '../types';

interface UIState {
  sidebarWidth: number;
  timelineHeight: number;
  codePanelHeight: number;
  showGrid: boolean;
  showStageUI: boolean;
  alignGridToView: boolean;
  isExploded: boolean;
  showHelp: boolean;
}

interface SceneState {
  translateX: number;
  translateY: number;
  translateZ: number;
}

interface TimelineState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLooping: boolean;
  direction: AnimationDirection;
  easing: EasingName | string;
  fps: number;
}

interface AppStore {
  uiState: UIState;
  setUiState: (updates: Partial<UIState> | ((prev: UIState) => Partial<UIState>)) => void;
  
  scene: SceneState;
  setScene: (updates: Partial<SceneState> | ((prev: SceneState) => Partial<SceneState>)) => void;
  
  timelineState: TimelineState;
  setTimelineState: (updates: Partial<TimelineState> | ((prev: TimelineState) => Partial<TimelineState>)) => void;
  
  stageStyle: StageStyleName;
  setStageStyle: (style: StageStyleName) => void;
  
  animationEngine: AnimationEngine;
  setAnimationEngine: (engine: AnimationEngine) => void;
  
  gizmoMode: GizmoMode;
  setGizmoMode: (mode: GizmoMode) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  uiState: {
    sidebarWidth: 320,
    timelineHeight: 280,
    codePanelHeight: 37,
    showGrid: true,
    showStageUI: true,
    alignGridToView: false,
    isExploded: false,
    showHelp: false,
  },
  setUiState: (updates) => set((state) => ({
    uiState: {
      ...state.uiState,
      ...(typeof updates === 'function' ? updates(state.uiState) : updates)
    }
  })),

  scene: { translateX: 0, translateY: 0, translateZ: 0 },
  setScene: (updates) => set((state) => ({
    scene: {
      ...state.scene,
      ...(typeof updates === 'function' ? updates(state.scene) : updates)
    }
  })),

  timelineState: {
    currentTime: 0,
    duration: 2000,
    isPlaying: false,
    isLooping: true,
    direction: 'normal',
    easing: 'linear',
    fps: 60,
  },
  setTimelineState: (updates) => set((state) => ({
    timelineState: {
      ...state.timelineState,
      ...(typeof updates === 'function' ? updates(state.timelineState) : updates)
    }
  })),

  stageStyle: 'Default',
  setStageStyle: (stageStyle) => set({ stageStyle }),

  animationEngine: 'css',
  setAnimationEngine: (animationEngine) => set({ animationEngine }),

  gizmoMode: 'translate',
  setGizmoMode: (gizmoMode) => set({ gizmoMode }),
}));
