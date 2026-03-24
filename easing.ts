import { EasingName, EasingValue } from './types';
import { reportRuntimeIssue } from './utils/runtimeDiagnostics.ts';

// --- BEZIER CURVE IMPLEMENTATION ---
// This is a port of the bezier-easing library by Gaëtan Renaudeau.
// It's used to create a JavaScript function that mimics the behavior of a CSS cubic-bezier easing.
const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;
const kSplineTableSize = 11;
const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

const A = (aA1: number, aA2: number) => 1.0 - 3.0 * aA2 + 3.0 * aA1;
const B = (aA1: number, aA2: number) => 3.0 * aA2 - 6.0 * aA1;
const C = (aA1: number) => 3.0 * aA1;

const calcBezier = (aT: number, aA1: number, aA2: number) => ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
const getSlope = (aT: number, aA1: number, aA2: number) =>
  3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);

const binarySubdivide = (aX: number, aA: number, aB: number, mX1: number, mX2: number) => {
  let currentX,
    currentT,
    i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
};

const newtonRaphsonIterate = (aX: number, aGuessT: number, mX1: number, mX2: number) => {
  for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
    const currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope === 0.0) return aGuessT;
    const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }
  return aGuessT;
};

const LinearEasing = (x: number) => x;

const createBezier = (mX1: number, mY1: number, mX2: number, mY2: number) => {
  if (mX1 === mY1 && mX2 === mY2) return LinearEasing;

  const sampleValues = new Float32Array(kSplineTableSize);
  for (let i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  const getTForX = (aX: number) => {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * kSampleStepSize;
    const initialSlope = getSlope(guessForT, mX1, mX2);

    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  };

  return (x: number) => (x === 0 || x === 1 ? x : calcBezier(getTForX(x), mY1, mY2));
};

// Easing functions from https://easings.net/ and other sources
export const easingFunctions: Record<EasingName, (t: number) => number> & { createBezier: typeof createBezier } = {
  // Standard - Now using bezier functions for consistency where possible
  linear: (t) => t,
  ease: createBezier(0.25, 0.1, 0.25, 1.0),
  easeIn: createBezier(0.42, 0, 1.0, 1.0),
  easeOut: createBezier(0, 0, 0.58, 1.0),
  easeInOut: createBezier(0.42, 0, 0.58, 1.0),

  // Sine
  easeInSine: createBezier(0.12, 0, 0.39, 0),
  easeOutSine: createBezier(0.61, 1, 0.88, 1),
  easeInOutSine: createBezier(0.37, 0, 0.63, 1),

  // Quad
  easeInQuad: createBezier(0.55, 0.085, 0.68, 0.53),
  easeOutQuad: createBezier(0.25, 0.46, 0.45, 0.94),
  easeInOutQuad: createBezier(0.455, 0.03, 0.515, 0.955),

  // Cubic
  easeInCubic: createBezier(0.55, 0.055, 0.675, 0.19),
  easeOutCubic: createBezier(0.215, 0.61, 0.355, 1),
  easeInOutCubic: createBezier(0.645, 0.045, 0.355, 1),

  // Quart
  easeInQuart: createBezier(0.895, 0.03, 0.685, 0.22),
  easeOutQuart: createBezier(0.165, 0.84, 0.44, 1),
  easeInOutQuart: createBezier(0.77, 0, 0.175, 1),

  // Quint
  easeInQuint: createBezier(0.755, 0.05, 0.855, 0.06),
  easeOutQuint: createBezier(0.23, 1, 0.32, 1),
  easeInOutQuint: createBezier(0.86, 0, 0.07, 1),

  // Expo
  easeInExpo: createBezier(0.95, 0.05, 0.795, 0.035),
  easeOutExpo: createBezier(0.19, 1, 0.22, 1),
  easeInOutExpo: createBezier(1, 0, 0, 1),

  // Circ
  easeInCirc: createBezier(0.6, 0.04, 0.98, 0.335),
  easeOutCirc: createBezier(0.075, 0.82, 0.165, 1),
  easeInOutCirc: createBezier(0.785, 0.135, 0.15, 0.86),

  // Back
  easeInBack: createBezier(0.6, -0.28, 0.735, 0.045),
  easeOutBack: createBezier(0.175, 0.885, 0.32, 1.275),
  easeInOutBack: createBezier(0.68, -0.55, 0.265, 1.55),

  // Elastic (JS implementation is better than bezier approximation)
  easeInElastic: (x) => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
  },
  easeOutElastic: (x) => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (x) => {
    const c5 = (2 * Math.PI) / 4.5;
    return x === 0
      ? 0
      : x === 1
        ? 1
        : x < 0.5
          ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
  },

  // Bounce (JS implementation is better than bezier approximation)
  easeInBounce: (x) => 1 - easingFunctions.easeOutBounce(1 - x),
  easeOutBounce: (x) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  },
  easeInOutBounce: (x) =>
    x < 0.5 ? (1 - easingFunctions.easeOutBounce(1 - 2 * x)) / 2 : (1 + easingFunctions.easeOutBounce(2 * x - 1)) / 2,

  // New special easings
  snappy: createBezier(0.3, 1.0, 0.4, 1.0),
  spring: createBezier(0.34, 1.56, 0.64, 1),
  anticipateOvershoot: createBezier(1, -0.4, 0.35, 0.95),
  easeOutBackSoft: createBezier(0.175, 0.885, 0.32, 1.1),
  springy: createBezier(0.68, -0.6, 0.32, 1.6),
  snap: createBezier(0, 1, 0, 1),
  bouncy: createBezier(0.5, -0.5, 0.5, 1.5),
  materialDecelerate: createBezier(0.0, 0.0, 0.2, 1),
  materialAccelerate: createBezier(0.4, 0.0, 1, 1),

  // Utility to create bezier functions on the fly
  createBezier: createBezier,
};

