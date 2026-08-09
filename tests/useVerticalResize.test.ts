/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vite-plus/test';
import { act, renderHook } from '@testing-library/react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useVerticalResize } from '../hooks/useVerticalResize';

const resizeStartEvent = (clientY: number) =>
  ({ clientY, preventDefault: vi.fn() }) as unknown as ReactMouseEvent<HTMLDivElement>;

describe('useVerticalResize', () => {
  it('resizes upward within the shared bounds and stops on mouseup', () => {
    const onHeightChange = vi.fn();
    const { result } = renderHook(() => useVerticalResize({ height: 200, onHeightChange }));
    const startEvent = resizeStartEvent(200);

    act(() => result.current(startEvent));
    expect(startEvent.preventDefault).toHaveBeenCalledOnce();

    act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY: 100 })));
    expect(onHeightChange).toHaveBeenLastCalledWith(300);

    act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY: -1000 })));
    expect(onHeightChange).toHaveBeenLastCalledWith(600);

    act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY: 1000 })));
    expect(onHeightChange).toHaveBeenLastCalledWith(100);

    act(() => document.dispatchEvent(new MouseEvent('mouseup')));
    const callCount = onHeightChange.mock.calls.length;
    act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY: 150 })));
    expect(onHeightChange).toHaveBeenCalledTimes(callCount);
  });

  it('removes active listeners when the caller unmounts', () => {
    const onHeightChange = vi.fn();
    const { result, unmount } = renderHook(() => useVerticalResize({ height: 200, onHeightChange }));

    act(() => result.current(resizeStartEvent(200)));
    unmount();
    act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY: 100 })));

    expect(onHeightChange).not.toHaveBeenCalled();
  });
});
