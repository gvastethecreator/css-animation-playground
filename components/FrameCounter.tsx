import React from 'react';
import { Clapperboard } from 'lucide-react';
import { getTimelineFrame } from '../utils/timelineMath';

interface FrameCounterProps {
  currentTime: number;
  fps: number;
}

function FrameCounter({ currentTime, fps }: FrameCounterProps) {
  const frame = getTimelineFrame(currentTime, fps);

  return (
    <div className="absolute bottom-4 right-4 bg-zinc-950/70 backdrop-blur-sm rounded-lg p-3 text-[13px] shadow-xl text-zinc-400 font-mono z-20 pointer-events-none">
      <div className="flex items-center gap-2 mb-2">
        <Clapperboard size={16} strokeWidth={2} className="text-indigo-500" />
        <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[12px]">Playback</h3>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-right">
        <span>FRAME:</span>
        <span>{frame}</span>
        <span>FPS:</span>
        <span>{fps}</span>
      </div>
    </div>
  );
}

export default React.memo(FrameCounter);
