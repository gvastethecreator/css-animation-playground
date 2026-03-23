import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import Tooltip from './Tooltip';

interface ShortcutHelpProps {
  onClose: () => void;
}

const shortcuts = [
    { section: 'Playback', items: [
        { keys: ['Space'], description: 'Play / Pause animation' },
        { keys: ['←', ','], description: 'Previous frame' },
        { keys: ['→', '.'], description: 'Next frame' },
        { keys: ['Home'], description: 'Go to start' },
        { keys: ['End'], description: 'Go to end' },
        { keys: ['L'], description: 'Toggle loop' },
    ]},
    { section: 'Timeline', items: [
        { keys: ['Shift', '+ Drag'], description: 'Marquee select keyframes' },
        { keys: ['Shift', '+ Click'], description: 'Add/remove keyframe from selection' },
        { keys: ['Right Click'], description: 'Delete a keyframe' },
    ]},
    { section: 'General', items: [
        { keys: ['⌘', '+', 'Z'], description: 'Undo last action' },
        { keys: ['⌘', '+', '⇧', '+', 'Z'], description: 'Redo last action' },
    ]},
];


const ShortcutHelp: React.FC<ShortcutHelpProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] backdrop-blur-sm">
      <div ref={modalRef} className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-6">Keyboard Shortcuts</h2>
        <Tooltip content="Close (Esc)">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-zinc-200">
            <X size={20} />
          </button>
        </Tooltip>
        <div className="space-y-4">
          {shortcuts.map((group, index) => (
            <div key={index}>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">{group.section}</h3>
                <div className="space-y-3">
                {group.items.map((shortcut, sIndex) => (
                    <div key={sIndex} className="flex items-center justify-between text-zinc-300">
                    <span>{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, kIndex) => (
                        <kbd key={kIndex} className="px-2 py-1 text-sm font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-md min-w-[24px] text-center">
                            {key}
                        </kbd>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShortcutHelp;