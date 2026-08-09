import { describe, expect, it } from 'vite-plus/test';
import type { TimelineRuntimeState } from '../types';
import { createDefaultHistoryState } from '../utils/historyState';
import { getTimelineDocumentState, getTimelineHistoryPatch } from '../utils/timelineState';

const createRuntimeState = (overrides: Partial<TimelineRuntimeState> = {}): TimelineRuntimeState => ({
  currentTime: 0,
  duration: 5000,
  isPlaying: false,
  isLooping: true,
  direction: 'normal',
  easing: 'linear',
  fps: 60,
  ...overrides,
});

describe('timeline state boundary', () => {
  it('does not create history patches for transport-only changes', () => {
    const previous = createRuntimeState();
    const next = createRuntimeState({ currentTime: 1200, isPlaying: true, fps: 30 });

    expect(getTimelineHistoryPatch(previous, next)).toBeNull();
  });

  it('projects every undoable timeline field into one history patch', () => {
    const previous = createRuntimeState();
    const next = createRuntimeState({
      duration: 2400,
      isLooping: false,
      direction: 'alternate',
      easing: 'easeInOut',
    });

    expect(getTimelineHistoryPatch(previous, next)).toEqual({
      timelineDuration: 2400,
      timelineIsLooping: false,
      timelineDirection: 'alternate',
      timelineEasing: 'easeInOut',
    });
  });

  it('projects history state back into runtime document fields', () => {
    const historyState = createDefaultHistoryState();
    historyState.timelineDuration = 1800;
    historyState.timelineIsLooping = false;
    historyState.timelineDirection = 'alternate';
    historyState.timelineEasing = 'easeOutExpo';

    expect(getTimelineDocumentState(historyState)).toEqual({
      duration: 1800,
      isLooping: false,
      direction: 'alternate',
      easing: 'easeOutExpo',
    });
  });
});
