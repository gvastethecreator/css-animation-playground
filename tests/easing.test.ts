import { describe, it, expect } from "vite-plus/test";
import { easingFunctions, getEasingFunction, EASING_CSS_MAP } from "../easing";

describe("easingFunctions", () => {
  it("linear returns input unchanged", () => {
    expect(easingFunctions.linear(0)).toBe(0);
    expect(easingFunctions.linear(0.5)).toBe(0.5);
    expect(easingFunctions.linear(1)).toBe(1);
  });

  it("all named easings return 0 at t=0 and 1 at t=1", () => {
    const skipKeys = ["createBezier"];
    for (const [name, fn] of Object.entries(easingFunctions)) {
      if (skipKeys.includes(name)) continue;
      const easingFn = fn as (t: number) => number;
      expect(easingFn(0), `${name}(0) should be 0`).toBeCloseTo(0, 3);
      expect(easingFn(1), `${name}(1) should be 1`).toBeCloseTo(1, 3);
    }
  });

  it("ease-in functions start slow (low value at t=0.25)", () => {
    const value = easingFunctions.easeIn(0.25);
    expect(value).toBeLessThan(0.25);
  });

  it("ease-out functions start fast (high value at t=0.25)", () => {
    const value = easingFunctions.easeOut(0.25);
    expect(value).toBeGreaterThan(0.25);
  });

  it("createBezier creates a working function", () => {
    const fn = easingFunctions.createBezier(0.25, 0.1, 0.25, 1);
    expect(fn(0)).toBe(0);
    expect(fn(1)).toBe(1);
    expect(fn(0.5)).toBeGreaterThan(0);
    expect(fn(0.5)).toBeLessThan(1);
  });

  it("createBezier with matching control points returns linear", () => {
    const fn = easingFunctions.createBezier(0.3, 0.3, 0.7, 0.7);
    expect(fn(0.25)).toBeCloseTo(0.25, 5);
    expect(fn(0.75)).toBeCloseTo(0.75, 5);
  });

  it("easeOutBounce creates characteristic bounce", () => {
    const fn = easingFunctions.easeOutBounce;
    // The function should reach 1 at x=1
    expect(fn(1)).toBe(1);
    // It should exceed 0.75 at 0.75
    expect(fn(0.75)).toBeGreaterThan(0.75);
  });
});

describe("getEasingFunction", () => {
  it("returns named easing function", () => {
    const fn = getEasingFunction("linear");
    expect(fn(0.5)).toBe(0.5);
  });

  it("parses cubic-bezier string", () => {
    const fn = getEasingFunction("cubic-bezier(0.25, 0.1, 0.25, 1)");
    expect(fn(0)).toBe(0);
    expect(fn(1)).toBe(1);
    expect(fn(0.5)).toBeGreaterThan(0);
  });

  it("falls back to linear for invalid input", () => {
    const fn = getEasingFunction("invalid-easing-name");
    expect(fn(0.5)).toBe(0.5);
  });

  it("falls back to linear for invalid cubic-bezier", () => {
    const fn = getEasingFunction("cubic-bezier(invalid)");
    expect(fn(0.5)).toBe(0.5);
  });
});

describe("EASING_CSS_MAP", () => {
  it("maps all EasingName values", () => {
    const skipKeys = ["createBezier"];
    for (const key of Object.keys(easingFunctions)) {
      if (skipKeys.includes(key)) continue;
      expect(
        EASING_CSS_MAP[key as keyof typeof EASING_CSS_MAP],
        `Missing CSS map for ${key}`,
      ).toBeDefined();
    }
  });

  it("standard easings map to CSS keywords", () => {
    expect(EASING_CSS_MAP.linear).toBe("linear");
    expect(EASING_CSS_MAP.ease).toBe("ease");
    expect(EASING_CSS_MAP.easeIn).toBe("ease-in");
    expect(EASING_CSS_MAP.easeOut).toBe("ease-out");
    expect(EASING_CSS_MAP.easeInOut).toBe("ease-in-out");
  });

  it("non-standard easings map to cubic-bezier strings", () => {
    expect(EASING_CSS_MAP.easeInSine).toMatch(/^cubic-bezier\(/);
    expect(EASING_CSS_MAP.easeOutQuad).toMatch(/^cubic-bezier\(/);
  });
});
