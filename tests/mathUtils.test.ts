import { describe, it, expect } from 'vite-plus/test';
import { lerp, parseRgba, lerpColor } from '../utils/mathUtils';

describe('lerp', () => {
  it('returns a when t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns b when t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint when t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('handles negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });

  it('handles t outside 0-1 range (extrapolation)', () => {
    expect(lerp(0, 10, 2)).toBe(20);
    expect(lerp(0, 10, -1)).toBe(-10);
  });
});

describe('parseRgba', () => {
  it('parses rgba string correctly', () => {
    expect(parseRgba('rgba(255, 128, 0, 0.5)')).toEqual([255, 128, 0, 0.5]);
  });

  it('defaults alpha to 1 when missing', () => {
    expect(parseRgba('rgb(100, 200, 50)')).toEqual([100, 200, 50, 1]);
  });

  it('returns black when given empty/null string', () => {
    expect(parseRgba('')).toEqual([0, 0, 0, 1]);
  });

  it('handles zero values', () => {
    expect(parseRgba('rgba(0, 0, 0, 0)')).toEqual([0, 0, 0, 0]);
  });
});

describe('lerpColor', () => {
  it('returns colorA when t=0', () => {
    const result = lerpColor('rgba(255, 0, 0, 1)', 'rgba(0, 0, 255, 1)', 0);
    expect(result).toBe('rgba(255,0,0,1.000)');
  });

  it('returns colorB when t=1', () => {
    const result = lerpColor('rgba(255, 0, 0, 1)', 'rgba(0, 0, 255, 1)', 1);
    expect(result).toBe('rgba(0,0,255,1.000)');
  });

  it('returns midpoint color when t=0.5', () => {
    const result = lerpColor('rgba(0, 0, 0, 0)', 'rgba(255, 255, 255, 1)', 0.5);
    expect(result).toBe('rgba(128,128,128,0.500)');
  });
});
