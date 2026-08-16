/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vite-plus/test';
import { act, renderHook } from '@testing-library/react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useVerticalResize } from '../hooks/useVerticalResize';

const resizeStartEvent = (clientY: number, preventDefault = vi.fn()) =>
  ({ clientY, preventDefault }) as unknown as ReactMouseEvent<HTMLDivElement>;

describe('useVerticalResize', () => {
  it('resizes upward within the shared bounds and stops on mouseup', async () => {
    const onHeightChange = vi.fn();
    const { result } = renderHook(() => useVerticalResize({ height: 200, onHeightChange }));
    const preventDefault = vi.fn();
    const startEvent = resizeStartEvent(200, preventDefault);

    act(() => result.current(startEvent));
    expect(preventDefault).toHaveBeenCalledOnce();

    await act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY: 100 })));
    expect(onHeightChange).toHaveBeenLastCalledWith(300);

    await act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY: -1000 })));
    expect(onHeightChange).toHaveBeenLastCalledWith(600);

    await act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY: 1000 })));
    expect(onHeightChange).toHaveBeenLastCalledWith(100);

    await act(() => document.dispatchEvent(new MouseEvent('mouseup')));
    const callCount = onHeightChange.mock.calls.length;
    await act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY: 150 })));
    expect(onHeightChange).toHaveBeenCalledTimes(callCount);
  });

  it('removes active listeners when the caller unmounts', async () => {
    const onHeightChange = vi.fn();
    const { result, unmount } = renderHook(() => useVerticalResize({ height: 200, onHeightChange }));

    act(() => result.current(resizeStartEvent(200)));
    unmount();
    await act(() => document.dispatchEvent(new MouseEvent('mousemove', { clientY: 100 })));

    expect(onHeightChange).not.toHaveBeenCalled();
  });
});
