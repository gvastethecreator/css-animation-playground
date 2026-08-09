import { describe, expect, it } from 'vite-plus/test';
import {
  clampTimelineTime,
  getFrameDuration,
  getMagneticSnapTime,
  getTimelineFrame,
  pixelsToTime,
  snapTimeToFrame,
  stepTimelineFrame,
  timeToPixels,
} from '../utils/timelineMath';

describe('timeline math', () => {
  it('derives frame duration and frame indexes from valid FPS', () => {
    expect(getFrameDuration(60)).toBeCloseTo(1000 / 60);
    expect(getTimelineFrame(500, 60)).toBe(29);
  });

  it('handles invalid FPS without non-finite results', () => {
    expect(getFrameDuration(0)).toBe(0);
    expect(snapTimeToFrame(250, Number.NaN)).toBe(0);
    expect(stepTimelineFrame(250, 1000, 0, 'next')).toBe(250);
    expect(getTimelineFrame(250, -1)).toBe(0);
  });

  it('steps one frame and clamps at both timeline bounds', () => {
    expect(stepTimelineFrame(990, 1000, 60, 'next')).toBe(1000);
    expect(stepTimelineFrame(5, 1000, 60, 'prev')).toBe(0);
  });

  it('snaps to the nearest frame and clamps arbitrary times', () => {
    expect(snapTimeToFrame(125, 20)).toBe(150);
    expect(clampTimelineTime(-20, 1000)).toBe(0);
    expect(clampTimelineTime(1200, 1000)).toBe(1000);
  });

  it('converts between time and pixels', () => {
    expect(timeToPixels(250, 0.4)).toBe(100);
    expect(pixelsToTime(100, 0.4)).toBe(250);
    expect(pixelsToTime(100, 0)).toBe(0);
  });

  it('prioritizes boundaries, then the closest keyframe, then the grid', () => {
    expect(getMagneticSnapTime(4, 1000, [5], 1)).toBe(0);
    expect(getMagneticSnapTime(526, 1000, [520, 530], 1)).toBe(530);
    expect(getMagneticSnapTime(694, 1000, [], 1)).toBe(700);
    expect(getMagneticSnapTime(650, 1000, [], 1)).toBe(650);
  });
});
