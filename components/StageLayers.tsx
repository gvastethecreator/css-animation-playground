import React from 'react';
import { TransformState } from '../types';
import { getTransformString, getFilterString } from '../utils/styleUtils';
import Tooltip from './Tooltip';

interface StageLayersProps {
    transforms: TransformState;
    isExploded: boolean;
    isAdjusting: boolean;
    isPlaying: boolean;
    children: React.ReactNode;
    className?: string;
    layerGap?: number;
    showStageUI: boolean;
    willChangeString: string;
    onClick?: () => void;
}

const StageLayers = React.forwardRef<HTMLDivElement, StageLayersProps>(({
    transforms,
    isExploded,
    isAdjusting,
    isPlaying,
    children,
    className = '',
    layerGap = 20,
    showStageUI,
    willChangeString,
    onClick,
}, ref) => {
    
    const targetStyle: React.CSSProperties = {
        transform: getTransformString(transforms),
        transformOrigin: `${transforms.transformOriginX}% ${transforms.transformOriginY}% ${transforms.transformOriginZ}px`,
        opacity: transforms.opacityEnabled ? transforms.opacity : 1,
        filter: getFilterString(transforms),
        borderRadius: transforms.borderRadiusEnabled ? `${transforms.borderRadius}px` : '0px',
        willChange: isPlaying ? willChangeString : 'auto',
    };

    const transitionClass = !isAdjusting && !isPlaying ? "transition-[transform,filter,opacity,border-radius] duration-300 ease-out" : "";
    const explodeTransitionClass = "transition-transform duration-500 ease-in-out";

    const layers = React.Children.toArray(children);
    const midIndex = Math.floor(layers.length / 2);

    return (
        <div
            ref={ref}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 preserve-3d ${className} ${transitionClass}`}
            style={targetStyle}
            onClick={onClick}
            onMouseDown={e => e.stopPropagation()}
        >
            {/* Transform Origin Marker */}
            {showStageUI && (
                <Tooltip content={`Transform Origin: ${transforms.transformOriginX.toFixed(0)}%, ${transforms.transformOriginY.toFixed(0)}%, ${transforms.transformOriginZ.toFixed(0)}px`}>
                    <div
                        className="absolute z-50 w-4 h-4 rounded-full bg-yellow-500/50 border-2 border-yellow-400 pointer-events-none"
                        style={{
                            left: `${transforms.transformOriginX}%`,
                            top: `${transforms.transformOriginY}%`,
                            transform: `translate3d(-50%, -50%, ${transforms.transformOriginZ}px) translateZ(1px)`,
                        }}
                    >
                        <div className="w-1 h-1 bg-yellow-300 rounded-full m-auto" />
                    </div>
                </Tooltip>
            )}
            {layers.map((child, index) => {
                const zOffset = isExploded ? (index - midIndex) * layerGap : 0;
                return (
                    <div
                        key={index}
                        className={`absolute inset-0 preserve-3d ${explodeTransitionClass}`}
                        style={{ transform: `translateZ(${zOffset}px)` }}
                    >
                        {child}
                    </div>
                );
            })}
        </div>
    );
});

export default StageLayers;