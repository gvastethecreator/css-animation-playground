/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { act, renderHook } from '@testing-library/react';
import type { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent } from 'react';
import { useStageViewport } from '../hooks/useStageViewport';
import { useAppStore } from '../store/useAppStore';

const mouseEvent = (target: HTMLElement, clientX: number, clientY: number) =>
  ({ target, clientX, clientY }) as unknown as ReactMouseEvent;

describe('useStageViewport', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState());
  });

  it('starts panning only from the stage background or canvas', () => {
    const { result } = renderHook(() => useStageViewport());
    const button = document.createElement('button');

    act(() => result.current.handleMouseDown(mouseEvent(button, 10, 10)));
    expect(result.current.isDragging).toBe(false);

    const stage = document.createElement('div');
    stage.id = 'stage-root';
    act(() => result.current.handleMouseDown(mouseEvent(stage, 10, 20)));
    act(() => result.current.handleMouseMove(mouseEvent(stage, 35, 5)));

    expect(useAppStore.getState().scene).toEqual({ translateX: 25, translateY: -15, translateZ: 0 });

    act(() => result.current.handleMouseUp());
    expect(result.current.isDragging).toBe(false);
  });

  it('accepts canvas as a pan target', () => {
    const { result } = renderHook(() => useStageViewport());
    const canvas = document.createElement('canvas');

    act(() => result.current.handleMouseDown(mouseEvent(canvas, 0, 0)));

    expect(result.current.isDragging).toBe(true);
  });

  it('clamps zoom and preserves reset and focus actions', () => {
    const { result } = renderHook(() => useStageViewport());

    act(() => result.current.handleWheel({ deltaY: -5000 } as ReactWheelEvent));
    expect(useAppStore.getState().scene.translateZ).toBe(2000);

    act(() => result.current.handleWheel({ deltaY: 5000 } as ReactWheelEvent));
    expect(useAppStore.getState().scene.translateZ).toBe(-1000);

    act(() => useAppStore.getState().setScene({ translateX: 20, translateY: 30, translateZ: 40 }));
    act(() => result.current.resetZoom());
    expect(useAppStore.getState().scene).toEqual({ translateX: 20, translateY: 30, translateZ: 0 });

    act(() => result.current.focusPerspectiveOrigin());
    expect(useAppStore.getState().scene).toEqual({ translateX: 0, translateY: 0, translateZ: 0 });
  });
});
