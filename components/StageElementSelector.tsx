import React from 'react';
import { StageElement } from '../types';
import { Square, Type, GalleryVertical, Image as ImageIcon, VenetianMask } from 'lucide-react';
import Tooltip from './Tooltip';

interface StageElementSelectorProps {
  selectedElement: StageElement;
  onElementChange: (element: StageElement) => void;
  hasMedia: boolean;
}

const elements: { id: StageElement; icon: React.ElementType; label: string }[] = [
  { id: 'card', icon: GalleryVertical, label: 'Card' },
  { id: 'cube', icon: Square, label: 'Cube' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'image', icon: ImageIcon, label: 'Image/Video' },
  { id: 'model', icon: VenetianMask, label: '3D Model' },
];

export default function StageElementSelector({
  selectedElement,
  onElementChange,
  hasMedia: _hasMedia,
}: StageElementSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg">
      {elements.map(({ id, icon: Icon, label }) => {
        return (
          <Tooltip key={id} content={`Animate a ${label}`}>
            <button
              onClick={() => onElementChange(id)}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${selectedElement === id
                  ? 'bg-indigo-500/30 text-indigo-300'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
            >
              <Icon size={18} strokeWidth={2} />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
