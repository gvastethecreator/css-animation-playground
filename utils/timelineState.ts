import type { HistoryState, TimelineDocumentState, TimelineRuntimeState } from '../types';

export type TimelineHistoryPatch = Pick<
  HistoryState,
  'timelineDuration' | 'timelineIsLooping' | 'timelineDirection' | 'timelineEasing'
>;

export function getTimelineDocumentState(historyState: HistoryState): TimelineDocumentState {
  return {
    duration: historyState.timelineDuration,
    isLooping: historyState.timelineIsLooping,
    direction: historyState.timelineDirection,
    easing: historyState.timelineEasing,
  };
}

export function getTimelineHistoryPatch(
  previous: TimelineRuntimeState,
  next: TimelineRuntimeState,
): TimelineHistoryPatch | null {
  if (
    previous.duration === next.duration &&
    previous.isLooping === next.isLooping &&
    previous.direction === next.direction &&
    previous.easing === next.easing
  ) {
    return null;
  }

  return {
    timelineDuration: next.duration,
    timelineIsLooping: next.isLooping,
    timelineDirection: next.direction,
    timelineEasing: next.easing,
  };
}
