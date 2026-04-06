/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { act, renderHook } from "@testing-library/react";
import { useStageDragHandlers } from "../hooks/useStageDragHandlers";

const createDragEvent = (file?: File) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  dataTransfer: {
    files: file ? [file] : [],
  },
});

describe("useStageDragHandlers", () => {
  it("sets dragging state on drag enter and clears it on drag leave", () => {
    const onFileChange = vi.fn();
    const { result } = renderHook(() => useStageDragHandlers(onFileChange));

    const enterEvent = createDragEvent();
    act(() => {
      result.current.handleDragEnter(enterEvent as any);
    });

    expect(enterEvent.preventDefault).toHaveBeenCalledOnce();
    expect(enterEvent.stopPropagation).toHaveBeenCalledOnce();
    expect(result.current.isDraggingOver).toBe(true);

    const leaveEvent = createDragEvent();
    act(() => {
      result.current.handleDragLeave(leaveEvent as any);
    });

    expect(leaveEvent.preventDefault).toHaveBeenCalledOnce();
    expect(leaveEvent.stopPropagation).toHaveBeenCalledOnce();
    expect(result.current.isDraggingOver).toBe(false);
  });

  it("prevents default on drag over without changing state", () => {
    const onFileChange = vi.fn();
    const { result } = renderHook(() => useStageDragHandlers(onFileChange));

    const overEvent = createDragEvent();
    act(() => {
      result.current.handleDragOver(overEvent as any);
    });

    expect(overEvent.preventDefault).toHaveBeenCalledOnce();
    expect(overEvent.stopPropagation).toHaveBeenCalledOnce();
    expect(result.current.isDraggingOver).toBe(false);
  });

  it("handles drop, clears drag state and forwards the file", () => {
    const onFileChange = vi.fn();
    const { result } = renderHook(() => useStageDragHandlers(onFileChange));
    const file = new File(["hello"], "demo.png", { type: "image/png" });

    act(() => {
      result.current.handleDragEnter(createDragEvent() as any);
    });
    expect(result.current.isDraggingOver).toBe(true);

    const dropEvent = createDragEvent(file);
    act(() => {
      result.current.handleDrop(dropEvent as any);
    });

    expect(dropEvent.preventDefault).toHaveBeenCalledOnce();
    expect(dropEvent.stopPropagation).toHaveBeenCalledOnce();
    expect(result.current.isDraggingOver).toBe(false);
    expect(onFileChange).toHaveBeenCalledWith(file);
  });

  it("ignores drop events without files", () => {
    const onFileChange = vi.fn();
    const { result } = renderHook(() => useStageDragHandlers(onFileChange));

    const dropEvent = createDragEvent();
    act(() => {
      result.current.handleDrop(dropEvent as any);
    });

    expect(onFileChange).not.toHaveBeenCalled();
    expect(result.current.isDraggingOver).toBe(false);
  });
});
