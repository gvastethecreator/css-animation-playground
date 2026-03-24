import { describe, it, expect, beforeEach } from 'vite-plus/test';
import { useAppStore } from '../store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useAppStore.setState(useAppStore.getInitialState());
  });

  describe('uiState', () => {
    it('has correct default values', () => {
      const { uiState } = useAppStore.getState();
      expect(uiState.sidebarWidth).toBe(320);
      expect(uiState.showGrid).toBe(true);
      expect(uiState.showStageUI).toBe(true);
      expect(uiState.isExploded).toBe(false);
      expect(uiState.showHelp).toBe(false);
    });

    it('updates with partial object', () => {
      useAppStore.getState().setUiState({ showGrid: false });
      const { uiState } = useAppStore.getState();
      expect(uiState.showGrid).toBe(false);
      expect(uiState.showStageUI).toBe(true); // unchanged
    });

    it('updates with function updater', () => {
      useAppStore.getState().setUiState((prev) => ({ isExploded: !prev.isExploded }));
      expect(useAppStore.getState().uiState.isExploded).toBe(true);
    });
  });

  describe('scene', () => {
    it('has zero position by default', () => {
      const { scene } = useAppStore.getState();
      expect(scene.translateX).toBe(0);
      expect(scene.translateY).toBe(0);
      expect(scene.translateZ).toBe(0);
    });

    it('updates with partial object', () => {
      useAppStore.getState().setScene({ translateX: 100 });
      expect(useAppStore.getState().scene.translateX).toBe(100);
      expect(useAppStore.getState().scene.translateY).toBe(0);
    });

    it('updates with function updater', () => {
      useAppStore.getState().setScene((prev) => ({ translateZ: prev.translateZ + 50 }));
      expect(useAppStore.getState().scene.translateZ).toBe(50);
    });
  });

  describe('timelineState', () => {
    it('has correct initial values', () => {
      const { timelineState } = useAppStore.getState();
      expect(timelineState.currentTime).toBe(0);
      expect(timelineState.duration).toBe(2000);
      expect(timelineState.isPlaying).toBe(false);
      expect(timelineState.isLooping).toBe(true);
      expect(timelineState.direction).toBe('normal');
      expect(timelineState.easing).toBe('linear');
      expect(timelineState.fps).toBe(60);
    });

    it('updates playback state', () => {
      useAppStore.getState().setTimelineState({ isPlaying: true, currentTime: 500 });
      const { timelineState } = useAppStore.getState();
      expect(timelineState.isPlaying).toBe(true);
      expect(timelineState.currentTime).toBe(500);
    });
  });

  describe('stageStyle', () => {
    it('defaults to Default', () => {
      expect(useAppStore.getState().stageStyle).toBe('Default');
    });

    it('updates style name', () => {
      useAppStore.getState().setStageStyle('Synthwave');
      expect(useAppStore.getState().stageStyle).toBe('Synthwave');
    });
  });

  describe('animationEngine', () => {
    it('defaults to css', () => {
      expect(useAppStore.getState().animationEngine).toBe('css');
    });

    it('switches engine', () => {
      useAppStore.getState().setAnimationEngine('threejs');
      expect(useAppStore.getState().animationEngine).toBe('threejs');
    });
  });

  describe('gizmoMode', () => {
    it('defaults to translate', () => {
      expect(useAppStore.getState().gizmoMode).toBe('translate');
    });

    it('switches mode', () => {
      useAppStore.getState().setGizmoMode('rotate');
      expect(useAppStore.getState().gizmoMode).toBe('rotate');
    });
  });
});
