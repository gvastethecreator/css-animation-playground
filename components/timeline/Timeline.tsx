import React, { useRef, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { AnimationData, TransformState, Keyframe, EasingValue, PROPERTY_COLORS, TrackControlState } from '../../types';
import { ChevronDown, ChevronUp, Film, GripHorizontal, Ear, Power, Rewind, Play, Pause, Square } from 'lucide-react';
import TimelineRuler from './TimelineRuler';
import EasingEditor from './EasingEditor';
import TimelineControls from './TimelineControls';
import EasingCurve from './EasingCurve';
import CondensedTimelineView from './CondensedTimelineView';
import Tooltip from '../Tooltip';

interface TimelineProps {
    height: number;
    onHeightChange: (height: number) => void;
    onToggle: () => void;
    animationData: AnimationData;
    timelineState: {
        currentTime: number;
        duration: number;
        isPlaying: boolean;
        isLooping: boolean;
        direction: 'normal' | 'alternate';
        easing: EasingValue;
        fps: number;
    };
    onTimelineStateChange: React.Dispatch<React.SetStateAction<TimelineProps['timelineState']>>;
    onCurrentTimeChange: (time: number) => void;
    onStop: () => void;
    onDeleteKeyframe: (property: keyof TransformState, keyframeId: string) => void;
    onUpdateKeyframe: (property: keyof TransformState, keyframeId: string, newValues: Partial<Keyframe>) => void;
    onUpdateMultipleKeyframes: (
        updates: { property: keyof TransformState; keyframeId: string; newValues: Partial<Keyframe> }[],
    ) => void;
    trackControls: Partial<Record<keyof TransformState, TrackControlState>>;
    onTrackControlChange: (property: keyof TransformState, control: 'solo' | 'mute') => void;
    selectedKeyframeIds: Set<string>;
    onSelectedKeyframeIdsChange: (ids: Set<string>) => void;
    timelinePlayOnClick: boolean;
    onPlayOnClickToggle: () => void;
}

const formatTime = (ms: number) => (ms / 1000).toFixed(2) + 's';

function Timeline({
    height,
    onHeightChange,
    onToggle,
    animationData,
    timelineState,
    onTimelineStateChange,
    onCurrentTimeChange,
    onStop,
    onDeleteKeyframe,
    onUpdateKeyframe,
    onUpdateMultipleKeyframes,
    trackControls,
    onTrackControlChange,
    selectedKeyframeIds,
    onSelectedKeyframeIdsChange,
    timelinePlayOnClick,
    onPlayOnClickToggle,
}: TimelineProps) {
    const trackAreaRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const labelsContainerRef = useRef<HTMLDivElement>(null);
    const zoomContextRef = useRef<{ timeAtCursor: number; cursorPx: number } | null>(null);

    const [isScrubbing, setIsScrubbing] = useState(false);
    const [pixelsPerMs, setPixelsPerMs] = useState(0.1);
    const [activeKeyframe, setActiveKeyframe] = useState<{
        property: keyof TransformState;
        keyframe: Keyframe;
        anchorEl: HTMLButtonElement;
    } | null>(null);
    const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

    const [dragState, setDragState] = useState<{
        startX: number;
        keyframes: { prop: keyof TransformState; kf: Keyframe; initialTime: number }[];
    } | null>(null);

    const animatedProperties = useMemo(
        () => Object.keys(animationData).sort() as (keyof TransformState)[],
        [animationData],
    );
    const isOpen = height > 37;

    const totalTrackWidth = Math.max(100, timelineState.duration * pixelsPerMs);

    const timeToPx = useCallback((time: number) => time * pixelsPerMs, [pixelsPerMs]);
    const pxToTime = useCallback((px: number) => px / pixelsPerMs, [pixelsPerMs]);

    // Helper for snapping
    const getSnappedTime = useCallback(
        (rawTime: number, snapThresholdPx: number = 10): number => {
            const snapThresholdMs = snapThresholdPx / pixelsPerMs;

            // 1. Snap to Start/End
            if (Math.abs(rawTime - 0) < snapThresholdMs) return 0;
            if (Math.abs(rawTime - timelineState.duration) < snapThresholdMs) return timelineState.duration;

            // 2. Snap to other Keyframes
            let closestDist = Infinity;
            let closestTime = rawTime;

            for (const track of Object.values(animationData)) {
                for (const kf of track || []) {
                    const dist = Math.abs(rawTime - kf.time);
                    if (dist < snapThresholdMs && dist < closestDist) {
                        closestDist = dist;
                        closestTime = kf.time;
                    }
                }
            }

            if (closestDist !== Infinity) return closestTime;

            // 3. Snap to grid (100ms major ticks)
            const gridSnap = Math.round(rawTime / 100) * 100;
            if (Math.abs(rawTime - gridSnap) < snapThresholdMs) return gridSnap;

            return rawTime;
        },
        [animationData, timelineState.duration, timelineState.fps, pixelsPerMs],
    );

    useLayoutEffect(() => {
        if (zoomContextRef.current && trackAreaRef.current && scrollContainerRef.current) {
            const { timeAtCursor, cursorPx } = zoomContextRef.current;
            const newScrollLeft = timeToPx(timeAtCursor) - cursorPx;
            scrollContainerRef.current.scrollLeft = newScrollLeft;
            zoomContextRef.current = null;
        }
    }, [pixelsPerMs, timeToPx]);

    const handleWheelZoom = useCallback(
        (e: React.WheelEvent) => {
            if (!e.ctrlKey) return;
            e.preventDefault();

            if (!trackAreaRef.current || !scrollContainerRef.current) return;

            const rect = trackAreaRef.current.getBoundingClientRect();
            const cursorPx = e.clientX - rect.left;

            const timeAtCursor = pxToTime(cursorPx);
            zoomContextRef.current = { timeAtCursor, cursorPx };

            const zoomFactor = 1 - e.deltaY * 0.001;
            const newPixelsPerMs = Math.max(0.01, Math.min(2.0, pixelsPerMs * zoomFactor));

            setPixelsPerMs(newPixelsPerMs);
        },
        [pxToTime, pixelsPerMs],
    );

    const handleScrubberInteraction = useCallback(
        (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
            if (!trackAreaRef.current) return;
            const rect = trackAreaRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            let newTime = pxToTime(clickX);
            newTime = Math.max(0, Math.min(timelineState.duration, newTime));

            if (e.shiftKey) {
                // Hard snap to frames with Shift
                const frameDuration = 1000 / timelineState.fps;
                newTime = Math.round(newTime / frameDuration) * frameDuration;
            } else {
                // Magnetic snap without Shift
                newTime = getSnappedTime(newTime);
            }

            onCurrentTimeChange(newTime);
            setActiveKeyframe(null);
        },
        [onCurrentTimeChange, timelineState.duration, timelineState.fps, pxToTime, getSnappedTime],
    );

    const handlePlayheadMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (timelineState.isPlaying) onTimelineStateChange((p) => ({ ...p, isPlaying: false }));

        const handleMouseMove = (moveEvent: MouseEvent) => handleScrubberInteraction(moveEvent);
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (
            e.target !== trackAreaRef.current &&
            (e.target as HTMLElement).parentElement?.parentElement !== trackAreaRef.current
        )
            return;

        setIsScrubbing(true);
        handleScrubberInteraction(e);

        const rect = trackAreaRef.current!.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (isScrubbing) {
                handleScrubberInteraction(moveEvent);
            } else {
                setSelectionBox({
                    x1: startX,
                    y1: startY,
                    x2: moveEvent.clientX - rect.left,
                    y2: moveEvent.clientY - rect.top,
                });
            }
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            setIsScrubbing(false);
            if (selectionBox) {
                const newSelectedIds = new Set<string>();
                const { x1, y1, x2, y2 } = selectionBox;
                const [xMin, xMax] = [Math.min(x1, x2), Math.max(x1, x2)];
                const [yMin, yMax] = [Math.min(y1, y2), Math.max(y1, y2)];

                const keyframeEls = document.querySelectorAll('[data-keyframe-id]');
                keyframeEls.forEach((el) => {
                    const id = el.getAttribute('data-keyframe-id');
                    if (!id) return;
                    const elRect = el.getBoundingClientRect();
                    const kfX = elRect.left - rect.left + elRect.width / 2;
                    const kfY = elRect.top - rect.top + elRect.height / 2;
                    if (kfX >= xMin && kfX <= xMax && kfY >= yMin && kfY <= yMax) {
                        newSelectedIds.add(id);
                    }
                });
                onSelectedKeyframeIdsChange(
                    upEvent.shiftKey ? new Set([...selectedKeyframeIds, ...newSelectedIds]) : newSelectedIds,
                );
            }
            setSelectionBox(null);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        if (e.shiftKey) {
            setIsScrubbing(false);
        } else {
            onSelectedKeyframeIdsChange(new Set());
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleKeyframeMouseDown = (e: React.MouseEvent, prop: keyof TransformState, kf: Keyframe) => {
        e.stopPropagation();
        if (e.button !== 0) return;

        if (e.shiftKey) {
            const newIds = new Set(selectedKeyframeIds);
            if (newIds.has(kf.id)) {
                newIds.delete(kf.id);
            } else {
                newIds.add(kf.id);
            }
            onSelectedKeyframeIdsChange(newIds);
            return;
        }

        if (!selectedKeyframeIds.has(kf.id)) onSelectedKeyframeIdsChange(new Set([kf.id]));

        const idsToDrag = selectedKeyframeIds.has(kf.id) ? selectedKeyframeIds : new Set([kf.id]);

        const selectedKeyframes: { prop: keyof TransformState; kf: Keyframe; initialTime: number }[] = [];
        idsToDrag.forEach((id) => {
            for (const [p, track] of Object.entries(animationData)) {
                const keyframe = (track as Keyframe[])?.find((k) => k.id === id);
                if (keyframe) {
                    selectedKeyframes.push({ prop: p as keyof TransformState, kf: keyframe, initialTime: keyframe.time });
                }
            }
        });

        if (selectedKeyframes.length === 0) return;

        setDragState({ startX: e.clientX, keyframes: selectedKeyframes });
        setActiveKeyframe(null);
        document.body.style.cursor = 'grabbing';

        const handleMouseMove = (moveEvent: MouseEvent) => {
            setDragState((currentDragState) => {
                if (!currentDragState) return null;

                const pixelDelta = moveEvent.clientX - currentDragState.startX;
                const timeDelta = pxToTime(pixelDelta);

                const minTimeInSelection = Math.min(...currentDragState.keyframes.map((k) => k.initialTime));
                const allowedTimeDelta = Math.max(-minTimeInSelection, timeDelta);

                const updates = currentDragState.keyframes.map(({ prop, kf, initialTime }) => {
                    let newTime = initialTime + allowedTimeDelta;

                    if (moveEvent.shiftKey) {
                        const frameDuration = 1000 / timelineState.fps;
                        newTime = Math.round(newTime / frameDuration) * frameDuration;
                    } else if (currentDragState.keyframes.length === 1) {
                        // Magnetic snap if dragging single keyframe
                        newTime = getSnappedTime(newTime);
                    }

                    return { property: prop, keyframeId: kf.id, newValues: { time: newTime } };
                });
                onUpdateMultipleKeyframes(updates);
                return currentDragState;
            });
        };

        const handleMouseUp = () => {
            setDragState(null);
            document.body.style.cursor = 'default';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            const startY = e.clientY;
            const startHeight = height;
            const handleMouseMove = (moveEvent: MouseEvent) =>
                onHeightChange(Math.min(Math.max(startHeight + (startY - moveEvent.clientY), 100), 600));
            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [height, onHeightChange],
    );

    const handleScroll = () => {
        if (labelsContainerRef.current && scrollContainerRef.current)
            labelsContainerRef.current.scrollTop = scrollContainerRef.current.scrollTop;
    };

    const handleCloseEditor = useCallback(() => {
        setActiveKeyframe(null);
    }, []);

    const togglePlay = () => onTimelineStateChange((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    const rewind = () => onCurrentTimeChange(0);

    return (
        <div
            className="glass-panel flex flex-col shrink-0 overflow-hidden transition-[height] duration-300 ease-in-out border-t border-zinc-700/50 shadow-2xl z-20"
            style={{ height: `${height}px` }}
        >
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/50 border-b border-zinc-800">
                <Tooltip content={isOpen ? 'Collapse Timeline' : 'Expand Timeline'}>
                    <button
                        onClick={onToggle}
                        className="flex items-center gap-2 text-[13px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        <Film size={16} strokeWidth={2} className="text-indigo-400" />
                        Animation Timeline
                    </button>
                </Tooltip>
                {isOpen ? (
                    <TimelineControls
                        timelineState={timelineState}
                        onTimelineStateChange={onTimelineStateChange}
                        onStop={onStop}
                        playOnClick={timelinePlayOnClick}
                        onPlayOnClickChange={onPlayOnClickToggle}
                    />
                ) : (
                    <div className="flex-1 flex items-center gap-4 mx-4">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={rewind}
                                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400"
                                title="Rewind (Home)"
                            >
                                <Rewind size={16} strokeWidth={2} />
                            </button>
                            <button
                                onClick={togglePlay}
                                className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/40 transition-colors"
                                title={timelineState.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                            >
                                {timelineState.isPlaying ? <Pause size={16} strokeWidth={2} /> : <Play size={16} strokeWidth={2} />}
                            </button>
                            <button onClick={onStop} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400" title="Stop">
                                <Square size={16} strokeWidth={2} />
                            </button>
                        </div>
                        <div className="flex-1">
                            <CondensedTimelineView
                                animationData={animationData}
                                duration={timelineState.duration}
                                currentTime={timelineState.currentTime}
                                isPlaying={timelineState.isPlaying}
                                easing={timelineState.easing}
                                onCurrentTimeChange={onCurrentTimeChange}
                                fps={timelineState.fps}
                            />
                        </div>
                    </div>
                )}
                <Tooltip content={isOpen ? 'Collapse' : 'Expand'}>
                    <button onClick={onToggle} className="text-zinc-500 hover:text-zinc-300">
                        {isOpen ? <ChevronDown size={18} strokeWidth={2} /> : <ChevronUp size={18} strokeWidth={2} />}
                    </button>
                </Tooltip>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-zinc-950">
                <Tooltip content="Resize Timeline">
                    <div
                        onMouseDown={handleResizeMouseDown}
                        className="group w-full h-1.5 flex items-center justify-center cursor-row-resize bg-zinc-950/50 border-b border-zinc-900"
                    >
                        <GripHorizontal
                            size={14}
                            strokeWidth={2}
                            className="text-zinc-700 group-hover:text-zinc-500 transition-colors"
                        />
                    </div>
                </Tooltip>

                <div className="flex-1 flex relative overflow-hidden">
                    <div
                        ref={labelsContainerRef}
                        className="w-48 bg-zinc-900/30 z-10 overflow-hidden pt-4 shrink-0 border-r border-zinc-800 shadow-[2px_0_10px_rgba(0,0,0,0.3)] backdrop-blur-sm"
                    >
                        {animatedProperties.map((prop) => {
                            const controls = trackControls[prop] || { solo: false, mute: false };
                            const isAnyTrackSoloed = Object.values(trackControls).some((c) => c.solo);
                            const trackOpacity = (isAnyTrackSoloed && !controls.solo) || controls.mute ? 'opacity-40' : 'opacity-100';
                            return (
                                <div
                                    key={prop}
                                    className={`group h-8 flex items-center px-3 border-b border-zinc-800/50 transition-opacity ${trackOpacity}`}
                                    title={prop}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]"
                                        style={{ backgroundColor: PROPERTY_COLORS[prop] || '#fff', color: PROPERTY_COLORS[prop] || '#fff' }}
                                    ></div>
                                    <span className="ml-2.5 text-[11px] text-zinc-400 font-medium truncate tracking-wide">{prop}</span>
                                    <div className="ml-auto flex items-center gap-1.5 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Tooltip content="Solo">
                                            <button
                                                onClick={() => onTrackControlChange(prop, 'solo')}
                                                className={`p-1 rounded ${controls.solo ? 'bg-yellow-500/20 text-yellow-400' : 'text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300'}`}
                                            >
                                                <Ear size={12} strokeWidth={2} />
                                            </button>
                                        </Tooltip>
                                        <Tooltip content="Mute">
                                            <button
                                                onClick={() => onTrackControlChange(prop, 'mute')}
                                                className={`p-1 rounded ${controls.mute ? 'bg-red-500/20 text-red-400' : 'text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300'}`}
                                            >
                                                <Power size={12} strokeWidth={2} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div
                        ref={scrollContainerRef}
                        className="flex-1 relative overflow-auto custom-scrollbar bg-zinc-950 shadow-inner-depth"
                        onScroll={handleScroll}
                    >
                        <div className="relative h-full" style={{ width: `${totalTrackWidth}px`, minWidth: '100%' }}>
                            <div
                                ref={trackAreaRef}
                                className="absolute top-0 left-0 w-full h-full"
                                onMouseDown={handleTimelineMouseDown}
                                onWheel={handleWheelZoom}
                            >
                                <div className="relative w-full h-full pt-4">
                                    <TimelineRuler duration={timelineState.duration} pixelsPerMs={pixelsPerMs} />
                                    <div className="w-full">
                                        {animatedProperties.map((prop) => {
                                            const controls = trackControls[prop] || { solo: false, mute: false };
                                            const isAnyTrackSoloed = Object.values(trackControls).some((c) => c.solo);
                                            const trackOpacity =
                                                (isAnyTrackSoloed && !controls.solo) || controls.mute ? 'opacity-30' : 'opacity-100';
                                            return (
                                                <div
                                                    key={prop}
                                                    className={`h-8 border-b border-zinc-800/30 relative transition-opacity ${trackOpacity} hover:bg-zinc-800/20`}
                                                >
                                                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-zinc-800/50" />
                                                    {animationData[prop]?.map((kf, index, arr) => (
                                                        <div
                                                            key={`${kf.id}-curve`}
                                                            className="absolute top-0 h-full pointer-events-none opacity-40"
                                                            style={{
                                                                left: `${timeToPx(kf.time)}px`,
                                                                width: `${timeToPx(arr[index + 1]?.time || kf.time) - timeToPx(kf.time)}px`,
                                                            }}
                                                        >
                                                            <EasingCurve
                                                                easing={kf.easing ?? 'linear'}
                                                                width={timeToPx(arr[index + 1]?.time || kf.time) - timeToPx(kf.time)}
                                                                height={32}
                                                                color={PROPERTY_COLORS[prop] || '#fff'}
                                                            />
                                                        </div>
                                                    ))}
                                                    {animationData[prop]?.map((kf) => (
                                                        <Tooltip
                                                            key={kf.id}
                                                            content={
                                                                <>
                                                                    Time: {formatTime(kf.time)}
                                                                    <br />
                                                                    Easing: {kf.easing}
                                                                </>
                                                            }
                                                        >
                                                            <button
                                                                data-keyframe-id={kf.id}
                                                                className="absolute top-1/2 w-3 h-3 rounded-sm z-10 transition-transform hover:scale-125 cursor-pointer shadow-[0_0_5px_rgba(0,0,0,0.5)] border border-black/20"
                                                                style={{
                                                                    left: `${timeToPx(kf.time)}px`,
                                                                    transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
                                                                    backgroundColor: PROPERTY_COLORS[prop] || '#fff',
                                                                    outline: selectedKeyframeIds.has(kf.id) ? '2px solid white' : 'none',
                                                                }}
                                                                onMouseDown={(e) => handleKeyframeMouseDown(e, prop, kf)}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (dragState) return;
                                                                    onCurrentTimeChange(kf.time);
                                                                    setActiveKeyframe({ property: prop, keyframe: kf, anchorEl: e.currentTarget });
                                                                }}
                                                                onContextMenu={(e) => {
                                                                    e.preventDefault();
                                                                    onDeleteKeyframe(prop, kf.id);
                                                                    setActiveKeyframe(null);
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Tooltip content={`Scrub to ${formatTime(timelineState.currentTime)}`}>
                                        <div
                                            className="absolute top-0 bottom-0 w-4 z-20 -translate-x-1/2 cursor-ew-resize group"
                                            style={{ left: `${timeToPx(timelineState.currentTime)}px` }}
                                            onMouseDown={handlePlayheadMouseDown}
                                        >
                                            <div className="absolute top-4 bottom-0 left-1/2 w-px -translate-x-1/2 bg-red-500 pointer-events-none transition-all shadow-[0_0_10px_rgba(239,68,68,0.5)] group-hover:w-0.5" />
                                            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3 h-3.5 bg-red-500 rounded-sm transform rotate-180 border-2 border-zinc-950 pointer-events-none shadow-md z-30" />
                                        </div>
                                    </Tooltip>
                                    {selectionBox && (
                                        <div
                                            className="absolute top-0 left-0 bg-indigo-500/10 border border-indigo-400/50 pointer-events-none z-30 backdrop-blur-[1px]"
                                            style={{
                                                left: Math.min(selectionBox.x1, selectionBox.x2),
                                                top: Math.min(selectionBox.y1, selectionBox.y2),
                                                width: Math.abs(selectionBox.x2 - selectionBox.x1),
                                                height: Math.abs(selectionBox.y2 - selectionBox.y1),
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {activeKeyframe && (
                    <EasingEditor
                        key={activeKeyframe.keyframe.id}
                        easing={activeKeyframe.keyframe.easing}
                        onEasingChange={(newEasing) =>
                            onUpdateKeyframe(activeKeyframe.property, activeKeyframe.keyframe.id, { easing: newEasing })
                        }
                        color={PROPERTY_COLORS[activeKeyframe.property] || '#fff'}
                        onClose={handleCloseEditor}
                        anchorEl={activeKeyframe.anchorEl}
                    />
                )}
            </div>
        </div>
    );
}

export default React.memo(Timeline);
