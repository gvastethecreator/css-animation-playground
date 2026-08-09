import { describe, expect, it } from 'vite-plus/test';
import { defaultTransformState, type AnimationData } from '../types';
import {
  deleteKeyframe,
  toggleKeyframe,
  toggleTrackControl,
  updateKeyframe,
  updateMultipleKeyframes,
} from '../utils/animationEditing';

const sourceAnimation: AnimationData = {
  translateX: [
    { id: 'start', time: 0, value: 0, easing: 'linear' },
    { id: 'end', time: 1000, value: 100, easing: 'linear' },
  ],
};

describe('animation editing', () => {
  it('adds a sorted keyframe and removes it when toggled again', () => {
    const added = toggleKeyframe(
      sourceAnimation,
      { ...defaultTransformState, translateX: 50 },
      'translateX',
      500,
      () => 'middle',
    );
    expect(added.translateX?.map((keyframe) => keyframe.id)).toEqual(['start', 'middle', 'end']);
    expect(sourceAnimation.translateX?.map((keyframe) => keyframe.id)).toEqual(['start', 'end']);

    const removed = toggleKeyframe(added, defaultTransformState, 'translateX', 500);
    expect(removed.translateX?.map((keyframe) => keyframe.id)).toEqual(['start', 'end']);
  });

  it('deletes the final keyframe by removing the empty track', () => {
    const result = deleteKeyframe(
      { rotateZ: [{ id: 'only', time: 0, value: 0, easing: 'linear' }] },
      'rotateZ',
      'only',
    );
    expect(result.rotateZ).toBeUndefined();
  });

  it('updates one or many keyframes without mutating source tracks', () => {
    const single = updateKeyframe(sourceAnimation, 'translateX', 'start', { time: 100 });
    const multiple = updateMultipleKeyframes(single, [
      { property: 'translateX', keyframeId: 'start', newValues: { value: 10 } },
      { property: 'translateX', keyframeId: 'end', newValues: { time: 900 } },
    ]);

    expect(multiple.translateX).toEqual([
      { id: 'start', time: 100, value: 10, easing: 'linear' },
      { id: 'end', time: 900, value: 100, easing: 'linear' },
    ]);
    expect(sourceAnimation.translateX?.[0]).toEqual({ id: 'start', time: 0, value: 0, easing: 'linear' });
  });

  it('toggles track controls without mutating prior history snapshots', () => {
    const previous = {
      translateX: { solo: false, mute: false },
      rotateZ: { solo: true, mute: false },
    };
    const next = toggleTrackControl(previous, 'translateX', 'solo');

    expect(next).toEqual({
      translateX: { solo: true, mute: false },
      rotateZ: { solo: false, mute: false },
    });
    expect(previous.rotateZ.solo).toBe(true);
    expect(previous.translateX.solo).toBe(false);
  });
});
