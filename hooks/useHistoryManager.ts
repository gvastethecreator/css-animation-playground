import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { HistoryState } from '../types';
import {
  APP_STORAGE_KEY,
  createDefaultHistoryState,
  createHistoryStack,
  historyReducer,
  restoreHistoryState,
} from '../utils/historyState';

const getInitialStack = () => {
  try {
    return createHistoryStack(restoreHistoryState(localStorage.getItem(APP_STORAGE_KEY)));
  } catch {
    return createHistoryStack(createDefaultHistoryState());
  }
};

export function useHistoryManager() {
  const [stack, dispatch] = useReducer(historyReducer, undefined, getInitialStack);
  const isRestoringHistoryRef = useRef(false);

  const currentState = stack.entries[stack.index];

  useEffect(() => {
    try {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(currentState));
    } catch {
      // Ignore storage quota and unavailable storage failures.
    }
  }, [currentState]);

  const saveStateToHistory = useCallback((newState: HistoryState) => {
    dispatch({ type: 'PUSH', state: newState });
  }, []);

  const beginHistoryGesture = useCallback(() => {
    dispatch({ type: 'BEGIN_GESTURE' });
  }, []);

  const patchHistory = useCallback((newState: HistoryState) => {
    dispatch({ type: 'PATCH', state: newState });
  }, []);

  const commitHistoryGesture = useCallback(() => {
    dispatch({ type: 'COMMIT_GESTURE' });
  }, []);

  const handleUndo = useCallback((): HistoryState | null => {
    if (stack.index <= 0) return null;
    isRestoringHistoryRef.current = true;
    dispatch({ type: 'UNDO' });
    const restored = stack.entries[stack.index - 1];
    requestAnimationFrame(() => {
      isRestoringHistoryRef.current = false;
    });
    return restored;
  }, [stack.index, stack.entries]);

  const handleRedo = useCallback((): HistoryState | null => {
    if (stack.index >= stack.entries.length - 1) return null;
    isRestoringHistoryRef.current = true;
    dispatch({ type: 'REDO' });
    const restored = stack.entries[stack.index + 1];
    requestAnimationFrame(() => {
      isRestoringHistoryRef.current = false;
    });
    return restored;
  }, [stack.index, stack.entries]);

  const resetHistory = useCallback(() => {
    dispatch({ type: 'RESET' });
    return createDefaultHistoryState();
  }, []);

  return {
    currentState,
    saveStateToHistory,
    beginHistoryGesture,
    patchHistory,
    commitHistoryGesture,
    handleUndo,
    handleRedo,
    resetHistory,
    canUndo: stack.index > 0,
    canRedo: stack.index < stack.entries.length - 1,
    isRestoring: isRestoringHistoryRef,
  };
}
