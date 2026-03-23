
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Tooltip from './Tooltip';

interface ControlGroupProps {
  title: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}

export default function ControlGroup({ title, children, defaultOpen = true }: ControlGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <Tooltip content={isOpen ? 'Collapse Group' : 'Expand Group'}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center w-full px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-200 transition-colors text-left bg-zinc-900/30 hover:bg-zinc-800/50 rounded-lg group"
        >
          {isOpen ? (
            <ChevronDown size={14} className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          ) : (
            <ChevronRight size={14} className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          )}
          {title}
        </button>
      </Tooltip>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-3 pb-3 pt-1.5 space-y-3">
            {children}
        </div>
      </div>
    </div>
  );
}
