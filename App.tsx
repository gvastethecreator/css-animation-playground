
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Stage from './components/Stage';
import Timeline from './components/Timeline';
import CodeOutputPanel from './components/CodeOutputPanel';
import ShortcutHelp from './components/ShortcutHelp';
import Header from './components/Header';
import { useHistoryManager, HistoryState } from './hooks/useHistoryManager';
import { useAnimationPlayer } from './hooks/useAnimationPlayer';
import { useStageElementManager } from './hooks/useStageElementManager';
import { useHotkeys } from './hooks/useHotkeys';
import { usePreviewAnimator } from './hooks/usePreviewAnimator';
import { useAppStore } from './store/useAppStore';
import { TransformState, AnimationData, Keyframe, PresetName, PresetAnimationName, ANIMATION_PRESETS, VIEW_PRESETS, StageStyleName, STAGE_STYLES, TrackControlState, AnimationDirection, EasingName, StageElement, AnimationEngine, EngineConfig, GizmoMode } from './types';

export default function App() {
    const { currentState, saveStateToHistory, handleUndo, handleRedo, resetHistory, canUndo, canRedo, isRestoring } = useHistoryManager();
    const { transforms, animationData, timelineDuration, timelineIsLooping, timelineDirection, timelineEasing, trackControls, engineConfig, timelinePlayOnClick } = currentState;
    const { stageElement, setStageElement, imageDataUrl, modelDataUrl, handleFileChange, handleFileRemove, handleLoadRandomModel, hasMedia, isLoadingModel } = useStageElementManager();
    const { uiState, setUiState, scene, setScene, stageStyle, setStageStyle, animationEngine, setAnimationEngine, gizmoMode, setGizmoMode, timelineState, setTimelineState } = useAppStore();

    // Sync initial timeline state from history manager on load
    useEffect(() => {
        setTimelineState({
            duration: timelineDuration,
            isLooping: timelineIsLooping,
            direction: timelineDirection,
            easing: timelineEasing,
        });
    }, [timelineDuration, timelineIsLooping, timelineDirection, timelineEasing, setTimelineState]);

    const [animationResetKey, setAnimationResetKey] = useState(0);
    const [selectedKeyframeIds, setSelectedKeyframeIds] = useState(new Set<string>());
    const [previewPresetName, setPreviewPresetName] = useState<PresetAnimationName | null>(null);
    const { previewTransforms } = usePreviewAnimator(previewPresetName, transforms);
    const [isAdjusting, setIsAdjusting] = useState(false);
    const stageElementRef = useRef<HTMLDivElement | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0, sceneX: 0, sceneY: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).id !== 'stage-root' && (e.target as HTMLElement).tagName !== 'CANVAS') return;
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY, sceneX: scene.translateX, sceneY: scene.translateY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setScene(prev => ({ ...prev, translateX: dragStartPos.current.sceneX + dx, translateY: dragStartPos.current.sceneY + dy }));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        setScene(prev => ({ ...prev, translateZ: Math.max(-1000, Math.min(2000, prev.translateZ - e.deltaY)) }));
    };

    const resetView = () => setScene({ translateX: 0, translateY: 0, translateZ: 0 });
    const resetZoom = () => setScene(prev => ({ ...prev, translateZ: 0 }));
    const focusTO = () => setScene({ translateX: 0, translateY: 0, translateZ: 0 });
    const focusPO = () => setScene({ translateX: 0, translateY: 0, translateZ: 0 });

    const onCurrentTimeChange = useCallback((time: number) => {
        setTimelineState(prev => ({ ...prev, currentTime: time }));
    }, []);

    const handlePlaybackComplete = useCallback(() => {
        setTimelineState(prev => ({ ...prev, isPlaying: false }));
    }, []);

    const { animatedTransforms, calculateAnimatedValues, willChangeString } = useAnimationPlayer(
        transforms,
        animationData,
        timelineState,
        onCurrentTimeChange,
        trackControls,
        handlePlaybackComplete,
        animationResetKey.toString(),
        stageElementRef
    );

    const commitChanges = (newState: Partial<HistoryState>) => {
        saveStateToHistory({ ...currentState, ...newState });
    };

    const handleChange = useCallback((updates: Partial<TransformState>) => {
        const newTransforms = { ...transforms, ...updates };
        commitChanges({ transforms: newTransforms });
    }, [transforms, commitChanges]);

    const onKeyframeToggle = (property: keyof TransformState) => {
        const track = animationData[property] || [];
        const existingKeyframeIndex = track.findIndex(kf => kf.time === timelineState.currentTime);
        let newAnimationData = { ...animationData };

        if (existingKeyframeIndex > -1) {
            const newTrack = [...track];
            newTrack.splice(existingKeyframeIndex, 1);
            if (newTrack.length === 0) {
                delete newAnimationData[property];
            } else {
                newAnimationData[property] = newTrack;
            }
        } else {
            const newKeyframe: Keyframe = {
                id: `${Date.now()}-${Math.random()}`,
                time: timelineState.currentTime,
                value: transforms[property],
                easing: 'easeInOut',
            };
            const newTrack = [...track, newKeyframe].sort((a, b) => a.time - b.time);
            newAnimationData[property] = newTrack;
        }
        commitChanges({ animationData: newAnimationData });
    };

    const handleViewPresetClick = (presetName: PresetName) => {
        const preset = VIEW_PRESETS[presetName];
        commitChanges({ transforms: { ...transforms, ...preset } });
    };

    const handleAnimationPresetClick = (presetName: PresetAnimationName) => {
        const preset = ANIMATION_PRESETS[presetName];
        let newTransforms = { ...transforms, ...preset.initialTransforms };

        setTimelineState(prev => ({
            ...prev,
            currentTime: 0,
            isPlaying: true,
            duration: preset.timelineState.duration,
            isLooping: preset.timelineState.isLooping,
            direction: preset.timelineState.direction || 'normal',
            easing: preset.timelineState.easing || 'linear',
        }));

        setAnimationResetKey(p => p + 1);

        commitChanges({
            transforms: newTransforms,
            animationData: preset.animationData,
            timelineDuration: preset.timelineState.duration,
            timelineIsLooping: preset.timelineState.isLooping,
            timelineDirection: preset.timelineState.direction || 'normal',
            timelineEasing: preset.timelineState.easing || 'linear',
        });
    };

    const handleTimelineStateChange = (newState: React.SetStateAction<typeof timelineState>) => {
        const updatedState = typeof newState === 'function' ? newState(timelineState) : newState;
        setTimelineState(updatedState);
        commitChanges({
            timelineDuration: updatedState.duration,
            timelineIsLooping: updatedState.isLooping,
            timelineDirection: updatedState.direction,
            timelineEasing: updatedState.easing,
        });
    };

    const handlePlayOnClickToggle = useCallback(() => {
        commitChanges({ timelinePlayOnClick: !timelinePlayOnClick });
    }, [timelinePlayOnClick, commitChanges]);

    const handleStageElementClick = useCallback(() => {
        if (timelinePlayOnClick) {
            setTimelineState(prev => ({ ...prev, currentTime: 0, isPlaying: true }));
            setAnimationResetKey(p => p + 1);
        }
    }, [timelinePlayOnClick]);

    const handleUndoAction = () => {
        const restored = handleUndo();
        if (restored) {
            setTimelineState(prev => ({
                ...prev,
                duration: restored.timelineDuration,
                isLooping: restored.timelineIsLooping,
                direction: restored.timelineDirection,
                easing: restored.timelineEasing,
            }));
        }
    };

    const handleRedoAction = () => {
        const restored = handleRedo();
        if (restored) {
            setTimelineState(prev => ({
                ...prev,
                duration: restored.timelineDuration,
                isLooping: restored.timelineIsLooping,
                direction: restored.timelineDirection,
                easing: restored.timelineEasing,
            }));
        }
    };

    const handleReset = () => {
        const restored = resetHistory();
        setTimelineState(prev => ({
            ...prev,
            currentTime: 0,
            isPlaying: false,
            duration: restored.timelineDuration,
            isLooping: restored.timelineIsLooping,
            direction: restored.timelineDirection,
            easing: restored.timelineEasing,
        }));
        setAnimationResetKey(p => p + 1);
        setStageElement('card');
        handleFileRemove();
    };

    const handleFrameStep = useCallback((direction: 'next' | 'prev') => {
        setTimelineState(prev => {
            const frameTime = 1000 / prev.fps;
            const newTime = direction === 'next'
                ? Math.min(prev.duration, prev.currentTime + frameTime)
                : Math.max(0, prev.currentTime - frameTime);
            return { ...prev, currentTime: newTime };
        });
    }, []);

    const handleToggleLoop = useCallback(() => {
        handleTimelineStateChange(prev => ({ ...prev, isLooping: !prev.isLooping }));
    }, [handleTimelineStateChange]);

    const handleGoToStart = useCallback(() => {
        onCurrentTimeChange(0);
    }, [onCurrentTimeChange]);

    const handleGoToEnd = useCallback(() => {
        onCurrentTimeChange(timelineState.duration);
    }, [onCurrentTimeChange, timelineState.duration]);

    const handleStop = useCallback(() => {
        handleTimelineStateChange(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }, [handleTimelineStateChange]);

    useHotkeys({
        ' ': (e) => { e.preventDefault(); handleTimelineStateChange(s => ({ ...s, isPlaying: !s.isPlaying })); },
        'meta+z': handleUndoAction,
        'meta+shift+z': handleRedoAction,
        'meta+y': handleRedoAction,
        'arrowleft': () => handleFrameStep('prev'),
        ',': () => handleFrameStep('prev'),
        'arrowright': () => handleFrameStep('next'),
        '.': () => handleFrameStep('next'),
        'home': () => handleGoToStart(),
        'end': () => handleGoToEnd(),
        'l': () => handleToggleLoop(),
    }, [handleUndoAction, handleRedoAction, handleFrameStep, handleGoToStart, handleGoToEnd, handleToggleLoop]);

    useEffect(() => {
        if (!isRestoring.current) {
            setTimelineState(prev => ({
                ...prev,
                duration: timelineDuration,
                isLooping: timelineIsLooping,
                direction: timelineDirection,
                easing: timelineEasing,
            }));
        }
    }, [timelineDuration, timelineIsLooping, timelineDirection, timelineEasing, isRestoring]);

    const isThreeJsMode = animationEngine === 'threejs';
    const displayedTransforms = animatedTransforms;

    const timelineStateForPanel = useMemo(() => ({
        duration: timelineState.duration,
        isLooping: timelineState.isLooping,
        direction: timelineState.direction,
        easing: timelineState.easing
    }), [timelineState.duration, timelineState.isLooping, timelineState.direction, timelineState.easing]);

    return (
        // Applied deep radial gradient here for the main background
        <div className="flex flex-col h-screen bg-[radial-gradient(circle_at_top_left,#18181b,#09090b)] text-white font-sans overflow-hidden">
            <Header
                onUndo={handleUndoAction}
                canUndo={canUndo}
                onRedo={handleRedoAction}
                canRedo={canRedo}
                onReset={handleReset}
                onShowHelp={() => setUiState(s => ({ ...s, showHelp: true }))}
                onAnimationPresetClick={handleAnimationPresetClick}
                onPresetHoverStart={setPreviewPresetName}
                onPresetHoverEnd={() => setPreviewPresetName(null)}
                onFileChange={handleFileChange}
                onFileRemove={handleFileRemove}
                onLoadRandomModel={handleLoadRandomModel}
                hasMedia={hasMedia}
                isLoadingModel={isLoadingModel}
                animationEngine={animationEngine}
                onAnimationEngineChange={setAnimationEngine}
            />

            <div className="flex flex-1 min-h-0">
                <aside
                    className="glass-panel border-r border-zinc-700/50 overflow-y-auto custom-scrollbar z-10"
                    style={{ width: `${uiState.sidebarWidth}px` }}
                >
                    <Sidebar
                        values={displayedTransforms}
                        onChange={handleChange}
                        onAdjustStart={() => setIsAdjusting(true)}
                        onAdjustEnd={() => setIsAdjusting(false)}
                        animationData={animationData}
                        currentTime={timelineState.currentTime}
                        onKeyframeToggle={onKeyframeToggle}
                        animationEngine={animationEngine}
                        engineConfig={engineConfig}
                        onEngineConfigChange={(newConfig) => commitChanges({ engineConfig: newConfig })}
                        isThreeJsMode={isThreeJsMode}
                        onViewPresetClick={handleViewPresetClick}
                        stageStyle={stageStyle}
                        onStageStyleChange={setStageStyle}
                    />
                </aside>

                <main className="flex-1 flex flex-col min-w-0 relative">
                    <Stage
                        transforms={previewTransforms ?? displayedTransforms}
                        showGrid={uiState.showGrid}
                        showStageUI={uiState.showStageUI}
                        alignGridToView={uiState.alignGridToView}
                        isExploded={uiState.isExploded}
                        scene={scene}
                        isDragging={isDragging}
                        isAdjusting={isAdjusting}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onWheel={handleWheel}
                        onResetView={resetView}
                        onFocusTO={focusTO}
                        onFocusPO={focusPO}
                        onResetZoom={resetZoom}
                        currentTime={timelineState.currentTime}
                        duration={timelineState.duration}
                        fps={timelineState.fps}
                        stageElement={stageElement}
                        onStageElementChange={setStageElement}
                        onShowGridChange={(val) => setUiState(s => ({ ...s, showGrid: val }))}
                        onShowStageUIChange={(val) => setUiState(s => ({ ...s, showStageUI: val }))}
                        onAlignGridToViewChange={(val) => setUiState(s => ({ ...s, alignGridToView: val }))}
                        onExplodeToggle={() => setUiState(s => ({ ...s, isExploded: !s.isExploded }))}
                        stageElementRef={stageElementRef}
                        imageDataUrl={imageDataUrl}
                        modelDataUrl={modelDataUrl}
                        onFileChange={handleFileChange}
                        stageStyle={STAGE_STYLES[stageStyle]}
                        animationData={animationData}
                        trackControls={trackControls}
                        isPlaying={timelineState.isPlaying}
                        onChange={handleChange}
                        onAdjustStart={() => setIsAdjusting(true)}
                        onAdjustEnd={() => setIsAdjusting(false)}
                        onKeyframeToggle={onKeyframeToggle}
                        animationEngine={animationEngine}
                        willChangeString={willChangeString}
                        globalEasing={timelineState.easing}
                        gizmoMode={gizmoMode}
                        onGizmoModeChange={setGizmoMode}
                        onElementClick={handleStageElementClick}
                    />
                    <CodeOutputPanel
                        transforms={transforms}
                        height={uiState.codePanelHeight}
                        onHeightChange={(h) => setUiState(s => ({ ...s, codePanelHeight: h }))}
                        animationData={animationData}
                        timelineState={timelineStateForPanel}
                        calculateAnimatedValues={calculateAnimatedValues}
                        trackControls={trackControls}
                        stageElement={stageElement}
                        engine={animationEngine}
                    />
                </main>
            </div>

            <Timeline
                height={uiState.timelineHeight}
                onHeightChange={(h) => setUiState(s => ({ ...s, timelineHeight: h }))}
                onToggle={() => setUiState(s => ({ ...s, timelineHeight: s.timelineHeight > 37 ? 37 : 300 }))}
                animationData={animationData}
                timelineState={timelineState}
                onTimelineStateChange={handleTimelineStateChange}
                onCurrentTimeChange={onCurrentTimeChange}
                onStop={handleStop}
                onDeleteKeyframe={(property, keyframeId) => {
                    const newTrack = (animationData[property] || []).filter(kf => kf.id !== keyframeId);
                    const newAnimationData = { ...animationData };
                    if (newTrack.length === 0) {
                        delete newAnimationData[property];
                    } else {
                        newAnimationData[property] = newTrack;
                    }
                    commitChanges({ animationData: newAnimationData });
                }}
                onUpdateKeyframe={(property, keyframeId, newValues) => {
                    const newTrack = (animationData[property] || []).map(kf => kf.id === keyframeId ? { ...kf, ...newValues } : kf);
                    commitChanges({ animationData: { ...animationData, [property]: newTrack } });
                }}
                onUpdateMultipleKeyframes={(updates) => {
                    const newAnimationData = { ...animationData };
                    updates.forEach(({ property, keyframeId, newValues }) => {
                        const newTrack = (newAnimationData[property] || []).map(kf => kf.id === keyframeId ? { ...kf, ...newValues } : kf);
                        newAnimationData[property] = newTrack;
                    });
                    commitChanges({ animationData: newAnimationData });
                }}
                trackControls={trackControls}
                onTrackControlChange={(property, control) => {
                    const newTrackControls = { ...trackControls };
                    const current = newTrackControls[property] || { solo: false, mute: false };

                    if (control === 'solo') {
                        const isSoloing = !current.solo;
                        Object.keys(newTrackControls).forEach(k => {
                            if (newTrackControls[k as keyof TransformState]) {
                                newTrackControls[k as keyof TransformState]!.solo = false;
                            }
                        });
                        newTrackControls[property] = { solo: isSoloing, mute: false };
                    } else {
                        newTrackControls[property] = { ...current, mute: !current.mute, solo: false };
                    }
                    commitChanges({ trackControls: newTrackControls });
                }}
                selectedKeyframeIds={selectedKeyframeIds}
                onSelectedKeyframeIdsChange={setSelectedKeyframeIds}
                timelinePlayOnClick={timelinePlayOnClick}
                onPlayOnClickToggle={handlePlayOnClickToggle}
            />
            {uiState.showHelp && <ShortcutHelp onClose={() => setUiState(s => ({ ...s, showHelp: false }))} />}
        </div>
    );
}
