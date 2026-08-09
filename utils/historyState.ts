import {
  defaultTransformState,
  type AnimationData,
  type EngineConfig,
  type HistoryState,
  type Keyframe,
  type TrackControlState,
  type TransformState,
} from '../types';

export const APP_STORAGE_KEY = 'css3d-playground-state';

export const defaultEngineConfig: EngineConfig = {
  gsap: {
    easeAmplitude: 1,
    easePeriod: 0.3,
  },
  animejs: {
    elasticity: 500,
  },
};

const MAX_HISTORY = 50;
const transformKeys = new Set<keyof TransformState>(Object.keys(defaultTransformState) as (keyof TransformState)[]);

export interface HistoryStack {
  entries: HistoryState[];
  index: number;
}

type HistoryAction = { type: 'PUSH'; state: HistoryState } | { type: 'UNDO' } | { type: 'REDO' } | { type: 'RESET' };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

function mergePrimitiveShape<T extends object>(defaults: T, candidate: unknown): T {
  const merged = { ...defaults };
  if (!isRecord(candidate)) return merged;

  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const fallback = defaults[key];
    const value = candidate[String(key)];
    if (typeof value === typeof fallback && (typeof value !== 'number' || Number.isFinite(value))) {
      merged[key] = value as T[typeof key];
    }
  }

  return merged;
}

function isKeyframe(value: unknown): value is Keyframe {
  if (!isRecord(value)) return false;
  const keyframeValue = value.value;
  const hasSupportedValue =
    isFiniteNumber(keyframeValue) || typeof keyframeValue === 'string' || typeof keyframeValue === 'boolean';

  return (
    typeof value.id === 'string' && isFiniteNumber(value.time) && hasSupportedValue && typeof value.easing === 'string'
  );
}

function restoreAnimationData(candidate: unknown): AnimationData {
  if (!isRecord(candidate)) return {};
  const animationData: AnimationData = {};

  for (const [property, track] of Object.entries(candidate)) {
    if (!transformKeys.has(property as keyof TransformState) || !Array.isArray(track)) continue;
    animationData[property as keyof TransformState] = track.filter(isKeyframe).map((keyframe) => ({ ...keyframe }));
  }

  return animationData;
}

function restoreTrackControls(candidate: unknown): Partial<Record<keyof TransformState, TrackControlState>> {
  if (!isRecord(candidate)) return {};
  const controls: Partial<Record<keyof TransformState, TrackControlState>> = {};

  for (const [property, control] of Object.entries(candidate)) {
    if (!transformKeys.has(property as keyof TransformState) || !isRecord(control)) continue;
    if (typeof control.solo !== 'boolean' || typeof control.mute !== 'boolean') continue;
    controls[property as keyof TransformState] = { solo: control.solo, mute: control.mute };
  }

  return controls;
}

export function createDefaultHistoryState(): HistoryState {
  return {
    transforms: { ...defaultTransformState },
    animationData: {},
    timelineDuration: 5000,
    timelineIsLooping: true,
    timelineDirection: 'normal',
    timelineEasing: 'linear',
    trackControls: {},
    engineConfig: {
      gsap: { ...defaultEngineConfig.gsap },
      animejs: { ...defaultEngineConfig.animejs },
    },
    timelinePlayOnClick: false,
  };
}

export function restoreHistoryState(serializedState: string | null): HistoryState {
  const defaults = createDefaultHistoryState();
  if (!serializedState) return defaults;

  try {
    const candidate: unknown = JSON.parse(serializedState);
    if (!isRecord(candidate)) return defaults;

    const engineConfig = isRecord(candidate.engineConfig) ? candidate.engineConfig : {};
    const direction = candidate.timelineDirection;

    return {
      transforms: mergePrimitiveShape(defaults.transforms, candidate.transforms),
      animationData: restoreAnimationData(candidate.animationData),
      timelineDuration:
        isFiniteNumber(candidate.timelineDuration) && candidate.timelineDuration > 0
          ? candidate.timelineDuration
          : defaults.timelineDuration,
      timelineIsLooping:
        typeof candidate.timelineIsLooping === 'boolean' ? candidate.timelineIsLooping : defaults.timelineIsLooping,
      timelineDirection: direction === 'normal' || direction === 'alternate' ? direction : defaults.timelineDirection,
      timelineEasing: typeof candidate.timelineEasing === 'string' ? candidate.timelineEasing : defaults.timelineEasing,
      trackControls: restoreTrackControls(candidate.trackControls),
      engineConfig: {
        gsap: mergePrimitiveShape(defaults.engineConfig.gsap, engineConfig.gsap),
        animejs: mergePrimitiveShape(defaults.engineConfig.animejs, engineConfig.animejs),
      },
      timelinePlayOnClick:
        typeof candidate.timelinePlayOnClick === 'boolean'
          ? candidate.timelinePlayOnClick
          : defaults.timelinePlayOnClick,
    };
  } catch {
    return defaults;
  }
}

export function createHistoryStack(initialState: HistoryState): HistoryStack {
  return { entries: [initialState], index: 0 };
}

export function historyReducer(stack: HistoryStack, action: HistoryAction): HistoryStack {
  switch (action.type) {
    case 'PUSH': {
      const entries = stack.entries.slice(0, stack.index + 1);
      entries.push(action.state);
      if (entries.length > MAX_HISTORY) entries.shift();
      return { entries, index: entries.length - 1 };
    }
    case 'UNDO':
      return stack.index > 0 ? { ...stack, index: stack.index - 1 } : stack;
    case 'REDO':
      return stack.index < stack.entries.length - 1 ? { ...stack, index: stack.index + 1 } : stack;
    case 'RESET':
      return createHistoryStack(createDefaultHistoryState());
  }
}
