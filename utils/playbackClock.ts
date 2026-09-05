export type PlaybackDirection = 'normal' | 'alternate';

export interface PlaybackClockResult {
  time: number;
  shouldStop: boolean;
}

export function mapElapsedToTimelineTime(
  elapsed: number,
  duration: number,
  isLooping: boolean,
  direction: PlaybackDirection = 'normal',
): PlaybackClockResult {
  if (!(duration > 0) || !Number.isFinite(elapsed)) {
    return { time: Number.isFinite(elapsed) ? elapsed : 0, shouldStop: false };
  }

  if (isLooping) {
    const cycleTime = elapsed % duration;
    if (direction === 'alternate') {
      const loopCount = Math.floor(elapsed / duration);
      const isReversed = loopCount % 2 !== 0;
      return { time: isReversed ? duration - cycleTime : cycleTime, shouldStop: false };
    }
    return { time: cycleTime, shouldStop: false };
  }

  if (elapsed >= duration) {
    return { time: duration, shouldStop: true };
  }

  return { time: elapsed, shouldStop: false };
}
