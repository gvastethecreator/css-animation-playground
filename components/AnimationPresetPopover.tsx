import React, { useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ANIMATION_PRESETS, PresetAnimationName } from '../types';
import Tooltip from './Tooltip';

interface AnimationPresetPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onPresetClick: (preset: PresetAnimationName) => void;
  onPresetHover: (preset: PresetAnimationName) => void;
  onPresetLeave: () => void;
  anchorEl: HTMLButtonElement | null;
}

const AnimationPresetPopover: React.FC<AnimationPresetPopoverProps> = ({ 
    isOpen, onClose, onPresetClick, onPresetHover, onPresetLeave, anchorEl 
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useLayoutEffect(() => {
    if (isOpen && anchorEl && popoverRef.current) {
      const anchorRect = anchorEl.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const gap = 8;

      let top = anchorRect.bottom + gap;
      let left = anchorRect.left;
      let origin = 'top left';

      // Vertical placement
      if (top + popoverRect.height > window.innerHeight && anchorRect.top - popoverRect.height - gap > 0) {
        top = anchorRect.top - popoverRect.height - gap;
        origin = 'bottom left';
      }
      
      // Horizontal placement
      if (left + popoverRect.width > window.innerWidth - gap) {
          left = window.innerWidth - popoverRect.width - gap;
      }
      if (left < gap) {
          left = gap;
      }

      setPosition({ top, left });
      popoverRef.current.style.transformOrigin = origin;

      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, anchorEl]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && anchorEl && !anchorEl.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorEl]);
  
  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      ref={popoverRef}
      className={`absolute z-[1001] w-72 p-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl transition-all duration-150 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transformOrigin: 'top left',
      }}
      onMouseDown={e => e.stopPropagation()}
      onMouseLeave={onPresetLeave}
    >
      <div className="grid grid-cols-5 gap-2">
        {(Object.keys(ANIMATION_PRESETS) as PresetAnimationName[]).map(name => {
          const preset = ANIMATION_PRESETS[name];
          return (
            <Tooltip content={name} key={name}>
              <button
                onClick={() => onPresetClick(name)}
                onMouseEnter={() => onPresetHover(name)}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg bg-zinc-800 hover:bg-indigo-600/50 transition-colors aspect-square group"
              >
                <preset.icon size={28} strokeWidth={1.5} color={preset.iconColor} className="transition-transform group-hover:scale-110" />
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>,
    document.body
  );
};

export default AnimationPresetPopover;