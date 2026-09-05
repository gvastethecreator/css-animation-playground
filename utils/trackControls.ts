import type { AnimationData, TrackControlState, TransformState } from '../types';

export type TrackControls = Partial<Record<keyof TransformState, TrackControlState>>;
export type TrackControlAction = 'solo' | 'mute';

export function hasSoloedTrack(animationData: AnimationData, trackControls: TrackControls): boolean {
  return (Object.keys(animationData) as (keyof TransformState)[]).some((property) => {
    const control = trackControls[property];
    return control?.solo === true && !control.mute;
  });
}

export function isAnimationTrackActive(
  property: keyof TransformState,
  trackControls: TrackControls,
  isSoloing: boolean,
): boolean {
  const control = trackControls[property];
  return !control?.mute && (!isSoloing || control?.solo === true);
}

export function getActiveAnimationProperties(
  animationData: AnimationData,
  trackControls: TrackControls,
): (keyof TransformState)[] {
  const properties = Object.keys(animationData) as (keyof TransformState)[];
  const isSoloing = hasSoloedTrack(animationData, trackControls);
  return properties.filter((property) => isAnimationTrackActive(property, trackControls, isSoloing));
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
