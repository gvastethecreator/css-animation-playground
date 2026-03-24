import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Tooltip from './Tooltip';

interface FloatingPanelProps {
  title: string;
  children: React.ReactNode;
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!children) return null;

  return (
    <div
      className="absolute top-20 left-4 z-20 w-64 bg-zinc-950/80 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Tooltip content={isOpen ? 'Collapse' : 'Expand'}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center w-full px-3 py-1.5 text-left text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {isOpen ? (
            <ChevronDown size={16} className="mr-2 opacity-70" />
          ) : (
            <ChevronRight size={16} className="mr-2 opacity-70" />
          )}
          <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[12px]">{title}</h3>
        </button>
      </Tooltip>
      {isOpen && <div className="px-3 pb-3 pt-2 space-y-3 border-t border-zinc-800">{children}</div>}
    </div>
  );
};

export default FloatingPanel;
