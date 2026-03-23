import React from 'react';
import { TransformState, AnimationData, StageElement, PROPERTY_ICONS } from '../types';
import RangeControl from './RangeControl';
import ColorControl from './ColorControl';
import ToggleControl from './ToggleControl';
import { Layers } from 'lucide-react';
import Tooltip from './Tooltip';

interface ElementControlsProps {
    stageElement: StageElement;
    transforms: TransformState;
    onChange: (updates: Partial<TransformState>) => void;
    onAdjustStart: () => void;
    onAdjustEnd: () => void;
    animationData: AnimationData;
    currentTime: number;
    onKeyframeToggle: (property: keyof TransformState) => void;
    isExploded: boolean;
    onExplodeToggle: () => void;
}

const ElementControls: React.FC<ElementControlsProps> = ({
    stageElement, transforms, onChange, onAdjustStart, onAdjustEnd,
    animationData, currentTime, onKeyframeToggle, isExploded, onExplodeToggle
}) => {
    const iconSize = 14;
    const iconStroke = 2;
    const iconClass = "mr-1.5 text-zinc-500";
    
    const renderRangeControl = (key: keyof TransformState, labelText: string, min: number, max: number, step = 1, unit = '') => {
        const isAnimated = key in animationData;
        const hasKeyframe = animationData[key]?.some(k => k.time === currentTime) ?? false;
        const Icon = PROPERTY_ICONS[key];
        const label = (
            <>
                {Icon && <Icon size={iconSize} strokeWidth={iconStroke} className={iconClass} />}
                {labelText}
            </>
        );

        return (
            <RangeControl
                key={key} label={label} value={transforms[key] as number} onChange={(v) => onChange({ [key]: v })}
                min={min} max={max} step={step} unit={unit}
                onMouseDown={onAdjustStart} onMouseUp={onAdjustEnd} propertyKey={key}
                isAnimated={isAnimated} hasKeyframeAtCurrentTime={hasKeyframe} onKeyframeToggle={() => onKeyframeToggle(key)}
            />
        );
    };

    const renderColorControl = (key: keyof TransformState, labelText: string) => {
        const isAnimated = key in animationData;
        const hasKeyframe = animationData[key]?.some(k => k.time === currentTime) ?? false;
        const Icon = PROPERTY_ICONS[key];
        const label = (
            <>
                {Icon && <Icon size={iconSize} strokeWidth={iconStroke} className={iconClass} />}
                {labelText}
            </>
        );

        return (
            <ColorControl
                key={key} label={label} value={transforms[key] as string} onChange={(v) => onChange({ [key]: v })}
                propertyKey={key} isAnimated={isAnimated} hasKeyframeAtCurrentTime={hasKeyframe} onKeyframeToggle={() => onKeyframeToggle(key)}
            />
        );
    };

    const renderToggleControl = (key: keyof TransformState, label: string) => {
        const isAnimated = key in animationData;
        const hasKeyframe = animationData[key]?.some(k => k.time === currentTime) ?? false;
        return (
            <ToggleControl
                key={key} label={label} value={transforms[key] as boolean} onChange={(v) => onChange({ [key]: v })}
                propertyKey={key} isAnimated={isAnimated} hasKeyframeAtCurrentTime={hasKeyframe} onKeyframeToggle={() => onKeyframeToggle(key)}
            />
        );
    };

    switch (stageElement) {
        case 'card':
            return (
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-zinc-300">
                        <Layers size={14} strokeWidth={2} className={iconClass} />
                        <span>Explode Layers</span>
                    </div>
                    <Tooltip content={isExploded ? 'Collapse Layers' : 'Explode Layers'}>
                      <button
                          onClick={onExplodeToggle}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-zinc-800`}
                      >
                          <span
                              className={`${isExploded ? 'translate-x-4 bg-indigo-500' : 'translate-x-0 bg-zinc-500'}
                              pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
                          />
                      </button>
                    </Tooltip>
                </div>
            );
        case 'text':
            return (
                <>
                    {renderRangeControl('fontSize', 'Font Size', 8, 200, 1, 'px')}
                    {renderRangeControl('letterSpacing', 'Spacing', -10, 50, 0.1, 'px')}
                    {renderRangeControl('fontWeight', 'Weight', 100, 900, 100)}
                    {renderColorControl('textColor', 'Color')}
                </>
            );
        case 'image':
            return renderRangeControl('imageWidth', 'Width', 10, 1000, 1, 'px');
        case 'cube':
            return (
                <>
                    {renderToggleControl('cubeShowNumbers', 'Show Numbers')}
                    {renderToggleControl('cubeWireframe', 'Wireframe')}
                </>
            );
        case 'model':
             return renderToggleControl('modelWireframe', 'Wireframe');
        default:
            return null;
    }
};

export default ElementControls;