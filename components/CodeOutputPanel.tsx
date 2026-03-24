import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import {
    TransformState,
    AnimationData,
    EasingName,
    EasingValue,
    TrackControlState,
    AnimationDirection,
    StageElement,
    AnimationEngine,
    ENGINE_COLORS,
} from '../types';
import { EASING_CSS_MAP } from '../easing';
import { Code, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import Tooltip from './Tooltip';

// --- START OF REFACTORED CODE GENERATION LOGIC ---

const getUnit = (key: keyof TransformState): string => {
    if (
        [
            'perspective',
            'translateZ',
            'transformOriginZ',
            'blur',
            'borderRadius',
            'dropShadowX',
            'dropShadowY',
            'dropShadowBlur',
            'fontSize',
            'letterSpacing',
            'imageWidth',
        ].includes(key)
    )
        return 'px';
    if (key.startsWith('translate')) return 'px';
    if (key.startsWith('rotate') || key.startsWith('skew')) return 'deg';
    if (key.includes('Origin') || key.startsWith('brightness') || key.startsWith('contrast')) return '%';
    return '';
};

const formatJsValue = (key: keyof TransformState, value: any): string => {
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'string') return `'${value}'`;
    if (typeof value === 'number') {
        const unit = getUnit(key);
        // Remove trailing zeros and unnecessary decimal points
        const fixedValue = parseFloat(value.toFixed(3));
        return unit ? `'${fixedValue}${unit}'` : String(fixedValue);
    }
    return String(value);
};

const getTransformString = (props: Partial<TransformState>): string => {
    const t = (k: keyof TransformState, def: number) => ((props[k] as number) ?? def).toFixed(3);
    return [
        `translate3d(${t('translateX', 0)}px, ${t('translateY', 0)}px, ${t('translateZ', 0)}px)`,
        `rotateX(${t('rotateX', 0)}deg) rotateY(${t('rotateY', 0)}deg) rotateZ(${t('rotateZ', 0)}deg)`,
        `scale3d(${t('scaleX', 1)}, ${t('scaleY', 1)}, ${t('scaleZ', 1)})`,
        `skew(${t('skewX', 0)}deg, ${t('skewY', 0)}deg)`,
    ].join(' ');
};

const getFilterString = (props: Partial<TransformState>): string => {
    const filters = [];
    if (props.dropShadowEnabled)
        filters.push(
            `drop-shadow(${(props.dropShadowX ?? 0).toFixed(2)}px ${(props.dropShadowY ?? 0).toFixed(2)}px ${(props.dropShadowBlur ?? 0).toFixed(2)}px ${props.dropShadowColor})`,
        );
    if (props.blurEnabled) filters.push(`blur(${(props.blur ?? 0).toFixed(2)}px)`);
    if (props.brightnessEnabled) filters.push(`brightness(${((props.brightness ?? 100) / 100).toFixed(2)})`);
    if (props.contrastEnabled) filters.push(`contrast(${((props.contrast ?? 100) / 100).toFixed(2)})`);
    return filters.length > 0 ? filters.join(' ') : 'none';
};

