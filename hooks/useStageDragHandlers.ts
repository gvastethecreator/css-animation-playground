import { useState, useCallback } from "react";

export function useStageDragHandlers(onFileChange: (file: File) => void) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileChange(e.dataTransfer.files[0]);
      }
    },
    [onFileChange],
  );

  return { isDraggingOver, handleDragEnter, handleDragLeave, handleDragOver, handleDrop };
}
