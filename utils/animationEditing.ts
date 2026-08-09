import type { AnimationData, Keyframe, TrackControlState, TransformState } from '../types';

export interface KeyframeUpdate {
  property: keyof TransformState;
  keyframeId: string;
  newValues: Partial<Keyframe>;
}

export type TrackControlAction = 'solo' | 'mute';
export type TrackControls = Partial<Record<keyof TransformState, TrackControlState>>;

const createKeyframeId = () => `${Date.now()}-${Math.random()}`;

export function toggleKeyframe(
  animationData: AnimationData,
  transforms: TransformState,
  property: keyof TransformState,
  time: number,
  createId: () => string = createKeyframeId,
): AnimationData {
  const track = animationData[property] ?? [];
  const existingKeyframeIndex = track.findIndex((keyframe) => keyframe.time === time);
  const nextAnimationData = { ...animationData };

  if (existingKeyframeIndex >= 0) {
    const nextTrack = track.filter((_, index) => index !== existingKeyframeIndex);
    if (nextTrack.length === 0) delete nextAnimationData[property];
    else nextAnimationData[property] = nextTrack;
    return nextAnimationData;
  }

  nextAnimationData[property] = [
    ...track,
    {
      id: createId(),
      time,
      value: transforms[property],
      easing: 'easeInOut',
    },
  ].sort((a, b) => a.time - b.time);

  return nextAnimationData;
}

export function deleteKeyframe(
  animationData: AnimationData,
  property: keyof TransformState,
  keyframeId: string,
): AnimationData {
  const nextAnimationData = { ...animationData };
  const nextTrack = (animationData[property] ?? []).filter((keyframe) => keyframe.id !== keyframeId);
  if (nextTrack.length === 0) delete nextAnimationData[property];
  else nextAnimationData[property] = nextTrack;
  return nextAnimationData;
}

export function updateKeyframe(
  animationData: AnimationData,
  property: keyof TransformState,
  keyframeId: string,
  newValues: Partial<Keyframe>,
): AnimationData {
  const nextTrack = (animationData[property] ?? []).map((keyframe) =>
    keyframe.id === keyframeId ? { ...keyframe, ...newValues } : keyframe,
  );
  return { ...animationData, [property]: nextTrack };
}

export function updateMultipleKeyframes(
  animationData: AnimationData,
  updates: readonly KeyframeUpdate[],
): AnimationData {
  let nextAnimationData = animationData;
  for (const update of updates) {
    nextAnimationData = updateKeyframe(nextAnimationData, update.property, update.keyframeId, update.newValues);
  }
  return nextAnimationData;
}

export function toggleTrackControl(
  trackControls: TrackControls,
  property: keyof TransformState,
  action: TrackControlAction,
): TrackControls {
  const nextTrackControls = Object.fromEntries(
    Object.entries(trackControls).map(([key, control]) => [key, { ...control }]),
  ) as TrackControls;
  const current = nextTrackControls[property] ?? { solo: false, mute: false };

  if (action === 'solo') {
    const shouldSolo = !current.solo;
    for (const control of Object.values(nextTrackControls)) control.solo = false;
    nextTrackControls[property] = { solo: shouldSolo, mute: false };
  } else {
    nextTrackControls[property] = { solo: false, mute: !current.mute };
  }

  return nextTrackControls;
}
