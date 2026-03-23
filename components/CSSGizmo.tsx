import React, { useState } from 'react';
import { GizmoMode, TransformState } from '../types';
import { getTransformString } from '../utils/styleUtils';

interface CSSGizmoProps {
    transforms: TransformState;
    gizmoMode: GizmoMode;
    onChange: (updates: Partial<TransformState>) => void;
    onAdjustStart: () => void;
    onAdjustEnd: () => void;
}

const AXIS_COLORS = {
    x: 'rgba(239, 68, 68, 0.8)', // red-500
    y: 'rgba(34, 197, 94, 0.8)', // green-500
    z: 'rgba(59, 130, 246, 0.8)', // blue-500
};

const AXIS_HOVER_COLORS = {
    x: 'rgba(252, 165, 165, 1)', // red-300
    y: 'rgba(134, 239, 172, 1)', // green-300
    z: 'rgba(147, 197, 253, 1)', // blue-300
};

const AxisHandle: React.FC<{ axis: 'x' | 'y' | 'z', mode: GizmoMode, onMouseDown: (e: React.MouseEvent, axis: 'x' | 'y' | 'z') => void }> = ({ axis, mode, onMouseDown }) => {
    const [isHovered, setIsHovered] = useState(false);
    const color = isHovered ? AXIS_HOVER_COLORS[axis] : AXIS_COLORS[axis];
    
    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transformOrigin: 'top left',
        pointerEvents: 'auto',
        transition: 'background-color 150ms, border-color 150ms',
    };

    const lineLength = 100;
    const handleSize = 12;
    const thickness = 4;

    const wrapperTransforms = {
        x: 'rotateY(90deg) rotateX(90deg)',
        y: 'rotateX(-90deg)',
        z: '',
    };
    
    const ringStyle: React.CSSProperties = {
        display: mode === 'rotate' ? 'block' : 'none',
        position: 'absolute',
        width: lineLength * 1.5,
        height: lineLength * 1.5,
        border: `${thickness}px solid ${color}`,
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        cursor: 'crosshair',
    };

    if (mode === 'rotate') {
        if (axis === 'x') ringStyle.transform += ' rotateX(45deg)';
        if (axis === 'y') ringStyle.transform += ' rotateX(45deg)';
    }
    
    return (
        <div style={{ ...baseStyle, transform: wrapperTransforms[axis] }}>
            {/* Line for Translate/Scale */}
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseDown={e => onMouseDown(e, axis)}
                style={{
                    display: (mode === 'translate' || mode === 'scale') ? 'block' : 'none',
                    position: 'absolute',
                    width: `${thickness}px`,
                    height: lineLength,
                    transform: `translate(-50%, -${lineLength}px)`,
                    cursor: mode === 'translate' ? 'grab' : 'ew-resize',
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Visuals: Cross-planes for thickness */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: color, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: color, transform: 'rotateY(90deg)', pointerEvents: 'none' }} />
                
                {/* Handles at the end of the line */}
                <div style={{ pointerEvents: 'none' }}>
                    {/* Translate Arrow */}
                    <div style={{
                        display: mode === 'translate' ? 'block' : 'none',
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: `${handleSize/2}px solid transparent`,
                        borderRight: `${handleSize/2}px solid transparent`,
                        borderBottom: `${handleSize}px solid ${color}`,
                    }} />
                     {/* Scale Cube */}
                     <div style={{
                         display: mode === 'scale' ? 'block' : 'none',
                         position: 'absolute',
                         top: -handleSize,
                         left: '50%',
                         width: handleSize,
                         height: handleSize,
                         backgroundColor: color,
                         transform: 'translateX(-50%)',
                     }} />
                </div>
            </div>
            
            {/* Ring for Rotate */}
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseDown={e => onMouseDown(e, axis)}
                style={ringStyle}
            />
        </div>
    );
};

