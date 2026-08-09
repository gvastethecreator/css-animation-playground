export function getFrameDuration(fps: number): number {
  return Number.isFinite(fps) && fps > 0 ? 1000 / fps : 0;
}

export function clampTimelineTime(time: number, duration: number): number {
  const maximum = Number.isFinite(duration) && duration > 0 ? duration : 0;
  if (Number.isNaN(time)) return 0;
  return Math.min(maximum, Math.max(0, time));
}

export function snapTimeToFrame(time: number, fps: number): number {
  const frameDuration = getFrameDuration(fps);
  if (frameDuration === 0 || !Number.isFinite(time)) return 0;
  return Math.round(time / frameDuration) * frameDuration;
}

export function stepTimelineFrame(
  currentTime: number,
  duration: number,
  fps: number,
  direction: 'next' | 'prev',
): number {
  const frameDuration = getFrameDuration(fps);
  if (frameDuration === 0) return clampTimelineTime(currentTime, duration);
  const delta = direction === 'next' ? frameDuration : -frameDuration;
  return clampTimelineTime(currentTime + delta, duration);
}

export function getTimelineFrame(currentTime: number, fps: number): number {
  const frameDuration = getFrameDuration(fps);
  if (frameDuration === 0 || !Number.isFinite(currentTime)) return 0;
  return Math.max(0, Math.floor(currentTime / frameDuration));
}

export function timeToPixels(time: number, pixelsPerMs: number): number {
  if (!Number.isFinite(time) || !Number.isFinite(pixelsPerMs)) return 0;
  return time * pixelsPerMs;
}

export function pixelsToTime(pixels: number, pixelsPerMs: number): number {
  if (!Number.isFinite(pixels) || !Number.isFinite(pixelsPerMs) || pixelsPerMs <= 0) return 0;
  return pixels / pixelsPerMs;
}

export function getMagneticSnapTime(
  rawTime: number,
  duration: number,
  keyframeTimes: readonly number[],
  pixelsPerMs: number,
  snapThresholdPx = 10,
): number {
  if (!Number.isFinite(rawTime) || !Number.isFinite(pixelsPerMs) || pixelsPerMs <= 0) return rawTime;

  const snapThresholdMs = snapThresholdPx / pixelsPerMs;
  if (Math.abs(rawTime) < snapThresholdMs) return 0;
  if (Math.abs(rawTime - duration) < snapThresholdMs) return duration;

  let closestDistance = Infinity;
  let closestTime = rawTime;

  for (const keyframeTime of keyframeTimes) {
    const distance = Math.abs(rawTime - keyframeTime);
    if (distance < snapThresholdMs && distance < closestDistance) {
      closestDistance = distance;
      closestTime = keyframeTime;
    }
  }

  if (closestDistance !== Infinity) return closestTime;

  const gridSnap = Math.round(rawTime / 100) * 100;
  return Math.abs(rawTime - gridSnap) < snapThresholdMs ? gridSnap : rawTime;
}
