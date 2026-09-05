import { describe, expect, it } from 'vite-plus/test';
import { generateCodeExport } from '../utils/codeExport';
import { createAnimationSampler } from '../utils/animationSampling';
import { defaultTransformState, type AnimationData } from '../types';
import { degreesToRadians } from '../utils/threeTransform';

const animationData: AnimationData = {
  translateX: [
    { id: 'a', time: 0, value: 0, easing: 'linear' },
    { id: 'b', time: 1000, value: 100, easing: 'linear' },
  ],
  translateZ: [
    { id: 'c', time: 0, value: 0, easing: 'linear' },
    { id: 'd', time: 1000, value: 40, easing: 'linear' },
  ],
  rotateY: [
    { id: 'e', time: 0, value: 0, easing: 'linear' },
    { id: 'f', time: 1000, value: 90, easing: 'linear' },
  ],
};

describe('generateCodeExport', () => {
  it('samples with createAnimationSampler instead of a caller interpolator', () => {
    const css = generateCodeExport({
      engine: 'css',
      transforms: defaultTransformState,
      animationData,
      timelineState: { duration: 1000, isLooping: false, direction: 'normal', easing: 'linear' },
    });
    const sampled = createAnimationSampler(animationData)(1000, 'linear', ['translateX', 'translateZ', 'rotateY']);

    expect(css).toContain('@keyframes playground');
    expect(css).toContain(`translate3d(${(sampled.translateX ?? 0).toFixed(3)}px`);
  });

  it('matches the Three.js stage pose for Y and Z', () => {
    const code = generateCodeExport({
      engine: 'threejs',
      transforms: defaultTransformState,
      animationData,
      timelineState: { duration: 1000, isLooping: false, direction: 'normal', easing: 'linear' },
    });

    expect(code).toContain('position.z: 40');
    expect(code).toContain(`rotation.y: ${degreesToRadians(-90)}`);
    expect(code).not.toContain('position.z: -40');
  });
});
