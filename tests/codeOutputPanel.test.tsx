/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test';
import { render, waitFor } from '@testing-library/react';
import CodeOutputPanel from '../components/CodeOutputPanel';
import {
  defaultTransformState,
  type AnimationData,
  type AnimationDirection,
  type AnimationEngine,
  type EasingValue,
  type StageElement,
  type TrackControlState,
  type TransformState,
} from '../types';

vi.mock('../components/Tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

interface AnimatedSpec {
  from: number;
  to: number;
}

const buildAnimationData = (
  specs: Partial<Record<keyof TransformState, AnimatedSpec>>,
): AnimationData => {
  const data: AnimationData = {};
  for (const [key, spec] of Object.entries(specs) as [keyof TransformState, AnimatedSpec][]) {
    data[key] = [
      { id: 'a', time: 0, value: spec.from, easing: 'linear' as EasingValue },
      { id: 'b', time: 1000, value: spec.to, easing: 'linear' as EasingValue },
    ];
  }
  return data;
};

const buildInterpolator = (animationData: AnimationData) => {
  return (time: number): Partial<TransformState> => {
    const result: Partial<TransformState> = {};
    for (const [key, track] of Object.entries(animationData) as [
      keyof TransformState,
      NonNullable<AnimationData[keyof TransformState]>,
    ][]) {
      if (!track || track.length === 0) continue;
      const sorted = [...track].sort((a, b) => a.time - b.time);
      if (time <= sorted[0].time) {
        (result as any)[key] = sorted[0].value;
        continue;
      }
      if (time >= sorted[sorted.length - 1].time) {
        (result as any)[key] = sorted[sorted.length - 1].value;
        continue;
      }
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (time >= a.time && time <= b.time) {
          const t = (time - a.time) / (b.time - a.time);
          (result as any)[key] = (a.value as number) + ((b.value as number) - (a.value as number)) * t;
          break;
        }
      }
    }
    return result;
  };
};

interface PanelRenderOptions {
  engine: AnimationEngine;
  stageElement?: StageElement;
  animationData?: AnimationData;
  trackControls?: Partial<Record<keyof TransformState, TrackControlState>>;
  height?: number;
  isLooping?: boolean;
  direction?: AnimationDirection;
  easing?: EasingValue;
}

const renderPanel = (options: PanelRenderOptions) => {
  const animationData = options.animationData ?? buildAnimationData({ translateX: { from: 0, to: 100 } });
  const calculateAnimatedValues = buildInterpolator(animationData);
  const props = {
    transforms: { ...defaultTransformState },
    height: options.height ?? 400,
    onHeightChange: vi.fn(),
    animationData,
    timelineState: {
      duration: 1000,
      isLooping: options.isLooping ?? false,
      direction: options.direction ?? ('normal' as AnimationDirection),
      easing: options.easing ?? ('easeInOutCubic' as EasingValue),
    },
    calculateAnimatedValues,
    trackControls: options.trackControls ?? {},
    stageElement: options.stageElement ?? ('card' as StageElement),
    engine: options.engine,
  };
  const result = render(<CodeOutputPanel {...props} />);
  return { ...result, props };
};

const getCodeContent = (container: HTMLElement): string => {
  const code = container.querySelector('code');
  if (!code) return '';
  return code.textContent ?? '';
};

