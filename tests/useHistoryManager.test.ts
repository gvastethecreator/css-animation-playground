/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vite-plus/test';
import { renderHook, act } from '@testing-library/react';
import { useHistoryManager } from '../hooks/useHistoryManager';
import { defaultTransformState } from '../types';
import type { HistoryState } from '../types';
import { APP_STORAGE_KEY, defaultEngineConfig } from '../utils/historyState';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const makeState = (overrides: Partial<HistoryState> = {}): HistoryState => ({
  transforms: { ...defaultTransformState },
  animationData: {},
  timelineDuration: 5000,
  timelineIsLooping: true,
  timelineDirection: 'normal',
  timelineEasing: 'linear',
  trackControls: {},
  engineConfig: { ...defaultEngineConfig },
  timelinePlayOnClick: false,
  ...overrides,
});

describe('useHistoryManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('returns initial default state', () => {
    const { result } = renderHook(() => useHistoryManager());
    expect(result.current.currentState.transforms).toEqual(defaultTransformState);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('saves state to history and allows undo', () => {
    const { result } = renderHook(() => useHistoryManager());

    const newState = makeState({
      transforms: { ...defaultTransformState, translateX: 100 },
    });

    act(() => {
      result.current.saveStateToHistory(newState);
    });

    expect(result.current.currentState.transforms.translateX).toBe(100);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.handleUndo();
    });

    expect(result.current.currentState.transforms.translateX).toBe(defaultTransformState.translateX);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('supports redo after undo', () => {
    const { result } = renderHook(() => useHistoryManager());

    const newState = makeState({
      transforms: { ...defaultTransformState, rotateY: 45 },
    });

    act(() => {
      result.current.saveStateToHistory(newState);
    });
    act(() => {
      result.current.handleUndo();
    });
    act(() => {
      result.current.handleRedo();
    });

    expect(result.current.currentState.transforms.rotateY).toBe(45);
    expect(result.current.canRedo).toBe(false);
  });

  it('discards redo branch when saving new state after undo', () => {
    const { result } = renderHook(() => useHistoryManager());

    const state1 = makeState({ transforms: { ...defaultTransformState, translateX: 10 } });
    const state2 = makeState({ transforms: { ...defaultTransformState, translateX: 20 } });

    act(() => {
      result.current.saveStateToHistory(state1);
    });
    act(() => {
      result.current.saveStateToHistory(state2);
    });
    act(() => {
      result.current.handleUndo();
    });

    expect(result.current.currentState.transforms.translateX).toBe(10);
    expect(result.current.canRedo).toBe(true);

    const state3 = makeState({ transforms: { ...defaultTransformState, translateX: 30 } });
    act(() => {
      result.current.saveStateToHistory(state3);
    });

    expect(result.current.currentState.transforms.translateX).toBe(30);
    expect(result.current.canRedo).toBe(false);

    // Undo goes to state1, not state2 (state2 was discarded)
    act(() => {
      result.current.handleUndo();
    });
    expect(result.current.currentState.transforms.translateX).toBe(10);
  });

  it('limits history to 50 entries', () => {
    const { result } = renderHook(() => useHistoryManager());

    for (let i = 0; i < 55; i++) {
      act(() => {
        result.current.saveStateToHistory(makeState({ transforms: { ...defaultTransformState, translateX: i } }));
      });
    }

    // After 55 pushes (+1 initial = 56), we should be capped at 50
    // We can test by undoing many times and counting
    let undoCount = 0;
    while (result.current.canUndo) {
      act(() => {
        result.current.handleUndo();
      });
      undoCount++;
    }

    expect(undoCount).toBeLessThanOrEqual(50);
  });

  it('resetHistory returns to default and clears history', () => {
    const { result } = renderHook(() => useHistoryManager());

    act(() => {
      result.current.saveStateToHistory(makeState({ transforms: { ...defaultTransformState, scaleX: 5 } }));
    });

    act(() => {
      result.current.resetHistory();
    });

    expect(result.current.currentState.transforms.scaleX).toBe(defaultTransformState.scaleX);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('handleUndo returns null when at first state', () => {
    const { result } = renderHook(() => useHistoryManager());
    let undoResult: HistoryState | null = null;

    act(() => {
      undoResult = result.current.handleUndo();
    });

    expect(undoResult).toBeNull();
  });

  it('handleRedo returns null when at latest state', () => {
    const { result } = renderHook(() => useHistoryManager());
    let redoResult: HistoryState | null = null;

    act(() => {
      redoResult = result.current.handleRedo();
    });

    expect(redoResult).toBeNull();
  });

  it('persists current state to localStorage', () => {
    renderHook(() => useHistoryManager());
    expect(localStorageMock.setItem).toHaveBeenCalledWith('css3d-playground-state', expect.any(String));
  });

  it('loads from localStorage on init', () => {
    const savedState = makeState({
      transforms: { ...defaultTransformState, translateZ: 999 },
    });
    localStorageMock.setItem('css3d-playground-state', JSON.stringify(savedState));
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedState));

    const { result } = renderHook(() => useHistoryManager());
    expect(result.current.currentState.transforms.translateZ).toBe(999);
  });

  it('restores partial older state through current nested defaults', () => {
    localStorageMock.setItem(
      APP_STORAGE_KEY,
      JSON.stringify({
        transforms: { translateX: 42 },
        engineConfig: { gsap: { easeAmplitude: 2 } },
      }),
    );

    const { result } = renderHook(() => useHistoryManager());

    expect(result.current.currentState.transforms.translateX).toBe(42);
    expect(result.current.currentState.transforms.rotateY).toBe(defaultTransformState.rotateY);
    expect(result.current.currentState.engineConfig.gsap).toEqual({ easeAmplitude: 2, easePeriod: 0.3 });
    expect(result.current.currentState.engineConfig.animejs).toEqual(defaultEngineConfig.animejs);
  });

  it('falls back safely when persisted state is malformed', () => {
    localStorageMock.setItem(APP_STORAGE_KEY, JSON.stringify({ transforms: 'invalid', timelineDuration: 'fast' }));

    const { result } = renderHook(() => useHistoryManager());

    expect(result.current.currentState.transforms).toEqual(defaultTransformState);
    expect(result.current.currentState.timelineDuration).toBe(5000);
  });

  it.each([0, -100])('rejects out-of-domain persisted timeline duration %s', (timelineDuration) => {
    localStorageMock.setItem(APP_STORAGE_KEY, JSON.stringify({ timelineDuration }));

    const { result } = renderHook(() => useHistoryManager());

    expect(result.current.currentState.timelineDuration).toBe(5000);
  });
});
