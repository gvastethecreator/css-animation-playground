import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AnimationData, PROPERTY_COLORS, Keyframe, EasingValue } from '../../types';
import EasingCurve from './EasingCurve';
import { getEasingFunction } from '../../easing';
import { clampTimelineTime, snapTimeToFrame } from '../../utils/timelineMath';

interface CondensedTimelineViewProps {
  animationData: AnimationData;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  easing: EasingValue;
  onCurrentTimeChange: (time: number) => void;
  fps: number;
}

const CondensedTimelineView: React.FC<CondensedTimelineViewProps> = ({
  animationData,
  duration,
  currentTime,
  isPlaying: _isPlaying,
  easing,
  onCurrentTimeChange,
  fps,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleScrubberInteraction = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if (!containerRef.current || duration <= 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      let newTime = progress * duration;

      if (e.shiftKey) {
        newTime = snapTimeToFrame(newTime, fps);
      }
      onCurrentTimeChange(clampTimelineTime(newTime, duration));
    },
    [duration, fps, onCurrentTimeChange],
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleScrubberInteraction(e);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleScrubberInteraction(moveEvent);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const func = getEasingFunction(easing);

  const progress = duration > 0 ? currentTime / duration : 0;
  const easedProgress = func(progress);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-3.5 bg-zinc-800 rounded-full overflow-hidden cursor-ew-resize"
      onMouseDown={handleMouseDown}
    >
      {/* Easing Curve Background */}
      <div className="absolute inset-0 opacity-60">
        {containerWidth > 0 && (
          <EasingCurve easing={easing} width={containerWidth} height={14} color="#818cf8" strokeWidth={2} />
        )}
      </div>

      {/* Keyframe markers */}
      {Object.entries(animationData).map(
        ([prop, track]) =>
          Array.isArray(track) &&
          (track as Keyframe[]).map((kf) => (
            <div
              key={kf.id}
              className="absolute top-0 w-px h-full z-10"
              style={{
                left: `calc(${(kf.time / duration) * 100}%)`,
                backgroundColor: PROPERTY_COLORS[prop] || '#fff',
                opacity: 0.5,
              }}
            />
          )),
      )}

      {/* Animated Easing Bullet */}
      <div
        className="absolute w-2 h-2 bg-white rounded-full z-20 pointer-events-none"
        style={{
          left: `calc(${progress * 100}%)`,
          top: `calc(${(1 - easedProgress) * 100}%)`,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 5px rgba(255, 255, 255, 0.7)',
          willChange: 'transform',
        }}
      />

      {/* Main playhead line */}
      <div
        className="absolute top-0 h-full w-0.5 bg-red-500 z-30"
        style={{
          left: `calc(${progress * 100}%)`,
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
};

export default CondensedTimelineView;
