import React from 'react';
import { Move, Rotate3d, Scale, ChevronsRightLeft } from 'lucide-react';
import { GizmoMode } from '../types';
import Tooltip from './Tooltip';

interface TransformGizmoToolbarProps {
  gizmoMode: GizmoMode;
  onGizmoModeChange: (mode: GizmoMode) => void;
}

const tools: { mode: GizmoMode, label: string, icon: React.ElementType }[] = [
    { mode: 'translate', label: 'Translate', icon: Move },
    { mode: 'rotate', label: 'Rotate', icon: Rotate3d },
    { mode: 'scale', label: 'Scale', icon: Scale },
    { mode: 'skew', label: 'Skew', icon: ChevronsRightLeft },
];

const TransformGizmoToolbar: React.FC<TransformGizmoToolbarProps> = ({ gizmoMode, onGizmoModeChange }) => {
    return (
        <div 
            className="flex items-center gap-1 p-1 bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg"
            onMouseDown={e => e.stopPropagation()}
        >
            {tools.map(tool => (
                <Tooltip key={tool.mode} content={tool.label}>
                    <button
                        onClick={() => onGizmoModeChange(tool.mode)}
                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${
                            gizmoMode === tool.mode
                                ? 'bg-indigo-500/30 text-indigo-300'
                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                        }`}
                    >
                        <tool.icon size={18} strokeWidth={2} />
                    </button>
                </Tooltip>
            ))}
        </div>
    );
};

export default TransformGizmoToolbar;