const getEasingNameForLib = (easing: EasingValue, lib: 'gsap' | 'anime' | 'css'): string => {
    if (typeof easing === 'string' && easing.startsWith('cubic-bezier')) {
        return lib === 'css' ? easing : `"${easing}"`;
    }
    const safeEasing = easing as EasingName;

    // This map provides more idiomatic easing names for each library.
    const map: Partial<Record<EasingName, Partial<Record<'gsap' | 'anime', string>>>> = {
        easeInSine: { gsap: 'sine.in', anime: 'easeInSine' },
        easeOutSine: { gsap: 'sine.out', anime: 'easeOutSine' },
        easeInOutSine: { gsap: 'sine.inOut', anime: 'easeInOutSine' },
        easeInQuad: { gsap: 'power1.in', anime: 'easeInQuad' },
        easeOutQuad: { gsap: 'power1.out', anime: 'easeOutQuad' },
        easeInOutQuad: { gsap: 'power1.inOut', anime: 'easeInOutQuad' },
        easeInCubic: { gsap: 'power2.in', anime: 'easeInCubic' },
        easeOutCubic: { gsap: 'power2.out', anime: 'easeOutCubic' },
        easeInOutCubic: { gsap: 'power2.inOut', anime: 'easeInOutCubic' },
        easeInQuart: { gsap: 'power3.in', anime: 'easeInQuart' },
        easeOutQuart: { gsap: 'power3.out', anime: 'easeOutQuart' },
        easeInOutQuart: { gsap: 'power3.inOut', anime: 'easeInOutQuart' },
        easeInQuint: { gsap: 'power4.in', anime: 'easeInQuint' },
        easeOutQuint: { gsap: 'power4.out', anime: 'easeOutQuint' },
        easeInOutQuint: { gsap: 'power4.inOut', anime: 'easeInOutQuint' },
        easeInExpo: { gsap: 'expo.in', anime: 'easeInExpo' },
        easeOutExpo: { gsap: 'expo.out', anime: 'easeOutExpo' },
        easeInOutExpo: { gsap: 'expo.inOut', anime: 'easeInOutExpo' },
        easeInCirc: { gsap: 'circ.in', anime: 'easeInCirc' },
        easeOutCirc: { gsap: 'circ.out', anime: 'easeOutCirc' },
        easeInOutCirc: { gsap: 'circ.inOut', anime: 'easeInOutCirc' },
        easeInBack: { gsap: 'back.in(1.7)', anime: 'easeInBack' },
        easeOutBack: { gsap: 'back.out(1.7)', anime: 'easeOutBack' },
        easeInOutBack: { gsap: 'back.inOut(1.7)', anime: 'easeInOutBack' },
        easeInElastic: { gsap: 'elastic.in(1, 0.3)', anime: 'easeInElastic' },
        easeOutElastic: { gsap: 'elastic.out(1, 0.3)', anime: 'easeOutElastic' },
        easeInOutElastic: { gsap: 'elastic.inOut(1, 0.3)', anime: 'easeInOutElastic' },
        easeInBounce: { gsap: 'bounce.in', anime: 'easeInBounce' },
        easeOutBounce: { gsap: 'bounce.out', anime: 'easeOutBounce' },
        easeInOutBounce: { gsap: 'bounce.inOut', anime: 'easeInOutBounce' },
    };

    if (lib === 'gsap' || lib === 'anime') {
        const mapped = map[safeEasing]?.[lib];
        if (mapped) return `"${mapped}"`;
    }

    // Fallback to CSS cubic-bezier string for all libs, or 'linear'
    return EASING_CSS_MAP[safeEasing] ? `'${EASING_CSS_MAP[safeEasing]}'` : "'linear'";
};

