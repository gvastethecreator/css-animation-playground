import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

interface VerticalResizeOptions {
  height: number;
  onHeightChange: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
}

export function useVerticalResize({ height, onHeightChange, minHeight = 100, maxHeight = 600 }: VerticalResizeOptions) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupRef.current?.(), []);

  return useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      cleanupRef.current?.();

      const startY = event.clientY;
      const startHeight = height;
      const handleMouseMove = (moveEvent: MouseEvent) => {
        const nextHeight = startHeight + (startY - moveEvent.clientY);
        onHeightChange(Math.min(Math.max(nextHeight, minHeight), maxHeight));
      };
      const cleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', cleanup);
        if (cleanupRef.current === cleanup) cleanupRef.current = null;
      };

      cleanupRef.current = cleanup;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', cleanup);
    },
    [height, maxHeight, minHeight, onHeightChange],
  );
}
