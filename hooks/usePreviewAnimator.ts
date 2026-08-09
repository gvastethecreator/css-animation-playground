import { useState, useEffect, useRef } from 'react';
import { TransformState, PresetAnimationName, ANIMATION_PRESETS } from '../types';
import { createAnimationSampler } from '../utils/animationSampling';

export function usePreviewAnimator(presetName: PresetAnimationName | null, baseTransforms: TransformState) {
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
    const sampleAnimation = createAnimationSampler(preset.animationData);

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;

      let effectiveTime = elapsed;
      if (isLooping) {
        effectiveTime = elapsed % duration;
        if (direction === 'alternate') {
          const cycle = Math.floor(elapsed / duration);
          if (cycle % 2 !== 0) {
            // If it's an odd cycle (e.g., 1, 3, 5...), reverse the time
            effectiveTime = duration - effectiveTime;
          }
        }
      } else {
        effectiveTime = Math.min(elapsed, duration);
      }

      const animatedValues = sampleAnimation(effectiveTime);
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
