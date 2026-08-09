import { EASING_CSS_MAP } from '../easing';
import type {
  AnimationData,
  AnimationEngine,
  EasingName,
  EasingValue,
  TimelineDocumentState,
  TransformState,
} from '../types';

export interface CodeExportInput {
  engine: AnimationEngine;
  transforms: TransformState;
  animationData: AnimationData;
  timelineState: TimelineDocumentState;
  calculateAnimatedValues: (time: number) => Partial<TransformState>;
  activeAnimatedProperties: readonly (keyof TransformState)[];
}

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

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
    const fixedValue = parseFloat(value.toFixed(3));
    return unit ? `'${fixedValue}${unit}'` : String(fixedValue);
  }
  return String(value);
};

const getTransformString = (props: Partial<TransformState>): string => {
  const t = (key: keyof TransformState, fallback: number) => ((props[key] as number) ?? fallback).toFixed(3);
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

  return EASING_CSS_MAP[safeEasing] ? `'${EASING_CSS_MAP[safeEasing]}'` : "'linear'";
};

export function generateCodeExport({
  engine,
  transforms,
  animationData,
  timelineState,
  calculateAnimatedValues,
  activeAnimatedProperties,
}: CodeExportInput): string {
  const { perspective, perspectiveOriginX, perspectiveOriginY, transformOriginX, transformOriginY, transformOriginZ } =
    transforms;
  const hasAnimation = activeAnimatedProperties.length > 0;
  const durationSec = timelineState.duration / 1000;
  const globalEase = timelineState.easing;

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
  activeAnimatedProperties.forEach((property) =>
    animationData[property]?.forEach((keyframe) => allTimes.add(keyframe.time)),
  );
  const sortedTimes = Array.from(allTimes)
    .sort((a, b) => a - b)
    .filter((time) => time <= timelineState.duration);

  if (engine === 'css') {
    const keyframesCSS = sortedTimes
      .map((time) => {
        const percentage = (time / timelineState.duration) * 100;
        const propsAtTime = { ...transforms, ...calculateAnimatedValues(time) };
        let frame = `  ${percentage.toFixed(2)}% {\n`;
        frame += `    transform: ${getTransformString(propsAtTime)};\n`;
        if (activeAnimatedProperties.some((property) => property.startsWith('opacity')))
          frame += `    opacity: ${propsAtTime.opacityEnabled ? propsAtTime.opacity.toFixed(3) : 1};\n`;
        if (
          activeAnimatedProperties.some((property) =>
            ['blur', 'brightness', 'contrast', 'dropShadow'].some((filter) => property.startsWith(filter)),
          )
        )
          frame += `    filter: ${getFilterString(propsAtTime)};\n`;
        if (activeAnimatedProperties.some((property) => property.startsWith('borderRadius')))
          frame += `    border-radius: ${propsAtTime.borderRadiusEnabled ? `${propsAtTime.borderRadius.toFixed(2)}px` : '0px'};\n`;
        if (activeAnimatedProperties.includes('fontSize'))
          frame += `    font-size: ${propsAtTime.fontSize.toFixed(2)}px;\n`;
        if (activeAnimatedProperties.includes('letterSpacing'))
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

  const propertyMap: Record<string, Record<'gsap' | 'anime', string>> = {
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

  const isFilterAnimated = activeAnimatedProperties.some((property) =>
    ['blur', 'brightness', 'contrast', 'dropShadow'].some((filter) => property.startsWith(filter)),
  );

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

    const timelineOptions = [];
    if (timelineState.isLooping) timelineOptions.push(`repeat: -1`);
    if (timelineState.isLooping && timelineState.direction === 'alternate') timelineOptions.push(`yoyo: true`);
    if (globalEase !== 'linear') timelineOptions.push(`defaults: { ease: ${getEasingNameForLib(globalEase, 'gsap')} }`);
    code += `const tl = gsap.timeline({ ${timelineOptions.join(', ')} });\n\n`;

    const initialProps = calculateAnimatedValues(0);
    const setPropsPivot: Record<string, any> = {};
    const setPropsMain: Record<string, any> = {};
    const setPropsDOM: Record<string, any> = {};

    if (!isThree) setPropsDOM.transformOrigin = `'${transformOriginX}% ${transformOriginY}% ${transformOriginZ}px'`;

    activeAnimatedProperties.forEach((key) => {
      const value = initialProps[key] ?? transforms[key];
      if (isThree) {
        if (key === 'translateX') setPropsMain['position.x'] = value;
        if (key === 'translateY') setPropsMain['position.y'] = -(value as number);
        if (key === 'translateZ') setPropsMain['position.z'] = -(value as number);
        if (key === 'rotateX') setPropsPivot['rotation.x'] = degreesToRadians(-(value as number));
        if (key === 'rotateY') setPropsPivot['rotation.y'] = degreesToRadians(value as number);
        if (key === 'rotateZ') setPropsPivot['rotation.z'] = degreesToRadians(value as number);
        if (key.startsWith('scale')) setPropsPivot[key.toLowerCase()] = value;
        if (key === 'opacity' && transforms.opacityEnabled) setPropsPivot['material.opacity'] = value;
      } else {
        const libraryKey = propertyMap[key]?.gsap;
        if (libraryKey) setPropsDOM[libraryKey] = formatJsValue(key, value);
      }
    });

    if (isThree) {
      if (Object.keys(setPropsMain).length > 0)
        code += `gsap.set(mainGroup, { ${Object.entries(setPropsMain)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')} });\n`;
      if (Object.keys(setPropsPivot).length > 0)
        code += `gsap.set(pivotGroup, { ${Object.entries(setPropsPivot)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')} });\n`;
    } else {
      if (isFilterAnimated) setPropsDOM.filter = `'${getFilterString({ ...transforms, ...initialProps })}'`;
      code += `gsap.set('.element', { ${Object.entries(setPropsDOM)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')} });\n`;
    }

    code += `\n`;

    for (let index = 0; index < sortedTimes.length - 1; index++) {
      const time = sortedTimes[index];
      const nextTime = sortedTimes[index + 1];
      if (time >= nextTime) continue;

      const targetProps = calculateAnimatedValues(nextTime);
      const segmentDuration = (nextTime - time) / 1000;
      const toPropsPivot: Record<string, any> = {};
      const toPropsMain: Record<string, any> = {};
      const toPropsDOM: Record<string, any> = { duration: segmentDuration.toFixed(3) };

      let segmentEase = globalEase;
      for (const property of activeAnimatedProperties) {
        const keyframe = animationData[property]?.find((candidate) => candidate.time === time);
        if (keyframe?.easing) {
          segmentEase = keyframe.easing;
          break;
        }
      }
      const ease = segmentEase !== globalEase ? getEasingNameForLib(segmentEase, 'gsap') : undefined;
      if (ease) {
        toPropsDOM.ease = ease;
        toPropsPivot.ease = ease;
        toPropsMain.ease = ease;
      }

      if (isThree) {
        toPropsPivot.duration = segmentDuration.toFixed(3);
        toPropsMain.duration = segmentDuration.toFixed(3);
      }

      activeAnimatedProperties.forEach((key) => {
        if (targetProps[key] === undefined) return;
        const value = targetProps[key];
        if (isThree) {
          if (key === 'translateX') toPropsMain['position.x'] = value;
          if (key === 'translateY') toPropsMain['position.y'] = -(value as number);
          if (key === 'translateZ') toPropsMain['position.z'] = -(value as number);
          if (key === 'rotateX') toPropsPivot['rotation.x'] = degreesToRadians(-(value as number));
          if (key === 'rotateY') toPropsPivot['rotation.y'] = degreesToRadians(value as number);
          if (key === 'rotateZ') toPropsPivot['rotation.z'] = degreesToRadians(value as number);
          if (key.startsWith('scale')) toPropsPivot[key.toLowerCase()] = value;
          if (key === 'opacity' && transforms.opacityEnabled) toPropsPivot['material.opacity'] = value;
        } else {
          const libraryKey = propertyMap[key]?.gsap;
          if (libraryKey) toPropsDOM[libraryKey] = formatJsValue(key, value);
        }
      });

      if (isThree) {
        const hasMain = Object.keys(toPropsMain).length > 2;
        const hasPivot = Object.keys(toPropsPivot).length > 2;

        if (hasMain && hasPivot) {
          code += `tl.to(mainGroup, { ${Object.entries(toPropsMain)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')} }, "${time / 1000}")\n`;
          code += `  .to(pivotGroup, { ${Object.entries(toPropsPivot)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')} }, "<");\n`;
        } else if (hasMain) {
          code += `tl.to(mainGroup, { ${Object.entries(toPropsMain)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')} });\n`;
        } else if (hasPivot) {
          code += `tl.to(pivotGroup, { ${Object.entries(toPropsPivot)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')} });\n`;
        }
      } else {
        if (isFilterAnimated) toPropsDOM.filter = `'${getFilterString({ ...transforms, ...targetProps })}'`;
        code += `tl.to('.element', { ${Object.entries(toPropsDOM)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')} });\n`;
      }
    }
    return code;
  }

  if (engine === 'animejs') {
    const animationProperties: string[] = [];
    animationProperties.push(`  targets: '.element'`);
    animationProperties.push(`  duration: ${timelineState.duration}`);
    animationProperties.push(`  loop: ${timelineState.isLooping}`);
    animationProperties.push(`  direction: '${timelineState.direction}'`);
    animationProperties.push(`  easing: ${getEasingNameForLib(globalEase, 'anime')}`);
    animationProperties.push(`  transformOrigin: '${transformOriginX}% ${transformOriginY}% ${transformOriginZ}px'`);

    activeAnimatedProperties.forEach((key) => {
      const track = animationData[key];
      if (!track || track.length < 1) return;

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
        .map((keyframe, index) => {
          const nextKeyframe = fullTrack[index + 1];
          const duration = (nextKeyframe ? nextKeyframe.time : timelineState.duration) - keyframe.time;
          if (duration <= 0) return null;
          return `{ value: ${formatJsValue(key, keyframe.value)}, duration: ${duration} }`;
        })
        .filter(Boolean);
      const libraryKey = propertyMap[key]?.anime;
      if (libraryKey) animationProperties.push(`  ${libraryKey}: [${keyframes.join(', ')}]`);
    });

    if (isFilterAnimated) {
      const filterKeyframes = sortedTimes
        .map((time, index) => {
          const nextTime = sortedTimes[index + 1] || timelineState.duration;
          const duration = nextTime - time;
          if (duration <= 0) return null;
          return `{ value: '${getFilterString({ ...transforms, ...calculateAnimatedValues(time) })}', duration: ${duration} }`;
        })
        .filter(Boolean);
      animationProperties.push(`  filter: [${filterKeyframes.join(', ')}]`);
    }
    return `anime({\n${animationProperties.join(',\n')}\n});`;
  }

  return 'Error: Unknown engine selected.';
}
