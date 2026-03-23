import { useState, useCallback, useEffect, useRef } from 'react';
import { TransformState, AnimationData, defaultTransformState, TrackControlState, AnimationDirection, EasingName, EngineConfig } from '../types';

export interface HistoryState {
  transforms: TransformState;
  animationData: AnimationData;
  timelineDuration: number;
  timelineIsLooping: boolean;
  timelineDirection: AnimationDirection;
  timelineEasing: EasingName | string;
  trackControls: Partial<Record<keyof TransformState, TrackControlState>>;
  engineConfig: EngineConfig;
  timelinePlayOnClick: boolean;
}

const APP_STORAGE_KEY = 'css3d-playground-state';

export const defaultEngineConfig: EngineConfig = {
    motion: {
        type: 'tween',
        stiffness: 100,
        damping: 10,
        mass: 1,
    },
    gsap: {
        easeAmplitude: 1,
        easePeriod: 0.3,
    },
    animejs: {
        elasticity: 500,
    }
};

const defaultHistoryState: HistoryState = {
    transforms: defaultTransformState,
    animationData: {},
    timelineDuration: 5000,
    timelineIsLooping: true,
    timelineDirection: 'normal',
    timelineEasing: 'linear',
    trackControls: {},
    engineConfig: defaultEngineConfig,
    timelinePlayOnClick: false,
};

const getInitialState = (): HistoryState => {
    try {
        const savedState = localStorage.getItem(APP_STORAGE_KEY);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            // Merge with defaults to ensure all keys exist, especially for users with old state saved
            return { 
                ...defaultHistoryState, 
                ...parsed,
                transforms: { ...defaultTransformState, ...parsed.transforms },
                engineConfig: { ...defaultEngineConfig, ...parsed.engineConfig },
            };
        }
    } catch (e) {
        console.error("Failed to load state from localStorage", e);
    }
    return defaultHistoryState;
};

export function useHistoryManager() {
    const [history, setHistory] = useState<HistoryState[]>([getInitialState()]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const isRestoringHistoryRef = useRef(false);

    const currentState = history[historyIndex];

    useEffect(() => {
        try {
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(currentState));
        } catch (e) {
            console.error("Failed to save state to localStorage", e);
        }
    }, [currentState]);

    const saveStateToHistory = useCallback((newState: HistoryState) => {
        if (isRestoringHistoryRef.current) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        
        // Limit history size to 50 to prevent memory leaks
        if (newHistory.length > 50) {
            newHistory.shift();
        }
        
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);
    
    const restoreStateFromHistory = useCallback((index: number): HistoryState | null => {
        const stateToRestore = history[index];
        if (!stateToRestore) return null;
        
        isRestoringHistoryRef.current = true;
        setHistoryIndex(index);
        
        setTimeout(() => { isRestoringHistoryRef.current = false; }, 0);
        return stateToRestore;
    }, [history]);

    const handleUndo = useCallback(() => {
        return historyIndex > 0 ? restoreStateFromHistory(historyIndex - 1) : null;
    }, [historyIndex, restoreStateFromHistory]);

    const handleRedo = useCallback(() => {
        return historyIndex < history.length - 1 ? restoreStateFromHistory(historyIndex + 1) : null;
    }, [historyIndex, history.length, restoreStateFromHistory]);

    const resetHistory = useCallback(() => {
        const newState = { ...defaultHistoryState, transforms: { ...defaultTransformState }, engineConfig: { ...defaultEngineConfig }};
        setHistory([newState]);
        setHistoryIndex(0);
        return newState;
    }, []);

    return {
        currentState,
        saveStateToHistory,
        handleUndo,
        handleRedo,
        resetHistory,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        isRestoring: isRestoringHistoryRef,
    };
}