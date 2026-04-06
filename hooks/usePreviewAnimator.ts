import { useState, useEffect, useRef } from "react";
import { TransformState, PresetAnimationName, ANIMATION_PRESETS } from "../types";
import { getEasingFunction } from "../easing";
import { lerp, lerpColor } from "../utils/mathUtils";

export function usePreviewAnimator(
  presetName: PresetAnimationName | null,
  baseTransforms: TransformState,
) {
  const [previewTransforms, setPreviewTransforms] = useState<TransformState | null>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!presetName) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      setPreviewTransforms(null);
      return;
    }

    const preset = ANIMATION_PRESETS[presetName];
    if (!preset) return;

    let startTime: number | null = null;
    const { duration, isLooping, direction } = preset.timelineState;

    const calculateValues = (time: number) => {
      const newValues: Partial<TransformState> = {};
      const animationData = preset.animationData;

      for (const property in animationData) {
        const key = property as keyof TransformState;
        const track = animationData[key];
        if (!track || track.length === 0) continue;

        const sortedTrack = track.sort((a, b) => a.time - b.time);
        if (time <= sortedTrack[0].time) {
          (newValues as any)[key] = sortedTrack[0].value;
          continue;
        }
        if (time >= sortedTrack[sortedTrack.length - 1].time) {
          (newValues as any)[key] = sortedTrack[sortedTrack.length - 1].value;
          continue;
        }

        const p2Index = sortedTrack.findIndex((p) => p.time >= time);
        const p1 = sortedTrack[p2Index - 1];
        const p2 = sortedTrack[p2Index];
        if (!p1 || !p2) continue;

        const segmentDuration = p2.time - p1.time;
        const progress = segmentDuration === 0 ? 1 : (time - p1.time) / segmentDuration;

        const easingName = p1.easing;
        const easingFunc = getEasingFunction(easingName || "linear");

        const easedProgress = easingFunc(progress);
        const val1 = p1.value;
        const val2 = p2.value;

        if (typeof val1 === "number" && typeof val2 === "number") {
          (newValues as any)[key] = lerp(val1, val2, easedProgress);
        } else if (typeof val1 === "string" && typeof val2 === "string") {
          (newValues as any)[key] = lerpColor(val1, val2, easedProgress);
        } else if (typeof val1 === "boolean" || typeof val2 === "boolean") {
          (newValues as any)[key] = easedProgress < 0.5 ? val1 : val2;
        }
      }
      return newValues;
    };

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;

      let effectiveTime = elapsed;
      if (isLooping) {
        effectiveTime = elapsed % duration;
        if (direction === "alternate") {
          const cycle = Math.floor(elapsed / duration);
          if (cycle % 2 !== 0) {
            // If it's an odd cycle (e.g., 1, 3, 5...), reverse the time
            effectiveTime = duration - effectiveTime;
          }
        }
      } else {
        effectiveTime = Math.min(elapsed, duration);
      }

      const animatedValues = calculateValues(effectiveTime);
      setPreviewTransforms({
        ...baseTransforms,
        ...preset.initialTransforms,
        ...animatedValues,
      });

      if (!isLooping && elapsed >= duration) {
        startTime = null; // Reset for next loop if re-hovered
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [presetName, baseTransforms]);

  return { previewTransforms };
}
