import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import Tooltip from './Tooltip';

interface ShortcutHelpProps {
  onClose: () => void;
}

function isMacPlatform(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

const ShortcutHelp: React.FC<ShortcutHelpProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modifier = isMacPlatform() ? '⌘' : 'Ctrl';
  const shift = isMacPlatform() ? '⇧' : 'Shift';

  const shortcuts = useMemo(
    () => [
      {
        section: 'Playback',
        items: [
          { keys: ['Space'], description: 'Play / Pause animation' },
          { keys: ['←', ','], description: 'Previous frame' },
          { keys: ['→', '.'], description: 'Next frame' },
          { keys: ['Home'], description: 'Go to start' },
          { keys: ['End'], description: 'Go to end' },
          { keys: ['L'], description: 'Toggle loop' },
        ],
      },
      {
        section: 'Timeline',
        items: [
          { keys: ['Shift', '+ Drag'], description: 'Marquee select keyframes' },
          { keys: ['Shift', '+ Click'], description: 'Add/remove keyframe from selection' },
          { keys: ['Right Click'], description: 'Delete a keyframe' },
        ],
      },
      {
        section: 'General',
        items: [
          { keys: [modifier, '+', 'Z'], description: 'Undo last action' },
          { keys: [modifier, '+', shift, '+', 'Z'], description: 'Redo last action' },
          { keys: [modifier, '+', 'Y'], description: 'Redo last action' },
          { keys: ['?'], description: 'Open keyboard shortcuts' },
        ],
      },
    ],
    [modifier, shift],
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusable = [
        ...modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((node) => !node.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] backdrop-blur-sm">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-help-title"
        className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative"
      >
        <h2 id="shortcut-help-title" className="text-xl font-bold mb-6">
          Keyboard Shortcuts
        </h2>
        <Tooltip content="Close (Esc)">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </Tooltip>
        <div className="space-y-4">
          {shortcuts.map((group) => (
            <div key={group.section}>
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">{group.section}</h3>
              <div className="space-y-3">
                {group.items.map((shortcut) => (
                  <div
                    key={shortcut.description + shortcut.keys.join('')}
                    className="flex items-center justify-between text-zinc-300"
                  >
                    <span>{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, kIndex) => (
                        <kbd
                          key={`${key}-${kIndex}`}
                          className="px-2 py-1 text-sm font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-md min-w-[24px] text-center"
                        >
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
    document.body,
  );
};

export default ShortcutHelp;
