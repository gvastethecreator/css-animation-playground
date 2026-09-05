import { defaultTransformState, TransformState } from '../types';

const numberAt = (props: Partial<TransformState>, key: keyof TransformState, fallback: number): number => {
  const value = props[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

export const getTransformString = (t: Partial<TransformState>): string => {
  const d = defaultTransformState;
  const n = (key: keyof TransformState, fallback: number) => numberAt(t, key, fallback).toFixed(3);
  return `translate3d(${n('translateX', d.translateX)}px, ${n('translateY', d.translateY)}px, ${n('translateZ', d.translateZ)}px) rotateX(${n('rotateX', d.rotateX)}deg) rotateY(${n('rotateY', d.rotateY)}deg) rotateZ(${n('rotateZ', d.rotateZ)}deg) scale3d(${n('scaleX', d.scaleX)}, ${n('scaleY', d.scaleY)}, ${n('scaleZ', d.scaleZ)}) skew(${n('skewX', d.skewX)}deg, ${n('skewY', d.skewY)}deg)`;
};

export const getFilterString = (t: Partial<TransformState>): string => {
  const d = defaultTransformState;
  const filters = [];
  if (t.dropShadowEnabled ?? d.dropShadowEnabled) {
    const dropShadow = `drop-shadow(${numberAt(t, 'dropShadowX', d.dropShadowX).toFixed(3)}px ${numberAt(t, 'dropShadowY', d.dropShadowY).toFixed(3)}px ${numberAt(t, 'dropShadowBlur', d.dropShadowBlur).toFixed(3)}px ${t.dropShadowColor ?? d.dropShadowColor})`;
    filters.push(dropShadow);
  }
  if (t.blurEnabled) filters.push(`blur(${numberAt(t, 'blur', d.blur).toFixed(3)}px)`);
  if (t.brightnessEnabled) filters.push(`brightness(${(numberAt(t, 'brightness', d.brightness) / 100).toFixed(3)})`);
  if (t.contrastEnabled) filters.push(`contrast(${(numberAt(t, 'contrast', d.contrast) / 100).toFixed(3)})`);
  return filters.join(' ') || 'none';
};

const FILTER_PROPERTIES = new Set<string>([
  'blur',
  'blurEnabled',
  'brightness',
  'brightnessEnabled',
  'contrast',
  'contrastEnabled',
  'dropShadowX',
  'dropShadowY',
  'dropShadowBlur',
  'dropShadowColor',
  'dropShadowEnabled',
]);

export function getWillChangeString(activeProperties: readonly (keyof TransformState)[]): string {
  if (activeProperties.length === 0) return 'auto';

  const flags: string[] = [];
  const add = (flag: string) => {
    if (!flags.includes(flag)) flags.push(flag);
  };

  for (const property of activeProperties) {
    if (property === 'opacity' || property === 'opacityEnabled') add('opacity');
    else if (FILTER_PROPERTIES.has(property)) add('filter');
    else if (
      property.startsWith('translate') ||
      property.startsWith('rotate') ||
      property.startsWith('scale') ||
      property.startsWith('skew') ||
      property.startsWith('perspective') ||
      property.startsWith('transformOrigin')
    ) {
      add('transform');
    }
  }

  return flags.length > 0 ? flags.join(', ') : 'auto';
}
