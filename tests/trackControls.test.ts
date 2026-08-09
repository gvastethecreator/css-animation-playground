import { describe, expect, it } from 'vite-plus/test';
import type { AnimationData } from '../types';
import { getActiveAnimationProperties, isAnimationTrackActive } from '../utils/trackControls';

const animationData: AnimationData = {
  translateX: [{ id: 'x', time: 0, value: 0, easing: 'linear' }],
  rotateZ: [{ id: 'z', time: 0, value: 0, easing: 'linear' }],
};

describe('track activation policy', () => {
  it('keeps unmuted tracks active when no track is soloed', () => {
    expect(
      getActiveAnimationProperties(animationData, {
        translateX: { solo: false, mute: true },
      }),
    ).toEqual(['rotateZ']);
  });

  it('gives an active solo track global precedence', () => {
    const controls = {
      translateX: { solo: true, mute: false },
      rotateZ: { solo: false, mute: false },
    };

    expect(getActiveAnimationProperties(animationData, controls)).toEqual(['translateX']);
    expect(isAnimationTrackActive('rotateZ', controls, true)).toBe(false);
  });

  it('does not let a malformed muted solo silence healthy tracks', () => {
    expect(
      getActiveAnimationProperties(animationData, {
        translateX: { solo: true, mute: true },
      }),
    ).toEqual(['rotateZ']);
  });

  it('ignores solo controls whose animation track was deleted', () => {
    expect(
      getActiveAnimationProperties(animationData, {
        scaleX: { solo: true, mute: false },
      }),
    ).toEqual(['translateX', 'rotateZ']);
  });
});