describe('CodeOutputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the active engine badge', async () => {
    const { container } = renderPanel({ engine: 'gsap' });
    await waitFor(() => {
      expect(container.textContent).toContain('gsap');
    });
  });

  it('renders static CSS (no keyframes) when there are no animated tracks', async () => {
    const { container } = renderPanel({
      engine: 'css',
      animationData: {},
    });
    const code = await waitFor(() => {
      const c = getCodeContent(container);
      expect(c.length).toBeGreaterThan(0);
      return c;
    });
    expect(code).toContain('.parent {');
    expect(code).toContain('.element {');
    expect(code).not.toContain('@keyframes');
    expect(code).not.toContain('animation:');
  });

  it('generates CSS keyframes for the css engine', async () => {
    const { container } = renderPanel({
      engine: 'css',
      animationData: buildAnimationData({ translateX: { from: 0, to: 100 } }),
    });
    const code = await waitFor(() => {
      const c = getCodeContent(container);
      expect(c).toContain('@keyframes playground');
      return c;
    });
    expect(code).toContain('animation: playground');
    expect(code).toMatch(/0\.00%\s*\{/);
    expect(code).toMatch(/100\.00%\s*\{/);
    expect(code).toMatch(/translate3d\(100\.000px/);
  });

  it('generates GSAP timeline code for the gsap engine', async () => {
    const { container } = renderPanel({
      engine: 'gsap',
      animationData: buildAnimationData({ translateX: { from: 0, to: 100 } }),
    });
    const code = await waitFor(() => {
      const c = getCodeContent(container);
      expect(c).toContain("import { gsap } from 'gsap';");
      return c;
    });
    expect(code).toContain('gsap.timeline(');
    expect(code).toContain("gsap.set('.element'");
    expect(code).toContain("tl.to('.element'");
    expect(code).not.toContain('pivotGroup');
    expect(code).not.toContain('mainGroup');
  });

  it('generates anime.js code with per-property keyframe arrays', async () => {
    const { container } = renderPanel({
      engine: 'animejs',
      animationData: buildAnimationData({ translateX: { from: 0, to: 100 } }),
    });
    const code = await waitFor(() => {
      const c = getCodeContent(container);
      expect(c.startsWith('anime({')).toBe(true);
      return c;
    });
    expect(code).toContain("targets: '.element'");
    expect(code).toContain("direction: 'normal'");
    expect(code).toContain("easing: \"easeInOutCubic\"");
    expect(code).toContain("transformOrigin: '50% 50% 0px'");
    expect(code).toContain("translateX: [{ value: '0px', duration: 1000 }]");
  });

  it('emits a yoyo timeline and looping option when alternate + looping', async () => {
    const { container } = renderPanel({
      engine: 'gsap',
      animationData: buildAnimationData({ translateX: { from: 0, to: 100 } }),
      isLooping: true,
      direction: 'alternate',
    });
    const code = await waitFor(() => {
      const c = getCodeContent(container);
      expect(c).toContain('yoyo: true');
      return c;
    });
    expect(code).toContain('repeat: -1');
  });

  it('generates three.js code with pivotGroup for rotations and inverted Y/Z translation', async () => {
    const { container } = renderPanel({
      engine: 'threejs',
      animationData: buildAnimationData({
        translateX: { from: 0, to: 100 },
        translateY: { from: 0, to: 50 },
        rotateZ: { from: 0, to: 90 },
      }),
    });
    const code = await waitFor(() => {
      const c = getCodeContent(container);
      expect(c).toContain("import * as THREE from 'three';");
      return c;
    });
    expect(code).toContain('pivotGroup');
    expect(code).toContain('mainGroup');
    expect(code).toContain('gsap.set(mainGroup');
    expect(code).toContain('position.x: 100');
    expect(code).toContain('position.y: -50');
    expect(code).toContain('rotation.z:');
    expect(code).not.toContain("gsap.set('.element'");
  });

  it('shows the 3D model warning when stageElement is model and engine is not threejs', async () => {
    const { container } = renderPanel({ engine: 'gsap', stageElement: 'model' });
    await waitFor(() => {
      expect(container.textContent).toContain('3D models');
    });
    expect(container.textContent).toContain('threejs');
  });

  it('does not show the 3D model warning when engine is threejs', async () => {
    const { container } = renderPanel({ engine: 'threejs', stageElement: 'model' });
    await waitFor(() => {
      expect(getCodeContent(container).length).toBeGreaterThan(0);
    });
    expect(container.textContent).not.toContain('3D models, the most complete');
  });

  it('clears generated code when the panel is collapsed (height <= 37)', async () => {
    const { container } = renderPanel({ engine: 'css', height: 30 });
    await waitFor(() => {
      const code = getCodeContent(container);
      expect(code).toBe('');
    });
  });
});