const generateCode = (
    engine: AnimationEngine,
    transforms: TransformState,
    animationData: AnimationData,
    timelineState: { duration: number; isLooping: boolean; direction: AnimationDirection; easing: EasingValue },
    calculateAnimatedValues: (time: number) => Partial<TransformState>,
    activeAnimatedProps: (keyof TransformState)[],
) => {
    const { perspective, perspectiveOriginX, perspectiveOriginY, transformOriginX, transformOriginY, transformOriginZ } =
        transforms;
    const hasAnimation = activeAnimatedProps.length > 0;
    const durationSec = timelineState.duration / 1000;
    const globalEase = timelineState.easing;

    // --- STATIC CODE (NO ANIMATION) ---
    if (!hasAnimation) {
        return `.parent {
  perspective: ${perspective}px;
  perspective-origin: ${perspectiveOriginX}% ${perspectiveOriginY}%;
}

.element {
  transform-origin: ${transformOriginX}% ${transformOriginY}% ${transformOriginZ}px;
  opacity: ${transforms.opacityEnabled ? transforms.opacity.toFixed(2) : 1};
  filter: ${getFilterString(transforms)};
  border-radius: ${transforms.borderRadiusEnabled ? `${transforms.borderRadius}px` : '0px'};
  font-size: ${transforms.fontSize}px;
  letter-spacing: ${transforms.letterSpacing}px;
  font-weight: ${transforms.fontWeight};
  transform: ${getTransformString(transforms)};
}`;
    }

    const allTimes = new Set<number>([0, timelineState.duration]);
    activeAnimatedProps.forEach((prop) => animationData[prop]?.forEach((kf) => allTimes.add(kf.time)));
    const sortedTimes = Array.from(allTimes)
        .sort((a, b) => a - b)
        .filter((t) => t <= timelineState.duration);

    // --- CSS ENGINE ---
    if (engine === 'css') {
        const keyframesCSS = sortedTimes
            .map((time) => {
                const percentage = (time / timelineState.duration) * 100;
                const propsAtTime = { ...transforms, ...calculateAnimatedValues(time) };
                let frame = `  ${percentage.toFixed(2)}% {\n`;
                frame += `    transform: ${getTransformString(propsAtTime)};\n`;
                if (activeAnimatedProps.some((p) => p.startsWith('opacity')))
                    frame += `    opacity: ${propsAtTime.opacityEnabled ? propsAtTime.opacity.toFixed(3) : 1};\n`;
                if (
                    activeAnimatedProps.some((p) => ['blur', 'brightness', 'contrast', 'dropShadow'].some((f) => p.startsWith(f)))
                )
                    frame += `    filter: ${getFilterString(propsAtTime)};\n`;
                if (activeAnimatedProps.some((p) => p.startsWith('borderRadius')))
                    frame += `    border-radius: ${propsAtTime.borderRadiusEnabled ? `${propsAtTime.borderRadius.toFixed(2)}px` : '0px'};\n`;
                if (activeAnimatedProps.includes('fontSize')) frame += `    font-size: ${propsAtTime.fontSize.toFixed(2)}px;\n`;
                if (activeAnimatedProps.includes('letterSpacing'))
                    frame += `    letter-spacing: ${propsAtTime.letterSpacing.toFixed(2)}px;\n`;
                frame += `  }`;
                return frame;
            })
            .join('\n');

        return `.parent {
  perspective: ${perspective}px;
  perspective-origin: ${perspectiveOriginX}% ${perspectiveOriginY}%;
}

.element {
  transform-origin: ${transformOriginX}% ${transformOriginY}% ${transformOriginZ}px;
  animation: playground ${durationSec.toFixed(3)}s ${getEasingNameForLib(globalEase, 'css')} ${timelineState.isLooping ? 'infinite' : ''} ${timelineState.direction};
  animation-fill-mode: forwards;
}

@keyframes playground {
${keyframesCSS}
}`;
    }

    // JS library helpers
    const propMap: Record<string, Record<'gsap' | 'anime', string>> = {
        translateX: { gsap: 'x', anime: 'translateX' },
        translateY: { gsap: 'y', anime: 'translateY' },
        translateZ: { gsap: 'z', anime: 'translateZ' },
        rotateX: { gsap: 'rotationX', anime: 'rotateX' },
        rotateY: { gsap: 'rotationY', anime: 'rotateY' },
        rotateZ: { gsap: 'rotationZ', anime: 'rotateZ' },
        scaleX: { gsap: 'scaleX', anime: 'scaleX' },
        scaleY: { gsap: 'scaleY', anime: 'scaleY' },
        scaleZ: { gsap: 'scaleZ', anime: 'scaleZ' },
        skewX: { gsap: 'skewX', anime: 'skewX' },
        skewY: { gsap: 'skewY', anime: 'skewY' },
        opacity: { gsap: 'opacity', anime: 'opacity' },
        borderRadius: { gsap: 'borderRadius', anime: 'borderRadius' },
        fontSize: { gsap: 'fontSize', anime: 'fontSize' },
        letterSpacing: { gsap: 'letterSpacing', anime: 'letterSpacing' },
        fontWeight: { gsap: 'fontWeight', anime: 'fontWeight' },
    };

    const isFilterAnimated = activeAnimatedProps.some((p) =>
        ['blur', 'brightness', 'contrast', 'dropShadow'].some((f) => p.startsWith(f)),
    );

    // --- GSAP & THREE.JS ENGINE ---
    if (engine === 'gsap' || engine === 'threejs') {
        const isThree = engine === 'threejs';
        let code = isThree
            ? `import * as THREE from 'three';\nimport { gsap } from 'gsap';\n\n`
            : `import { gsap } from 'gsap';\n\n`;

        if (isThree) {
            code += `/* 
 * NOTE ON TRANSFORM ORIGIN IN THREE.JS:
 * Unlike CSS, Three.js objects usually rotate around their local center (0,0,0).
 * To simulate a CSS 'transform-origin', you must wrap your mesh in a Group/Object3D (the Pivot),
 * and offset the mesh position inside that Group.
 * 
 * Hierarchy: MainGroup (Translate) -> PivotGroup (Rotate/Scale) -> Mesh (Offset Geometry)
 * 
 * Logic to offset mesh based on CSS transform-origin (${transformOriginX}%, ${transformOriginY}%):
 * mesh.position.x = -((originX - 50) / 100 * width);
 * mesh.position.y = ((originY - 50) / 100 * height);
 */\n\n`;
            code += `// Apply animation to the 'PivotGroup' for rotation/scale, and 'MainGroup' for translation.\n`;
            code += `const pivotGroup = ...; // Your wrapper group\n`;
            code += `const mainGroup = ...; // Parent of pivotGroup\n\n`;
        }

        const timelineOpts = [];
        if (timelineState.isLooping) timelineOpts.push(`repeat: -1`);
        if (timelineState.isLooping && timelineState.direction === 'alternate') timelineOpts.push(`yoyo: true`);
        if (globalEase !== 'linear') timelineOpts.push(`defaults: { ease: ${getEasingNameForLib(globalEase, 'gsap')} }`);
        code += `const tl = gsap.timeline({ ${timelineOpts.join(', ')} });\n\n`;

        // Set initial state at time 0
        const initialProps = calculateAnimatedValues(0);
        const setPropsPivot: Record<string, any> = {};
        const setPropsMain: Record<string, any> = {};
        const setPropsDOM: Record<string, any> = {};

        if (!isThree) setPropsDOM.transformOrigin = `'${transformOriginX}% ${transformOriginY}% ${transformOriginZ}px'`;

        activeAnimatedProps.forEach((key) => {
            const value = initialProps[key] ?? transforms[key];
            if (isThree) {
                // Coordinate System Conversion
                if (key === 'translateX') setPropsMain['position.x'] = value;
                if (key === 'translateY') setPropsMain['position.y'] = -(value as number);
                if (key === 'translateZ') setPropsMain['position.z'] = -(value as number); // Invert Z for depth perception

                // Rotations go to Pivot Group
                if (key === 'rotateX') setPropsPivot['rotation.x'] = THREE.MathUtils.degToRad(-(value as number)); // Invert X
                if (key === 'rotateY') setPropsPivot['rotation.y'] = THREE.MathUtils.degToRad(value as number);
                if (key === 'rotateZ') setPropsPivot['rotation.z'] = THREE.MathUtils.degToRad(value as number);

                if (key.startsWith('scale')) setPropsPivot[key.toLowerCase()] = value;
                if (key === 'opacity' && transforms.opacityEnabled) setPropsPivot['material.opacity'] = value; // Assumes material is accessible
            } else {
                const libKey = propMap[key as keyof typeof propMap]?.gsap;
                if (libKey) setPropsDOM[libKey] = formatJsValue(key, value);
            }
        });

        if (isThree) {
            if (Object.keys(setPropsMain).length > 0)
                code += `gsap.set(mainGroup, { ${Object.entries(setPropsMain)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')} });\n`;
            if (Object.keys(setPropsPivot).length > 0)
                code += `gsap.set(pivotGroup, { ${Object.entries(setPropsPivot)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')} });\n`;
        } else {
            if (isFilterAnimated) setPropsDOM.filter = `'${getFilterString({ ...transforms, ...initialProps })}'`;
            code += `gsap.set('.element', { ${Object.entries(setPropsDOM)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')} });\n`;
        }

        code += `\n`;

        // Add segments
        for (let i = 0; i < sortedTimes.length - 1; i++) {
            const time = sortedTimes[i];
            const nextTime = sortedTimes[i + 1];
            if (time >= nextTime) continue;

            const targetProps = calculateAnimatedValues(nextTime);
            const segmentDuration = (nextTime - time) / 1000;
            const toPropsPivot: Record<string, any> = {};
            const toPropsMain: Record<string, any> = {};
            const toPropsDOM: Record<string, any> = { duration: segmentDuration.toFixed(3) };

            // Find easing for this segment
            let segmentEase = globalEase;
            for (const prop of activeAnimatedProps) {
                const kf = animationData[prop]?.find((k) => k.time === time);
                if (kf?.easing) {
                    segmentEase = kf.easing;
                    break;
                }
            }
            const easeStr = segmentEase !== globalEase ? getEasingNameForLib(segmentEase, 'gsap') : undefined;
            if (easeStr) {
                toPropsDOM.ease = easeStr;
                toPropsPivot.ease = easeStr;
                toPropsMain.ease = easeStr;
            }

            // Sync duration
            if (isThree) {
                toPropsPivot.duration = segmentDuration.toFixed(3);
                toPropsMain.duration = segmentDuration.toFixed(3);
            }

            activeAnimatedProps.forEach((key) => {
                if (targetProps[key] === undefined) return;
                const value = targetProps[key];
                if (isThree) {
                    if (key === 'translateX') toPropsMain['position.x'] = value;
                    if (key === 'translateY') toPropsMain['position.y'] = -(value as number);
                    if (key === 'translateZ') toPropsMain['position.z'] = -(value as number);
                    if (key === 'rotateX') toPropsPivot['rotation.x'] = THREE.MathUtils.degToRad(-(value as number));
                    if (key === 'rotateY') toPropsPivot['rotation.y'] = THREE.MathUtils.degToRad(value as number);
                    if (key === 'rotateZ') toPropsPivot['rotation.z'] = THREE.MathUtils.degToRad(value as number);
                    if (key.startsWith('scale')) toPropsPivot[key.toLowerCase()] = value;
                    if (key === 'opacity' && transforms.opacityEnabled) toPropsPivot['material.opacity'] = value;
                } else {
                    const libKey = propMap[key as keyof typeof propMap]?.gsap;
                    if (libKey) toPropsDOM[libKey] = formatJsValue(key, value);
                }
            });

            if (isThree) {
                // Use 'tl.add()' to run animations in parallel for this segment if both move
                const hasMain = Object.keys(toPropsMain).length > 2; // duration + ease + at least 1 prop
                const hasPivot = Object.keys(toPropsPivot).length > 2;

                if (hasMain && hasPivot) {
                    code += `tl.to(mainGroup, { ${Object.entries(toPropsMain)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')} }, "${time / 1000}")\n`;
                    code += `  .to(pivotGroup, { ${Object.entries(toPropsPivot)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')} }, "<");\n`;
                } else if (hasMain) {
                    code += `tl.to(mainGroup, { ${Object.entries(toPropsMain)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')} });\n`;
                } else if (hasPivot) {
                    code += `tl.to(pivotGroup, { ${Object.entries(toPropsPivot)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')} });\n`;
                }
            } else {
                if (isFilterAnimated) toPropsDOM.filter = `'${getFilterString({ ...transforms, ...targetProps })}'`;
                code += `tl.to('.element', { ${Object.entries(toPropsDOM)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')} });\n`;
            }
        }
        return code;
    }

    // --- ANIME.JS ENGINE ---
    if (engine === 'animejs') {
        const animProps: string[] = [];
        animProps.push(`  targets: '.element'`);
        animProps.push(`  duration: ${timelineState.duration}`);
        animProps.push(`  loop: ${timelineState.isLooping}`);
        animProps.push(`  direction: '${timelineState.direction}'`);
        animProps.push(`  easing: ${getEasingNameForLib(globalEase, 'anime')}`);
        animProps.push(`  transformOrigin: '${transformOriginX}% ${transformOriginY}% ${transformOriginZ}px'`);

        activeAnimatedProps.forEach((key) => {
            const track = animationData[key];
            if (!track || track.length < 1) return;

            // Ensure track starts at time 0
            const fullTrack = [...track];
            if (fullTrack[0].time !== 0) {
                fullTrack.unshift({
                    id: 'gen-start',
                    time: 0,
                    value: calculateAnimatedValues(0)[key] ?? transforms[key],
                    easing: 'linear',
                });
            }

            const keyframes = fullTrack
                .map((kf, i) => {
                    const nextKf = fullTrack[i + 1];
                    const duration = (nextKf ? nextKf.time : timelineState.duration) - kf.time;
                    if (duration <= 0) return null;
                    const keyframe = `{ value: ${formatJsValue(key, kf.value)}, duration: ${duration} }`;
                    return keyframe;
                })
                .filter(Boolean);
            const libKey = propMap[key as keyof typeof propMap]?.anime;
            if (libKey) animProps.push(`  ${libKey}: [${keyframes.join(', ')}]`);
        });

        if (isFilterAnimated) {
            const filterKeyframes = sortedTimes
                .map((time, i) => {
                    const nextTime = sortedTimes[i + 1] || timelineState.duration;
                    const duration = nextTime - time;
                    if (duration <= 0) return null;
                    return `{ value: '${getFilterString({ ...transforms, ...calculateAnimatedValues(time) })}', duration: ${duration} }`;
                })
                .filter(Boolean);
            animProps.push(`  filter: [${filterKeyframes.join(', ')}]`);
        }
        return `anime({\n${animProps.join(',\n')}\n});`;
    }

    return 'Error: Unknown engine selected.';
};

