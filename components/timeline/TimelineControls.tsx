
import React, { useState, useRef } from 'react';
import { Play, Pause, Rewind, RotateCw, Shuffle, StepBack, StepForward, Square, MousePointerClick } from 'lucide-react';
import DraggableInput from './DraggableInput';
import { EasingName } from '../../types';
import Tooltip from '../Tooltip';
import EasingEditor from './EasingEditor';
import EasingCurve from './EasingCurve';


interface TimelineControlsProps {
    timelineState: {
        currentTime: number;
        duration: number;
        isPlaying: boolean;
        isLooping: boolean;
        direction: 'normal' | 'alternate';
        easing: EasingName | string;
        fps: number;
    };
    onTimelineStateChange: React.Dispatch<React.SetStateAction<TimelineControlsProps['timelineState']>>;
    onStop: () => void;
    playOnClick: boolean;
    onPlayOnClickChange: () => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({ timelineState, onTimelineStateChange, onStop, playOnClick, onPlayOnClickChange }) => {
    const [easingEditorAnchor, setEasingEditorAnchor] = useState<HTMLButtonElement | null>(null);
    
    const togglePlay = () => onTimelineStateChange(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    const rewind = () => onTimelineStateChange(prev => ({ ...prev, currentTime: 0 }));
    const toggleLoop = () => onTimelineStateChange(prev => ({ ...prev, isLooping: !prev.isLooping }));
    const toggleDirection = () => onTimelineStateChange(prev => ({ ...prev, direction: prev.direction === 'normal' ? 'alternate' : 'normal' }));

    const nextFrame = () => onTimelineStateChange(prev => ({ ...prev, currentTime: Math.min(prev.duration, prev.currentTime + 1000 / prev.fps) }));
    const prevFrame = () => onTimelineStateChange(prev => ({ ...prev, currentTime: Math.max(0, prev.currentTime - 1000 / prev.fps) }));
    
    const handleEasingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setEasingEditorAnchor(prev => prev ? null : event.currentTarget);
    };

    const iconBtnClass = "p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors";
    const activeIconBtnClass = "p-1.5 rounded-md text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 transition-colors";

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <Tooltip content="Rewind (Home)">
                    <button onClick={rewind} className={iconBtnClass}><Rewind size={14} strokeWidth={2} /></button>
                </Tooltip>
                <Tooltip content="Previous Frame (← or ,)">
                    <button onClick={prevFrame} className={iconBtnClass}><StepBack size={14} strokeWidth={2} /></button>
                </Tooltip>
                <Tooltip content={timelineState.isPlaying ? "Pause (Space)" : "Play (Space)"}>
                    <button onClick={togglePlay} className={`mx-1 p-1.5 rounded-md flex items-center justify-center w-8 h-7 ${timelineState.isPlaying ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 hover:text-white'}`}>
                        {timelineState.isPlaying ? <Pause size={14} strokeWidth={2} fill="currentColor" /> : <Play size={14} strokeWidth={2} fill="currentColor" className="ml-0.5" />}
                    </button>
                </Tooltip>
                <Tooltip content="Next Frame (→ or .)">
                    <button onClick={nextFrame} className={iconBtnClass}><StepForward size={14} strokeWidth={2} /></button>
                </Tooltip>
                <Tooltip content="Stop">
                    <button onClick={onStop} className={iconBtnClass}><Square size={14} strokeWidth={2} /></button>
                </Tooltip>
            </div>
            
            <div className="w-px h-5 bg-zinc-800" />
            
            <div className="flex items-center gap-2">
                <Tooltip content={`Loop: ${timelineState.isLooping ? 'ON' : 'OFF'} (L)`}>
                    <button onClick={toggleLoop} className={timelineState.isLooping ? activeIconBtnClass : iconBtnClass}>
                        <RotateCw size={15} strokeWidth={2} />
                    </button>
                </Tooltip>
                <Tooltip content={`Direction: ${timelineState.direction}`}>
                    <button onClick={toggleDirection} className={timelineState.direction === 'alternate' ? activeIconBtnClass : iconBtnClass}>
                        <Shuffle size={15} strokeWidth={2} />
                    </button>
                </Tooltip>
                 <Tooltip content={`Play on Click: ${playOnClick ? 'ON' : 'OFF'}`}>
                    <button onClick={onPlayOnClickChange} className={playOnClick ? activeIconBtnClass : iconBtnClass}>
                        <MousePointerClick size={15} strokeWidth={2} />
                    </button>
                </Tooltip>
            </div>
            
             <div className="w-px h-5 bg-zinc-800" />
             
             <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-500">
                <DraggableInput
                    value={timelineState.duration / 1000}
                    onChange={v => onTimelineStateChange(p => ({ ...p, duration: v * 1000 }))}
                    min={0.1} max={60} step={0.1}
                    className="w-24 bg-zinc-900 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
                    title="Duration (s)"
                >
                    <span className="pl-2 text-zinc-500">Dur:</span>
                </DraggableInput>
                <DraggableInput
                    value={timelineState.fps}
                    onChange={v => onTimelineStateChange(p => ({ ...p, fps: Math.round(v) }))}
                    min={1} max={120} step={1}
                    className="w-20 bg-zinc-900 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
                    title="Frames Per Second (FPS)"
                >
                     <span className="pl-2 text-zinc-500">FPS:</span>
                </DraggableInput>
                
                <div className="w-px h-5 bg-zinc-800" />
                
                <div>
                    <Tooltip content="Set Global Animation Easing">
                        <button
                            onClick={handleEasingClick}
                            className="w-8 h-7 flex items-center justify-center bg-zinc-900 rounded-md border border-zinc-800 hover:border-zinc-600 transition-colors"
                        >
                            <EasingCurve easing={timelineState.easing} width={20} height={20} color="#818cf8" />
                        </button>
                    </Tooltip>
                </div>
            </div>
            {!!easingEditorAnchor && (
                <EasingEditor
                    easing={timelineState.easing}
                    onEasingChange={(newEasing) => {
                        onTimelineStateChange(p => ({ ...p, easing: newEasing }));
                    }}
                    color="#818cf8"
                    onClose={() => setEasingEditorAnchor(null)}
                    anchorEl={easingEditorAnchor}
                />
            )}
        </div>
    );
};

export default React.memo(TimelineControls);
