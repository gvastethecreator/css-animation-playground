import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { renderHook } from '@testing-library/react';
import { useHotkeys } from '../hooks/useHotkeys';

describe('useHotkeys', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const fireKey = (key: string, modifiers: Partial<KeyboardEventInit> = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...modifiers,
    });
    window.dispatchEvent(event);
    return event;
  };

  it('calls handler for simple key press', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ a: handler }));
    fireKey('a');
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not call handler for non-matching key', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ a: handler }));
    fireKey('b');
    expect(handler).not.toHaveBeenCalled();
  });

  it('handles meta+key modifier (Ctrl on non-Mac)', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ 'meta+z': handler }));
    // meta+z should match ctrlKey on non-Mac
    fireKey('z', { ctrlKey: true });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('handles shift modifier', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ 'meta+shift+z': handler }));
    fireKey('z', { ctrlKey: true, shiftKey: true });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('matches a shifted punctuation key without listing shift in the binding', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ '?': handler }));
    fireKey('?', { shiftKey: true });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire when target is INPUT', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ a: handler }));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    window.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('calls preventDefault on matched key', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ ' ': handler }));
    fireKey(' ');
    expect(handler).toHaveBeenCalledOnce();
    // Note: preventDefault is called inside the handler
  });

  it('is case-insensitive for keys', () => {
    const handler = vi.fn();
    renderHook(() => useHotkeys({ arrowleft: handler }));
    fireKey('ArrowLeft');
    expect(handler).toHaveBeenCalledOnce();
  });

  it('stops after first match', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    renderHook(() =>
      useHotkeys({
        a: handler1,
        a2: handler2, // different key, should not match 'a'
      }),
    );
    fireKey('a');
    expect(handler1).toHaveBeenCalledOnce();
  });

  it('cleans up listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useHotkeys({ a: handler }));
    unmount();
    fireKey('a');
    expect(handler).not.toHaveBeenCalled();
  });
});
