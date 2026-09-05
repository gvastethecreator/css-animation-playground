import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TransformState, AnimationData, TimelineRuntimeState, TrackControlState } from '../types';
import { getTransformString, getFilterString, getWillChangeString } from '../utils/styleUtils';
import { useAppStore } from '../store/useAppStore';
import { createAnimationSampler } from '../utils/animationSampling';
import { getActiveAnimationProperties } from '../utils/trackControls';
import { mapElapsedToTimelineTime } from '../utils/playbackClock';

type PlaybackTimelineState = Omit<TimelineRuntimeState, 'fps'>;

export function useAnimationPlayer(
  initialTransforms: TransformState,
  animationData: AnimationData,
  timelineState: PlaybackTimelineState,
  onCurrentTimeChange: (time: number) => void,
  trackControls: Partial<Record<keyof TransformState, TrackControlState>>,
  onPlaybackComplete?: () => void,
  resetKey?: string,
  stageElementRef?: React.RefObject<HTMLDivElement | null>,
) {
  const [animatedTransforms, setAnimatedTransforms] = useState<TransformState>(initialTransforms);

  const sampleAnimation = useMemo(() => createAnimationSampler(animationData), [animationData]);

  // Refs for the animation loop
  const stateRef = useRef(timelineState);
  const animationDataRef = useRef(animationData);
  const sampleAnimationRef = useRef(sampleAnimation);
  const controlsRef = useRef(trackControls);
  const initialTransformsRef = useRef(initialTransforms);
  const onCurrentTimeChangeRef = useRef(onCurrentTimeChange);
  const onPlaybackCompleteRef = useRef(onPlaybackComplete);

  // Sync refs
  useEffect(() => {
    stateRef.current = timelineState;
  }, [timelineState]);
  useEffect(() => {
    animationDataRef.current = animationData;
    sampleAnimationRef.current = sampleAnimation;
  }, [animationData, sampleAnimation]);
  useEffect(() => {
    controlsRef.current = trackControls;
  }, [trackControls]);
  useEffect(() => {
    initialTransformsRef.current = initialTransforms;
  }, [initialTransforms]);
  useEffect(() => {
    onCurrentTimeChangeRef.current = onCurrentTimeChange;
  }, [onCurrentTimeChange]);
  useEffect(() => {
    onPlaybackCompleteRef.current = onPlaybackComplete;
  }, [onPlaybackComplete]);

  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(timelineState.currentTime);

  // CRITICAL: Watch for external time changes (scrubbing, preset load, reset)
  // If currentTime changes significantly from our internal tracking, update internal ref.
  useEffect(() => {
    const diff = Math.abs(timelineState.currentTime - lastTimeRef.current);
    // If deviation is large (scrubbing) or we are stopped, sync immediately
    if (!timelineState.isPlaying || diff > 50) {
      lastTimeRef.current = timelineState.currentTime;
      // If we are playing, forcing startTimeRef to undefined will cause a re-sync in the next tick
      if (timelineState.isPlaying) {
        startTimeRef.current = undefined;
      }
    }
  }, [timelineState.currentTime, timelineState.isPlaying]);

  // Reset internal state completely when resetKey changes (New Preset loaded)
  useEffect(() => {
    startTimeRef.current = undefined;
    lastTimeRef.current = 0;
  }, [resetKey]);

  const activeAnimatedProperties = useMemo(() => {
    return getActiveAnimationProperties(animationData, trackControls);
  }, [animationData, trackControls]);

  const willChangeString = useMemo(() => getWillChangeString(activeAnimatedProperties), [activeAnimatedProperties]);

  const calculateAnimatedValues = useCallback((time: number): Partial<TransformState> => {
    const currentAnimationData = animationDataRef.current;
    const currentTimelineState = stateRef.current;
    const currentControls = controlsRef.current;

    const activeProperties = getActiveAnimationProperties(currentAnimationData, currentControls);

    return sampleAnimationRef.current(time, currentTimelineState.easing, activeProperties);
  }, []);

  // Calculate visuals for current frame/time
  // This runs on every render to ensure UI (sliders) match the time
  useEffect(() => {
    if (!timelineState.isPlaying) {
      const animatedValues = calculateAnimatedValues(timelineState.currentTime);
      setAnimatedTransforms({ ...initialTransforms, ...animatedValues });
    }
  }, [timelineState.currentTime, initialTransforms, calculateAnimatedValues, animationData, timelineState.isPlaying]);

  // Animation Loop
  useEffect(() => {
    if (!timelineState.isPlaying) {
      startTimeRef.current = undefined;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    let lastUpdate = -1;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = timestamp - lastTimeRef.current;
      }

      const { duration, isLooping, direction } = stateRef.current;
      const { time: effectiveTime, shouldStop } = mapElapsedToTimelineTime(
        timestamp - startTimeRef.current,
        duration,
        isLooping,
        direction,
      );

      lastTimeRef.current = effectiveTime;

      const animatedValues = calculateAnimatedValues(effectiveTime);
      const currentTransforms = { ...initialTransformsRef.current, ...animatedValues };

      if (stageElementRef?.current) {
        Object.assign(stageElementRef.current.style, {
          transform: getTransformString(currentTransforms),
          transformOrigin: `${currentTransforms.transformOriginX}% ${currentTransforms.transformOriginY}% ${currentTransforms.transformOriginZ}px`,
          opacity: currentTransforms.opacityEnabled ? currentTransforms.opacity : 1,
          filter: getFilterString(currentTransforms),
          borderRadius: currentTransforms.borderRadiusEnabled ? `${currentTransforms.borderRadius}px` : '0px',
        });
      }

      if (timestamp - lastUpdate > 66 || shouldStop || lastUpdate < 0) {
        setAnimatedTransforms(currentTransforms);
        useAppStore.getState().setTimelineState({
          currentTime: effectiveTime,
          ...(shouldStop ? { isPlaying: false } : {}),
        });
        lastUpdate = timestamp;
      }

      if (shouldStop) {
        startTimeRef.current = undefined;
        if (onPlaybackCompleteRef.current) onPlaybackCompleteRef.current();
      } else {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [timelineState.isPlaying, calculateAnimatedValues, stageElementRef]);

  return { animatedTransforms, calculateAnimatedValues, willChangeString };
}
