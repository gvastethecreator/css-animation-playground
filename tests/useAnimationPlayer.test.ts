/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vite-plus/test';
import { renderHook } from '@testing-library/react';
import { useAnimationPlayer } from '../hooks/useAnimationPlayer';
import { defaultTransformState, type AnimationData, type TrackControlState } from '../types';

const makeTimelineState = (
  overrides: Partial<{
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    isLooping: boolean;
    direction: 'normal' | 'alternate';
    easing: string;
  }> = {},
) => ({
  currentTime: 0,
  duration: 1000,
  isPlaying: false,
  isLooping: false,
  direction: 'normal' as const,
  easing: 'linear',
  ...overrides,
});

describe('useAnimationPlayer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates interpolated values for the current time when paused', () => {
    const animationData: AnimationData = {
      translateX: [
        { id: 'a', time: 0, value: 0, easing: 'linear' },
        { id: 'b', time: 1000, value: 100, easing: 'linear' },
      ],
    };

    const { result } = renderHook(() =>
      useAnimationPlayer(
        defaultTransformState,
        animationData,
        makeTimelineState({ currentTime: 500, isPlaying: false }),
        vi.fn(),
        {},
      ),
    );

    expect(result.current.calculateAnimatedValues(500).translateX).toBe(50);
    expect(result.current.animatedTransforms.translateX).toBe(50);
    expect(result.current.willChangeString).toBe('transform, opacity, filter');
  });

  it('respects muted and soloed track controls in calculations', () => {
    const animationData: AnimationData = {
      translateX: [
        { id: 'a', time: 0, value: 0, easing: 'linear' },
        { id: 'b', time: 1000, value: 100, easing: 'linear' },
      ],
      rotateZ: [
        { id: 'c', time: 0, value: 0, easing: 'linear' },
        { id: 'd', time: 1000, value: 90, easing: 'linear' },
      ],
    };

    const mutedControls: Partial<Record<keyof typeof defaultTransformState, TrackControlState>> = {
      translateX: { mute: true, solo: false },
      rotateZ: { mute: false, solo: false },
    };

    const { result: mutedResult } = renderHook(() =>
      useAnimationPlayer(
        defaultTransformState,
        animationData,
        makeTimelineState({ currentTime: 500 }),
        vi.fn(),
        mutedControls,
      ),
    );

    expect(mutedResult.current.calculateAnimatedValues(500).translateX).toBeUndefined();
    expect(mutedResult.current.calculateAnimatedValues(500).rotateZ).toBe(45);

    const soloControls: Partial<Record<keyof typeof defaultTransformState, TrackControlState>> = {
      translateX: { mute: false, solo: true },
      rotateZ: { mute: false, solo: false },
    };

    const { result: soloResult } = renderHook(() =>
      useAnimationPlayer(
        defaultTransformState,
        animationData,
        makeTimelineState({ currentTime: 500 }),
        vi.fn(),
        soloControls,
      ),
    );

    expect(soloResult.current.calculateAnimatedValues(500).translateX).toBe(50);
    expect(soloResult.current.calculateAnimatedValues(500).rotateZ).toBeUndefined();
  });
});
