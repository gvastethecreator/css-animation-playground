import React from 'react';
import { Monitor, LocateFixed, ScanEye, Search } from 'lucide-react';
import Tooltip from './Tooltip';

interface CameraControlsProps {
  onResetView: () => void;
  onFocusTO: () => void;
  onFocusPO: () => void;
  onResetZoom: () => void;
}

interface ControlButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({ label, onClick, children }) => (
  <button
    aria-label={label}
    onClick={onClick}
    className="camera-control w-9 h-9 flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-400 hover:text-zinc-200 rounded-md transition-all backdrop-blur-sm shadow-lg"
  >
    {children}
  </button>
);

export default function CameraControls({ onResetView, onFocusTO, onFocusPO, onResetZoom }: CameraControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20" onMouseDown={(e) => e.stopPropagation()}>
      <Tooltip content="Reset View">
        <ControlButton label="Reset View" onClick={onResetView}>
          <Monitor size={18} strokeWidth={2} />
        </ControlButton>
      </Tooltip>
      <Tooltip content="Reset Zoom">
        <ControlButton label="Reset Zoom" onClick={onResetZoom}>
          <Search size={18} strokeWidth={2} />
        </ControlButton>
      </Tooltip>
      <Tooltip content="Focus on Transform Origin (T.O)">
        <ControlButton label="Focus on Transform Origin (T.O)" onClick={onFocusTO}>
          <LocateFixed size={18} strokeWidth={2} />
        </ControlButton>
      </Tooltip>
      <Tooltip content="Center Perspective Origin (P.O)">
        <ControlButton label="Center Perspective Origin (P.O)" onClick={onFocusPO}>
          <ScanEye size={18} strokeWidth={2} />
        </ControlButton>
      </Tooltip>
    </div>
  );
}
