
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TransformState, AnimationData, EasingName, TrackControlState } from '../types';
import { getEasingFunction } from '../easing';
import { lerp, lerpColor } from '../utils/mathUtils';
import { getTransformString, getFilterString } from '../utils/styleUtils';
import { useAppStore } from '../store/useAppStore';

export function useAnimationPlayer(
  initialTransforms: TransformState,
  animationData: AnimationData,
  timelineState: {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    isLooping: boolean;
    direction: 'normal' | 'alternate';
    easing: EasingName | string;
  },
  onCurrentTimeChange: (time: number) => void,
  trackControls: Partial<Record<keyof TransformState, TrackControlState>>,
  onPlaybackComplete?: () => void,
  resetKey?: string,
  stageElementRef?: React.RefObject<HTMLDivElement | null>
) {
  const [animatedTransforms, setAnimatedTransforms] = useState<TransformState>(initialTransforms);
  
  // Pre-sort and cache animation tracks
  const sortedAnimationData = useMemo(() => {
      const sorted: AnimationData = {};
      Object.keys(animationData).forEach(key => {
          const k = key as keyof TransformState;
          if (animationData[k]) {
              sorted[k] = [...animationData[k]!].sort((a, b) => a.time - b.time);
          }
      });
      return sorted;
  }, [animationData]);

  // Refs for the animation loop
  const stateRef = useRef(timelineState);
  const sortedAnimationDataRef = useRef(sortedAnimationData);
  const controlsRef = useRef(trackControls);
  const initialTransformsRef = useRef(initialTransforms);
  const onCurrentTimeChangeRef = useRef(onCurrentTimeChange);
  const onPlaybackCompleteRef = useRef(onPlaybackComplete);
  
  // Sync refs
  useEffect(() => { stateRef.current = timelineState; }, [timelineState]);
  useEffect(() => { sortedAnimationDataRef.current = sortedAnimationData; }, [sortedAnimationData]);
  useEffect(() => { controlsRef.current = trackControls; }, [trackControls]);
  useEffect(() => { initialTransformsRef.current = initialTransforms; }, [initialTransforms]);
  useEffect(() => { onCurrentTimeChangeRef.current = onCurrentTimeChange; }, [onCurrentTimeChange]);
  useEffect(() => { onPlaybackCompleteRef.current = onPlaybackComplete; }, [onPlaybackComplete]);

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
    const allAnimatedProps = Object.keys(animationData) as (keyof TransformState)[];
    const soloedTracks = allAnimatedProps.filter(prop => trackControls[prop]?.solo);
    if (soloedTracks.length > 0) return soloedTracks;
    return allAnimatedProps.filter(prop => !trackControls[prop]?.mute);
  }, [animationData, trackControls]);

  const willChangeString = useMemo(() => {
      if (activeAnimatedProperties.length === 0) return 'auto';
      return 'transform, opacity, filter';
  }, [activeAnimatedProperties]);

  const calculateAnimatedValues = useCallback((time: number): Partial<TransformState> => {
    const newValues: Partial<TransformState> = {};
    const currentAnimationData = sortedAnimationDataRef.current;
    const currentTimelineState = stateRef.current;
    const currentControls = controlsRef.current;
    
    const propsToAnimate = Object.keys(currentAnimationData) as (keyof TransformState)[];
    const isAnySolo = Object.values(currentControls).some((c) => (c as TrackControlState)?.solo);

    for (const property of propsToAnimate) {
        const control = currentControls[property];
        if (control?.mute || (isAnySolo && !control?.solo)) continue;

      const track = currentAnimationData[property];
      if (!track || track.length === 0) continue;

      const sortedTrack = track;
      
      if (time <= sortedTrack[0].time) {
        (newValues as any)[property] = sortedTrack[0].value;
        continue;
      }
      if (time >= sortedTrack[sortedTrack.length - 1].time) {
        (newValues as any)[property] = sortedTrack[sortedTrack.length - 1].value;
        continue;
      }

      const p2Index = sortedTrack.findIndex(p => p.time >= time);
      const p1 = sortedTrack[p2Index - 1];
      const p2 = sortedTrack[p2Index];

      if (!p1 || !p2) continue;

      const segmentDuration = p2.time - p1.time;
      const progress = segmentDuration === 0 ? 1 : (time - p1.time) / segmentDuration;
      
      const easingName = p1.easing || currentTimelineState.easing;
      const easingFunc = getEasingFunction(easingName);
      const easedProgress = easingFunc(progress);

      const val1 = p1.value;
      const val2 = p2.value;

      if (typeof val1 === 'number' && typeof val2 === 'number') {
        (newValues as any)[property] = lerp(val1, val2, easedProgress);
      } else if (typeof val1 === 'string' && typeof val2 === 'string') {
        (newValues as any)[property] = lerpColor(val1, val2, easedProgress);
      } else if (typeof val1 === 'boolean' || typeof val2 === 'boolean') {
        (newValues as any)[property] = (easedProgress < 0.5 ? val1 : val2);
      }
    }
    return newValues;
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

    let lastUpdate = 0;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = timestamp - lastTimeRef.current;
      }

      const { duration, isLooping, direction } = stateRef.current;
      const absoluteElapsed = timestamp - startTimeRef.current;
      let effectiveTime = absoluteElapsed;
      let shouldStop = false;

      if (duration > 0) {
          if (isLooping) {
              const cycleTime = absoluteElapsed % duration;
              if (direction === 'alternate') {
                  const loopCount = Math.floor(absoluteElapsed / duration);
                  const isReversed = loopCount % 2 !== 0;
                  effectiveTime = isReversed ? duration - cycleTime : cycleTime;
              } else {
                  effectiveTime = cycleTime;
              }
          } else {
              if (absoluteElapsed >= duration) {
                  effectiveTime = duration;
                  shouldStop = true;
              }
          }
      }

      lastTimeRef.current = effectiveTime;
      
      // Direct DOM update for 60fps performance
      if (stageElementRef?.current) {
         const animatedValues = calculateAnimatedValues(effectiveTime);
         const currentTransforms = { ...initialTransformsRef.current, ...animatedValues };
         
         const targetStyle = {
            transform: getTransformString(currentTransforms),
            transformOrigin: `${currentTransforms.transformOriginX}% ${currentTransforms.transformOriginY}% ${currentTransforms.transformOriginZ}px`,
            opacity: currentTransforms.opacityEnabled ? currentTransforms.opacity : 1,
            filter: getFilterString(currentTransforms),
            borderRadius: currentTransforms.borderRadiusEnabled ? `${currentTransforms.borderRadius}px` : '0px',
         };
         
         Object.assign(stageElementRef.current.style, targetStyle);
      }

      // Throttle React state updates to ~15fps to keep UI somewhat in sync without killing performance
      if (timestamp - lastUpdate > 66) {
         useAppStore.getState().setTimelineState({ currentTime: effectiveTime });
         lastUpdate = timestamp;
      }

      if (shouldStop) {
          startTimeRef.current = undefined;
          useAppStore.getState().setTimelineState({ currentTime: effectiveTime, isPlaying: false });
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
