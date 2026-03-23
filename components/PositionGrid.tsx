import React from 'react';
import KeyframeButton from './KeyframeButton';
import { TransformState, PROPERTY_COLORS } from '../types';
import Tooltip from './Tooltip';

interface PositionGridProps {
    label?: React.ReactNode;
    valueX: number;
    valueY: number;
    onChange: (x: number, y: number) => void;
    propertyKeyX: keyof TransformState;
    isAnimated: boolean;
    hasKeyframeAtCurrentTime: boolean;
    onKeyframeToggle: () => void;
    disabled?: boolean;
}

export default function PositionGrid({ 
    label, 
    valueX, 
    valueY, 
    onChange, 
    propertyKeyX,
    isAnimated,
    hasKeyframeAtCurrentTime,
    onKeyframeToggle,
    disabled
}: PositionGridProps) {
    const positions = [
        { x: 0, y: 0, name: 'Top Left' },
        { x: 50, y: 0, name: 'Top Center' },
        { x: 100, y: 0, name: 'Top Right' },
        { x: 0, y: 50, name: 'Center Left' },
        { x: 50, y: 50, name: 'Center' },
        { x: 100, y: 50, name: 'Center Right' },
        { x: 0, y: 100, name: 'Bottom Left' },
        { x: 50, y: 100, name: 'Bottom Center' },
        { x: 100, y: 100, name: 'Bottom Right' }
    ];

    const color = PROPERTY_COLORS[propertyKeyX] || '#818cf8';

    return (
        <div className={`space-y-1.5 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
             <div className="flex items-center gap-1.5 text-[11px]">
               <div 
                 className="w-1 h-2 rounded-full transition-colors" 
                 style={{ backgroundColor: isAnimated ? color : 'transparent' }}
               />
                <KeyframeButton 
                    onClick={onKeyframeToggle} 
                    isAnimated={isAnimated} 
                    hasKeyframeAtCurrentTime={hasKeyframeAtCurrentTime}
                    color={color}
                />
                <div className="font-bold text-zinc-300 flex items-center leading-none">
                    {label || 'Quick Set'}
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-1 w-20 h-20 bg-zinc-800/50 p-1 rounded-md border border-zinc-700">
                {positions.map((pos) => {
                    const isActive = valueX === pos.x && valueY === pos.y;
                    return (
                        <Tooltip key={pos.name} content={`${pos.name} (${pos.x}%, ${pos.y}%)`}>
                            <button
                                onClick={() => onChange(pos.x, pos.y)}
                                className={`w-full h-full flex items-center justify-center rounded-sm transition-colors ${
                                    isActive ? 'bg-indigo-500/50' : 'hover:bg-zinc-700'
                                }`}
                            >
                                <div className={`w-2 h-2 rounded-full transition-all ${
                                    isActive ? 'bg-indigo-400 scale-110 ring-2 ring-indigo-400/50' : 'bg-zinc-600'
                                }`}></div>
                            </button>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}