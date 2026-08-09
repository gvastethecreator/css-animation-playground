import { describe, expect, it } from 'vite-plus/test';
import type { AnimationData, Keyframe } from '../types';
import { createAnimationSampler } from '../utils/animationSampling';

describe('createAnimationSampler', () => {
  it('samples unsorted numeric tracks without mutating the source', () => {
    const sourceTrack = Object.freeze<Keyframe[]>([
      { id: 'end', time: 1000, value: 100, easing: 'linear' },
      { id: 'start', time: 0, value: 0, easing: 'linear' },
    ]);
    const animationData = Object.freeze({ translateX: sourceTrack }) as AnimationData;

    const sample = createAnimationSampler(animationData);

    expect(sample(500).translateX).toBe(50);
    expect(animationData.translateX?.map((keyframe) => keyframe.id)).toEqual(['end', 'start']);
  });

  it('samples color and boolean tracks through the same policy', () => {
    const sample = createAnimationSampler({
      textColor: [
        { id: 'color-a', time: 0, value: 'rgba(0,0,0,1)', easing: 'linear' },
        { id: 'color-b', time: 1000, value: 'rgba(255,255,255,1)', easing: 'linear' },
      ],
      cubeWireframe: [
        { id: 'bool-a', time: 0, value: false, easing: 'linear' },
        { id: 'bool-b', time: 1000, value: true, easing: 'linear' },
      ],
    });

    expect(sample(500).textColor).toBe('rgba(128,128,128,1.000)');
    expect(sample(400).cubeWireframe).toBe(false);
    expect(sample(600).cubeWireframe).toBe(true);
  });
});
