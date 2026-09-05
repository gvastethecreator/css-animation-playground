import { getEasingFunction } from '../easing';
import type { AnimationData, EasingValue, TransformState } from '../types';
import { lerp, lerpColor } from './mathUtils';

export type SampleAnimation = (
  time: number,
  globalEasing?: EasingValue,
  activeProperties?: readonly (keyof TransformState)[],
) => Partial<TransformState>;

function assignSampledValue<K extends keyof TransformState>(
  target: Partial<TransformState>,
  property: K,
  value: TransformState[K],
) {
  target[property] = value;
}

function firstIndexAtOrAfter(track: readonly { time: number }[], time: number): number {
  let low = 0;
  let high = track.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (track[mid].time < time) low = mid + 1;
    else high = mid;
  }
  return low;
}

export function createAnimationSampler(animationData: AnimationData): SampleAnimation {
  const sortedAnimationData: AnimationData = {};

  for (const property of Object.keys(animationData) as (keyof TransformState)[]) {
    const track = animationData[property];
    if (track) sortedAnimationData[property] = [...track].sort((a, b) => a.time - b.time);
  }

  const allProperties = Object.keys(sortedAnimationData) as (keyof TransformState)[];

  return (time, globalEasing = 'linear', activeProperties = allProperties) => {
    const sampledValues: Partial<TransformState> = {};

    for (const property of activeProperties) {
      const track = sortedAnimationData[property];
      if (!track || track.length === 0) continue;

      if (time <= track[0].time) {
        assignSampledValue(sampledValues, property, track[0].value as TransformState[typeof property]);
        continue;
      }

      if (time >= track[track.length - 1].time) {
        assignSampledValue(sampledValues, property, track[track.length - 1].value as TransformState[typeof property]);
        continue;
      }

      const nextIndex = firstIndexAtOrAfter(track, time);
      const from = track[nextIndex - 1];
      const to = track[nextIndex];
      if (!from || !to) continue;

      const segmentDuration = to.time - from.time;
      const progress = segmentDuration === 0 ? 1 : (time - from.time) / segmentDuration;
      const easedProgress = getEasingFunction(from.easing || globalEasing)(progress);

      if (typeof from.value === 'number' && typeof to.value === 'number') {
        assignSampledValue(
          sampledValues,
          property,
          lerp(from.value, to.value, easedProgress) as TransformState[typeof property],
        );
      } else if (typeof from.value === 'string' && typeof to.value === 'string') {
        assignSampledValue(
          sampledValues,
          property,
          lerpColor(from.value, to.value, easedProgress) as TransformState[typeof property],
        );
      } else if (typeof from.value === 'boolean' || typeof to.value === 'boolean') {
        assignSampledValue(
          sampledValues,
          property,
          (easedProgress < 0.5 ? from.value : to.value) as TransformState[typeof property],
        );
      }
    }

    return sampledValues;
  };
}
