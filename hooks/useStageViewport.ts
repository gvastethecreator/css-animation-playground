import { useCallback, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent } from 'react';
import { useAppStore } from '../store/useAppStore';

const MIN_ZOOM = -1000;
const MAX_ZOOM = 2000;
const ORIGIN = { translateX: 0, translateY: 0, translateZ: 0 } as const;

export function useStageViewport() {
  const scene = useAppStore((state) => state.scene);
  const setScene = useAppStore((state) => state.setScene);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, sceneX: 0, sceneY: 0 });
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  const handleMouseDown = useCallback((event: ReactMouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.id !== 'stage-root' && target.tagName !== 'CANVAS') return;

    setIsDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      sceneX: sceneRef.current.translateX,
      sceneY: sceneRef.current.translateY,
    };
  }, []);

  const handleMouseMove = useCallback(
    (event: ReactMouseEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - dragStart.current.x;
      const deltaY = event.clientY - dragStart.current.y;
      setScene({
        translateX: dragStart.current.sceneX + deltaX,
        translateY: dragStart.current.sceneY + deltaY,
      });
    },
    [isDragging, setScene],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleWheel = useCallback(
    (event: ReactWheelEvent) => {
      setScene((previous) => ({
        translateZ: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, previous.translateZ - event.deltaY)),
      }));
    },
    [setScene],
  );

  const resetView = useCallback(() => setScene(ORIGIN), [setScene]);
  const resetZoom = useCallback(() => setScene({ translateZ: 0 }), [setScene]);

  return {
    scene,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    resetView,
    resetZoom,
    focusTransformOrigin: resetView,
    focusPerspectiveOrigin: resetView,
  };
}
