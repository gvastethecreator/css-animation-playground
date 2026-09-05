import { describe, expect, it } from 'vite-plus/test';
import { mapElapsedToTimelineTime } from '../utils/playbackClock';

describe('mapElapsedToTimelineTime', () => {
  it('maps a linear pass and stops at the end', () => {
    expect(mapElapsedToTimelineTime(250, 1000, false, 'normal')).toEqual({ time: 250, shouldStop: false });
    expect(mapElapsedToTimelineTime(1000, 1000, false, 'normal')).toEqual({ time: 1000, shouldStop: true });
    expect(mapElapsedToTimelineTime(1500, 1000, false, 'normal')).toEqual({ time: 1000, shouldStop: true });
  });

  it('wraps looping time and yoyos on alternate cycles', () => {
    expect(mapElapsedToTimelineTime(2500, 1000, true, 'normal')).toEqual({ time: 500, shouldStop: false });
    expect(mapElapsedToTimelineTime(500, 1000, true, 'alternate')).toEqual({ time: 500, shouldStop: false });
    expect(mapElapsedToTimelineTime(1500, 1000, true, 'alternate')).toEqual({ time: 500, shouldStop: false });
  });

  it('keeps elapsed time when duration is not positive', () => {
    expect(mapElapsedToTimelineTime(120, 0, true, 'normal')).toEqual({ time: 120, shouldStop: false });
  });
});