// --- END OF REFACTORED CODE GENERATION LOGIC ---

interface CodeOutputPanelProps {
    transforms: TransformState;
    height: number;
    onHeightChange: (height: number) => void;
    animationData: AnimationData;
    timelineState: {
        duration: number;
        isLooping: boolean;
        direction: AnimationDirection;
        easing: EasingValue;
    };
    calculateAnimatedValues: (time: number) => Partial<TransformState>;
    trackControls: Partial<Record<keyof TransformState, TrackControlState>>;
    stageElement: StageElement;
    engine: AnimationEngine;
}

const CodeOutputPanel: React.FC<CodeOutputPanelProps> = ({
    transforms,
    height,
    onHeightChange,
    animationData,
    timelineState,
    calculateAnimatedValues,
    trackControls,
    stageElement,
    engine,
}) => {
    const [copied, setCopied] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const isOpen = height > 37;

    const activeAnimatedProps = useMemo(() => {
        const allAnimatedProps = Object.keys(animationData) as (keyof TransformState)[];
        const soloedTracks = allAnimatedProps.filter((prop) => trackControls[prop]?.solo);
        if (soloedTracks.length > 0) return soloedTracks;
        return allAnimatedProps.filter((prop) => !trackControls[prop]?.mute);
    }, [animationData, trackControls]);

    useEffect(() => {
        if (!isOpen) {
            setGeneratedCode(''); // Clear code when closed to save memory
            return;
        }

        setIsGenerating(true);
        // Defer generation to next event loop cycle to prevent UI blocking
        const timerId = setTimeout(() => {
            const code = generateCode(
                engine,
                transforms,
                animationData,
                timelineState,
                calculateAnimatedValues,
                activeAnimatedProps,
            );
            setGeneratedCode(code);
            setIsGenerating(false);
        }, 50);

        return () => clearTimeout(timerId);
    }, [isOpen, engine, transforms, animationData, timelineState, calculateAnimatedValues, activeAnimatedProps]);

    const handleCopy = () => {
        if (isGenerating) return;
        void navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleResizeMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            const startY = e.clientY;
            const startHeight = height;
            const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaY = startY - moveEvent.clientY;
                onHeightChange(Math.min(Math.max(startHeight + deltaY, 100), 600));
            };
            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [height, onHeightChange],
    );

    const lang = engine === 'css' ? 'css' : 'javascript';
    const colors = ENGINE_COLORS[engine];

    return (
        <div
            className={`bg-zinc-950 flex flex-col shrink-0 transition-all duration-300 ease-in-out`}
            style={{ height: `${height}px` }}
        >
            <Tooltip content="Resize Panel">
                <div
                    onMouseDown={handleResizeMouseDown}
                    className="group w-full h-1.5 flex items-center justify-center cursor-row-resize"
                >
                    <div className="h-1 w-8 bg-zinc-800 group-hover:bg-zinc-700 rounded-full transition-colors" />
                </div>
            </Tooltip>
            <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-950 border-t border-zinc-900">
                <div className="flex items-center gap-3">
                    <Tooltip content={isOpen ? 'Collapse Panel' : 'Expand Panel'}>
                        <button
                            onClick={() => onHeightChange(height > 37 ? 37 : 400)}
                            className="flex items-center gap-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <Code size={16} strokeWidth={2} />
                            Code Export
                        </button>
                    </Tooltip>
                    <div
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                        {engine}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Tooltip content="Copy Code">
                        <button
                            onClick={handleCopy}
                            disabled={isGenerating}
                            className="text-[11px] px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </Tooltip>
                    <Tooltip content={isOpen ? 'Collapse' : 'Expand'}>
                        <button
                            onClick={() => onHeightChange(height > 37 ? 37 : 400)}
                            className="text-zinc-500 hover:text-zinc-300"
                        >
                            {isOpen ? <ChevronDown size={18} strokeWidth={2} /> : <ChevronUp size={18} strokeWidth={2} />}
                        </button>
                    </Tooltip>
                </div>
            </div>
            <div className={`flex-1 flex flex-col min-h-0 ${!isOpen ? 'hidden' : ''}`}>
                {stageElement === 'model' && engine !== 'threejs' && (
                    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-[11px] text-amber-200">
                        For 3D models, the most complete export path is <span className="font-semibold">threejs</span> (GSAP-driven
                        scene output).
                    </div>
                )}
                <div className="flex-1 overflow-auto bg-zinc-950">
                    {isGenerating ? (
                        <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                            <Loader size={18} className="animate-spin mr-3" />
                            Generating code...
                        </div>
                    ) : (
                        <pre className={`font-mono text-[13px] selection:bg-indigo-500/30 leading-relaxed h-full language-${lang}`}>
                            <code className={`language-${lang}`}>{generatedCode}</code>
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(CodeOutputPanel);