const SkewHandle: React.FC<{ axis: 'x' | 'y', onMouseDown: (e: React.MouseEvent, axis: 'x' | 'y') => void }> = ({ axis, onMouseDown }) => {
    const [isHovered, setIsHovered] = useState(false);
    const color = isHovered ? AXIS_HOVER_COLORS[axis] : AXIS_COLORS[axis];
    const size = 100;

    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        width: 14,
        height: 14,
        border: `2px solid ${color}`,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '2px',
        pointerEvents: 'auto',
        cursor: axis === 'x' ? 'ew-resize' : 'ns-resize',
        transition: 'border-color 150ms',
    };

    const positionStyle: React.CSSProperties = axis === 'x'
        ? { top: -size, left: '50%', transform: 'translate(-50%, -50%)' }
        : { left: size, top: '50%', transform: 'translate(-50%, -50%)' };

    return (
         <div 
            style={{ position: 'absolute', width: 0, height: 0 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={(e) => onMouseDown(e, axis)}
        >
            {/* Line from center */}
            <div style={{
                position: 'absolute',
                backgroundColor: color,
                transition: 'background-color 150ms',
                ...(axis === 'x' 
                    ? { left: '50%', top: -size, height: size, width: 2, transform: 'translateX(-50%)'}
                    : { top: '50%', left: 0, width: size, height: 2, transform: 'translateY(-50%)'}
                )
            }}/>
            {/* Handle itself */}
            <div style={{ ...baseStyle, ...positionStyle }} />
        </div>
    );
};


const CSSGizmo: React.FC<CSSGizmoProps> = ({ transforms, gizmoMode, onChange, onAdjustStart, onAdjustEnd }) => {

    const handleMouseDown = (e: React.MouseEvent, axis: 'x' | 'y' | 'z') => {
        e.preventDefault();
        e.stopPropagation();
        onAdjustStart();
        
        const startMouse = { x: e.clientX, y: e.clientY };
        const startTransforms = { ...transforms };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startMouse.x;
            const dy = moveEvent.clientY - startMouse.y;
            let sensitivity = 1;
            if (moveEvent.shiftKey) sensitivity = 0.1;
            if (moveEvent.altKey) sensitivity = 10;
            
            const movement = (axis === 'y') ? -dy : dx;
            const scaledMovement = movement * sensitivity;
            
            if (gizmoMode === 'translate') {
                const key = `translate${axis.toUpperCase()}` as keyof TransformState;
                onChange({ [key]: (startTransforms[key] as number) + scaledMovement });
            } else if (gizmoMode === 'rotate') {
                const key = `rotate${axis.toUpperCase()}` as keyof TransformState;
                onChange({ [key]: (startTransforms[key] as number) + scaledMovement });
            } else if (gizmoMode === 'scale') {
                const key = `scale${axis.toUpperCase()}` as keyof TransformState;
                onChange({ [key]: Math.max(0, (startTransforms[key] as number) + scaledMovement * 0.01) });
            }
        };

        const handleMouseUp = () => {
            onAdjustEnd();
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleSkewMouseDown = (e: React.MouseEvent, axis: 'x' | 'y') => {
        e.preventDefault();
        e.stopPropagation();
        onAdjustStart();
        
        const startMouse = { x: e.clientX, y: e.clientY };
        const startTransforms = { ...transforms };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startMouse.x;
            const dy = moveEvent.clientY - startMouse.y;
            let sensitivity = 0.25;
            if (moveEvent.shiftKey) sensitivity *= 0.1;
            
            if (axis === 'x') {
                onChange({ skewX: (startTransforms.skewX) + dx * sensitivity });
            } else {
                onChange({ skewY: (startTransforms.skewY) - dy * sensitivity }); // Y is inverted in screen coords
            }
        };

        const handleMouseUp = () => {
            onAdjustEnd();
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const gizmoContainerStyle: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transformStyle: 'preserve-3d',
        pointerEvents: 'none',
        transform: getTransformString(transforms),
        transformOrigin: `${transforms.transformOriginX}% ${transforms.transformOriginY}% ${transforms.transformOriginZ}px`,
    };

    const gizmoItselfStyle: React.CSSProperties = {
        position: 'absolute',
        width: 0,
        height: 0,
        transformStyle: 'preserve-3d',
    };

    return (
        <div style={gizmoContainerStyle}>
            <div style={gizmoItselfStyle}>
                {gizmoMode === 'skew' ? (
                    <>
                        <SkewHandle axis="x" onMouseDown={handleSkewMouseDown} />
                        <SkewHandle axis="y" onMouseDown={handleSkewMouseDown} />
                    </>
                ) : (
                    <>
                        <AxisHandle axis="x" mode={gizmoMode} onMouseDown={handleMouseDown} />
                        <AxisHandle axis="y" mode={gizmoMode} onMouseDown={handleMouseDown} />
                        <AxisHandle axis="z" mode={gizmoMode} onMouseDown={handleMouseDown} />
                    </>
                )}
            </div>
        </div>
    );
};

export default CSSGizmo;
