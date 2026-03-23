import React from 'react';
import { Video } from 'lucide-react';

interface CameraInfoProps {
  translateX: number;
  translateY: number;
  translateZ: number;
}

export default function CameraInfo({ translateX, translateY, translateZ }: CameraInfoProps) {
  return (
    <div className="absolute top-4 right-4 bg-zinc-950/70 backdrop-blur-sm rounded-lg p-3 text-[13px] shadow-xl text-zinc-400 font-mono z-20 pointer-events-none">
      <div className="flex items-center gap-2 mb-2">
        <Video size={16} strokeWidth={2} className="text-indigo-500" />
        <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[12px]">Camera Offset</h3>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-right">
        <span>X:</span><span>{translateX.toFixed(1)}px</span>
        <span>Y:</span><span>{translateY.toFixed(1)}px</span>
        <span>Z:</span><span>{translateZ.toFixed(1)}px</span>
      </div>
    </div>
  );
}