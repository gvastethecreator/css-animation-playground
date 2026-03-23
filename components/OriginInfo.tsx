import React from 'react';
import { LocateFixed, ScanEye } from 'lucide-react';

interface OriginInfoProps {
  transformOriginX: number;
  transformOriginY: number;
  transformOriginZ: number;
  perspectiveOriginX: number;
  perspectiveOriginY: number;
}

export default function OriginInfo({ 
    transformOriginX, 
    transformOriginY, 
    transformOriginZ,
    perspectiveOriginX,
    perspectiveOriginY 
}: OriginInfoProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950/70 backdrop-blur-sm rounded-lg p-2 text-[13px] shadow-xl text-zinc-400 font-mono z-20 pointer-events-none flex items-center gap-4">
      <div className="flex items-center gap-2">
        <LocateFixed size={16} strokeWidth={2} className="text-yellow-400 shrink-0" />
        <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[12px] whitespace-nowrap">T.O:</h3>
        <div className="flex items-center gap-3 text-right">
          <span className="text-zinc-500">X:<span className="text-zinc-300 ml-1">{transformOriginX.toFixed(0)}%</span></span>
          <span className="text-zinc-500">Y:<span className="text-zinc-300 ml-1">{transformOriginY.toFixed(0)}%</span></span>
          <span className="text-zinc-500">Z:<span className="text-zinc-300 ml-1">{transformOriginZ.toFixed(0)}px</span></span>
        </div>
      </div>
      <div className="h-4 w-px bg-zinc-700" />
      <div className="flex items-center gap-2">
        <ScanEye size={16} strokeWidth={2} className="text-cyan-400 shrink-0" />
        <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[12px] whitespace-nowrap">P.O:</h3>
        <div className="flex items-center gap-3 text-right">
          <span className="text-zinc-500">X:<span className="text-zinc-300 ml-1">{perspectiveOriginX.toFixed(0)}%</span></span>
          <span className="text-zinc-500">Y:<span className="text-zinc-300 ml-1">{perspectiveOriginY.toFixed(0)}%</span></span>
        </div>
      </div>
    </div>
  );
}