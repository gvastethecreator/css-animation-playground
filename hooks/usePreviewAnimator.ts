import { useState, useEffect, useRef } from 'react';
import { TransformState, PresetAnimationName, ANIMATION_PRESETS } from '../types';
import { createAnimationSampler } from '../utils/animationSampling';
import { mapElapsedToTimelineTime } from '../utils/playbackClock';

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
    let lastCommit = Number.NEGATIVE_INFINITY;
    const { duration, isLooping, direction } = preset.timelineState;
    const sampleAnimation = createAnimationSampler(preset.animationData);

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const { time: effectiveTime, shouldStop } = mapElapsedToTimelineTime(
        timestamp - startTime,
        duration,
        isLooping,
        direction,
      );
      const nextTransforms = {
        ...baseTransforms,
        ...preset.initialTransforms,
        ...sampleAnimation(effectiveTime),
      };

      if (lastCommit < 0 || timestamp - lastCommit > 66 || shouldStop) {
        lastCommit = timestamp;
        setPreviewTransforms(nextTransforms);
      }

      if (shouldStop) return;
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
