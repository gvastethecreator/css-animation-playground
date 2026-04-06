/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { act, renderHook } from "@testing-library/react";
import { usePreviewAnimator } from "../hooks/usePreviewAnimator";
import { defaultTransformState, type PresetAnimationName } from "../types";

describe("usePreviewAnimator", () => {
  const rafCallbacks = new Map<number, FrameRequestCallback>();
  let rafId = 1;

  const runFrame = (timestamp: number) => {
    const pending = [...rafCallbacks.entries()];
    rafCallbacks.clear();
    for (const [, callback] of pending) {
      callback(timestamp);
    }
  };

  beforeEach(() => {
    rafCallbacks.clear();
    rafId = 1;
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
      (callback: FrameRequestCallback) => {
        const id = rafId++;
        rafCallbacks.set(id, callback);
        return id;
      },
    );
    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation((id: number) => {
      rafCallbacks.delete(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when no preset is active", () => {
    const { result } = renderHook(() => usePreviewAnimator(null, defaultTransformState));
    expect(result.current.previewTransforms).toBeNull();
  });

  it("animates a preset and merges base + initialTransforms + animated values", () => {
    const baseTransforms = {
      ...defaultTransformState,
      translateX: 99,
      scaleX: 3,
      scaleY: 3,
      brightnessEnabled: false,
    };

    const { result } = renderHook(() => usePreviewAnimator("Grow", baseTransforms));

    act(() => {
      runFrame(0);
    });

    expect(result.current.previewTransforms).not.toBeNull();
    expect(result.current.previewTransforms?.brightnessEnabled).toBe(true);
    expect(result.current.previewTransforms?.dropShadowEnabled).toBe(true);
    expect(result.current.previewTransforms?.scaleX).toBe(1);
    expect(result.current.previewTransforms?.scaleY).toBe(1);
    expect(result.current.previewTransforms?.translateX).toBe(99);

    act(() => {
      runFrame(500);
    });

    expect(result.current.previewTransforms?.scaleX).toBeGreaterThan(1);
    expect(result.current.previewTransforms?.scaleX).toBeLessThan(1.1);
  });

  it("cancels the scheduled frame when preset is cleared", () => {
    const { result, rerender } = renderHook(
      ({ presetName }: { presetName: PresetAnimationName | null }) =>
        usePreviewAnimator(presetName, defaultTransformState),
      { initialProps: { presetName: "Grow" as PresetAnimationName | null } },
    );

    act(() => {
      runFrame(0);
    });

    expect(result.current.previewTransforms).not.toBeNull();
    expect(rafCallbacks.size).toBeGreaterThan(0);

    rerender({ presetName: null });

    expect(result.current.previewTransforms).toBeNull();
    expect(rafCallbacks.size).toBe(0);
  });
});