/**
 * Retrieves a mathematical easing function based on a name or a cubic-bezier string.
 * This centralizes logic previously duplicated across multiple components.
 */
export const getEasingFunction = (easing: EasingValue): ((t: number) => number) => {
  // 1. Check if it matches a known named easing
  if ((easingFunctions as any)[easing]) {
    return (easingFunctions as any)[easing];
  }

  // 2. Check if it is a cubic-bezier string
  if (typeof easing === 'string' && easing.startsWith('cubic-bezier')) {
    try {
      const values = easing.match(/-?[\d.]+/g)?.map(Number);
      if (values && values.length === 4) {
        return easingFunctions.createBezier(values[0], values[1], values[2], values[3]);
      }
    } catch (error) {
      reportRuntimeIssue('easing.parse', error, `Failed to parse cubic-bezier string: ${easing}`);
    }
  }

  // 3. Fallback to linear
  return easingFunctions.linear;
};

export const EASING_CSS_MAP: Record<EasingName, string> = {
  // Standard
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Sine
  easeInSine: 'cubic-bezier(0.12, 0, 0.39, 0)',
  easeOutSine: 'cubic-bezier(0.61, 1, 0.88, 1)',
  easeInOutSine: 'cubic-bezier(0.37, 0, 0.63, 1)',

  // Quad
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',

  // Cubic
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',

  // Quart
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',

  // Quint
  easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',

  // Expo
  easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',

  // Circ
  easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',

  // Back
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Elastic and Bounce cannot be represented by a single cubic-bezier.
  // CSS animations would need to use workarounds like keyframe approximations.
  // For JS libraries, we use the real functions.
  easeInElastic: 'steps(10, end)',
  easeOutElastic: 'steps(10, end)',
  easeInOutElastic: 'steps(10, end)',

  easeInBounce: 'steps(10, end)',
  easeOutBounce: 'steps(10, end)',
  easeInOutBounce: 'steps(10, end)',

  // New special easings
  snappy: 'cubic-bezier(0.3, 1, 0.4, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  anticipateOvershoot: 'cubic-bezier(1, -0.4, 0.35, 0.95)',
  easeOutBackSoft: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
  springy: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  snap: 'cubic-bezier(0, 1, 0, 1)',
  bouncy: 'cubic-bezier(0.5, -0.5, 0.5, 1.5)',
  materialDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  materialAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
};
