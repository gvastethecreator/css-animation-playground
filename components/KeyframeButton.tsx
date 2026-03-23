import React from 'react';
import Tooltip from './Tooltip';

interface KeyframeButtonProps {
  onClick: () => void;
  isAnimated: boolean;
  hasKeyframeAtCurrentTime: boolean;
  color?: string;
}

export default function KeyframeButton({ onClick, isAnimated, hasKeyframeAtCurrentTime, color = '#818cf8' /* indigo-400 */ }: KeyframeButtonProps) {
    const title = hasKeyframeAtCurrentTime ? 'Remove keyframe at this time' : 'Add keyframe at this time';

    const baseClasses = "w-2.5 h-2.5 rounded-sm transition-all transform rotate-45";
    let style: React.CSSProperties = {
      backgroundColor: '#3f3f46', // zinc-700
      transition: 'all 150ms ease-in-out',
    };

    if (isAnimated) {
        style.backgroundColor = `${color}66`; // color with 40% opacity
    }
    if (hasKeyframeAtCurrentTime) {
        style.backgroundColor = color;
        style.transform = 'rotate(45deg) scale(1.1)';
    }

  return (
    <Tooltip content={title}>
      <button onClick={onClick} className="flex items-center justify-center w-4 h-4 rounded-full group">
          <div 
              className={`${baseClasses} group-hover:!bg-[${color}]`}
              style={style} 
          />
      </button>
    </Tooltip>
  );
}
