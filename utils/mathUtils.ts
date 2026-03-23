
export const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

// Parses an rgba string to an array of numbers [r, g, b, a]
export const parseRgba = (rgba: string): [number, number, number, number] => {
    if (!rgba) return [0, 0, 0, 1];
    const result = rgba.match(/[\d.]+/g);
    if (result) {
        const nums = result.map(Number);
        return [nums[0] || 0, nums[1] || 0, nums[2] || 0, nums[3] ?? 1];
    }
    return [0, 0, 0, 1];
};

// Interpolates between two rgba colors
export const lerpColor = (colorA: string, colorB: string, t: number): string => {
    const [r1, g1, b1, a1] = parseRgba(colorA);
    const [r2, g2, b2, a2] = parseRgba(colorB);
    const r = Math.round(lerp(r1, r2, t));
    const g = Math.round(lerp(g1, g2, t));
    const b = Math.round(lerp(b1, b2, t));
    const a = lerp(a1, a2, t);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
};
