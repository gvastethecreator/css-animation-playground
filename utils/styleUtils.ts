import { TransformState } from '../types';

export const getTransformString = (t: TransformState): string => {
  return `translate3d(${t.translateX.toFixed(3)}px, ${t.translateY.toFixed(3)}px, ${t.translateZ.toFixed(3)}px) rotateX(${t.rotateX.toFixed(3)}deg) rotateY(${t.rotateY.toFixed(3)}deg) rotateZ(${t.rotateZ.toFixed(3)}deg) scale3d(${t.scaleX.toFixed(3)}, ${t.scaleY.toFixed(3)}, ${t.scaleZ.toFixed(3)}) skew(${t.skewX.toFixed(3)}deg, ${t.skewY.toFixed(3)}deg)`;
};

export const getFilterString = (t: TransformState): string => {
    const filters = [];
    if (t.dropShadowEnabled) {
        const dropShadow = `drop-shadow(${t.dropShadowX.toFixed(3)}px ${t.dropShadowY.toFixed(3)}px ${t.dropShadowBlur.toFixed(3)}px ${t.dropShadowColor})`;
        filters.push(dropShadow);
    }
    if (t.blurEnabled) filters.push(`blur(${t.blur.toFixed(3)}px)`);
    if (t.brightnessEnabled) filters.push(`brightness(${(t.brightness / 100).toFixed(3)})`);
    if (t.contrastEnabled) filters.push(`contrast(${(t.contrast / 100).toFixed(3)})`);
    return filters.join(' ') || 'none';
};