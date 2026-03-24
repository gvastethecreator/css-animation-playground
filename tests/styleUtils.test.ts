import { describe, it, expect } from 'vite-plus/test';
import { getTransformString, getFilterString } from '../utils/styleUtils';
import { defaultTransformState } from '../types';

describe('getTransformString', () => {
  it('returns correct CSS transform for default state', () => {
    const result = getTransformString(defaultTransformState);
    expect(result).toContain('translate3d(0.000px, 0.000px, 0.000px)');
    expect(result).toContain('rotateX(10.000deg)'); // default has slight tilt
    expect(result).toContain('rotateY(-20.000deg)'); // default has slight rotation
    expect(result).toContain('rotateZ(0.000deg)');
    expect(result).toContain('scale3d(1.000, 1.000, 1.000)');
    expect(result).toContain('skew(0.000deg, 0.000deg)');
  });

  it('includes translated values', () => {
    const state = { ...defaultTransformState, translateX: 100, translateY: -50, translateZ: 200 };
    const result = getTransformString(state);
    expect(result).toContain('translate3d(100.000px, -50.000px, 200.000px)');
  });

  it('includes rotation values', () => {
    const state = { ...defaultTransformState, rotateX: 45, rotateY: 90, rotateZ: -180 };
    const result = getTransformString(state);
    expect(result).toContain('rotateX(45.000deg)');
    expect(result).toContain('rotateY(90.000deg)');
    expect(result).toContain('rotateZ(-180.000deg)');
  });

  it('includes scale values', () => {
    const state = { ...defaultTransformState, scaleX: 2, scaleY: 0.5, scaleZ: 1.5 };
    const result = getTransformString(state);
    expect(result).toContain('scale3d(2.000, 0.500, 1.500)');
  });
});

describe('getFilterString', () => {
  it('returns drop-shadow for default state (enabled by default)', () => {
    const result = getFilterString(defaultTransformState);
    expect(result).toContain('drop-shadow(');
  });

  it('returns none when all filters are disabled', () => {
    const state = { ...defaultTransformState, dropShadowEnabled: false };
    const result = getFilterString(state);
    expect(result).toBe('none');
  });

  it('includes drop-shadow when enabled', () => {
    const state = {
      ...defaultTransformState,
      dropShadowEnabled: true,
      dropShadowX: 5,
      dropShadowY: 10,
      dropShadowBlur: 15,
      dropShadowColor: 'rgba(0,0,0,0.5)',
    };
    const result = getFilterString(state);
    expect(result).toContain('drop-shadow(');
    expect(result).toContain('5.000px');
    expect(result).toContain('10.000px');
    expect(result).toContain('15.000px');
  });

  it('includes blur when enabled', () => {
    const state = { ...defaultTransformState, blurEnabled: true, blur: 10 };
    const result = getFilterString(state);
    expect(result).toContain('blur(10.000px)');
  });

  it('includes brightness when enabled', () => {
    const state = { ...defaultTransformState, brightnessEnabled: true, brightness: 150 };
    const result = getFilterString(state);
    expect(result).toContain('brightness(1.500)');
  });

  it('combines multiple filters', () => {
    const state = { ...defaultTransformState, blurEnabled: true, blur: 5, contrastEnabled: true, contrast: 200 };
    const result = getFilterString(state);
    expect(result).toContain('blur(5.000px)');
    expect(result).toContain('contrast(2.000)');
  });
});
