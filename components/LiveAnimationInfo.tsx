import React, { useMemo } from 'react';
import {
  TransformState,
  AnimationData,
  TrackControlState,
  PROPERTY_ICONS,
  PROPERTY_COLORS,
  Keyframe,
  EasingValue,
} from '../types';
import EasingCurve from './timeline/EasingCurve';
import { SlidersHorizontal } from 'lucide-react';
import { getEasingFunction } from '../easing';
import { getActiveAnimationProperties } from '../utils/trackControls';

interface LiveAnimationInfoProps {
  isPlaying: boolean;
  transforms: TransformState;
  animationData: AnimationData;
  currentTime: number;
  duration: number;
  trackControls: Partial<Record<keyof TransformState, TrackControlState>>;
  globalEasing: EasingValue;
}

const getUnit = (key: keyof TransformState): string => {
  if (key === 'transformOriginZ') return 'px';
  if (
    key.includes('translate') ||
    key.includes('blur') ||
    key.includes('fontSize') ||
    key.includes('letterSpacing') ||
    key.includes('dropShadowBlur') ||
    key.includes('dropShadowX') ||
    key.includes('dropShadowY') ||
    key.includes('borderRadius')
  )
    return 'px';
  if (key.includes('rotate') || key.includes('skew')) return 'deg';
  if (key.includes('Origin') || key.includes('brightness') || key.includes('contrast')) return '%';
  return ''; // For scale, opacity
};

export default function LiveAnimationInfo({
  isPlaying,
  transforms,
  animationData,
  currentTime,
  duration,
  trackControls,
  globalEasing,
}: LiveAnimationInfoProps) {
  const activeAnimatedProperties = useMemo(() => {
    return getActiveAnimationProperties(animationData, trackControls);
  }, [animationData, trackControls]);

  const easingFunc = useMemo(() => getEasingFunction(globalEasing), [globalEasing]);
  const progress = duration > 0 ? currentTime / duration : 0;
  const easedProgress = easingFunc(Math.max(0, Math.min(1, progress)));

  if (!isPlaying || activeAnimatedProperties.length === 0) {
    return null;
  }

  const findCurrentEasing = (track: Keyframe[], time: number): string => {
    if (!track || track.length === 0) return 'linear';
    if (time <= track[0].time) return track[0].easing || 'linear';

    const currentSegmentIndex = track.findIndex((k) => k.time > time) - 1;

    if (currentSegmentIndex < -1) {
      return track[track.length - 1].easing || 'linear';
    }

    const currentKeyframe = track[currentSegmentIndex >= 0 ? currentSegmentIndex : track.length - 1];
    return currentKeyframe?.easing || 'linear';
  };

  return (
    <div className="live-animation-info absolute top-36 right-4 bg-zinc-950/70 backdrop-blur-sm rounded-lg p-3 text-[13px] shadow-xl text-zinc-400 font-mono z-20 pointer-events-none max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal size={16} strokeWidth={2} className="text-indigo-500" />
        <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[12px]">Live Animation Values</h3>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 gap-y-1.5 items-center">
        {activeAnimatedProperties.map((prop) => {
          const Icon = PROPERTY_ICONS[prop];
          const value = transforms[prop];
          const color = PROPERTY_COLORS[prop] || '#fff';
          const unit = getUnit(prop);
          const precision = unit === '' || prop.includes('scale') ? 2 : 0;
          const easing = findCurrentEasing(animationData[prop]!, currentTime);

          let valueDisplay: React.ReactNode;
          if (typeof value === 'number') {
            valueDisplay = (
              <>
                {value.toFixed(precision)}
                {unit}
              </>
            );
          } else if (typeof value === 'string' && prop === 'dropShadowColor') {
            valueDisplay = (
              <div className="w-4 h-4 rounded-sm border border-zinc-600" style={{ backgroundColor: value }} />
            );
          } else {
            valueDisplay = <span className="text-zinc-600">--</span>;
          }

          return (
            <React.Fragment key={prop}>
              <div className="flex items-center gap-1.5" title={prop}>
                {Icon && <Icon size={14} strokeWidth={2} color={color} />}
              </div>
              <span className="truncate text-zinc-400 text-[12px]">{prop}</span>
              <div className="text-zinc-200 font-medium text-right w-16 flex justify-end items-center h-full">
                {valueDisplay}
              </div>
              <div className="w-6 h-6 flex items-center justify-center opacity-75" title={`Easing: ${easing}`}>
                <EasingCurve easing={easing} width={20} height={20} color={color} />
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-zinc-700/50">
        <h4 className="text-[11px] uppercase tracking-wider font-bold text-zinc-300">Global Easing</h4>
        <div className="relative mt-1 bg-zinc-800/50 rounded p-1">
          <EasingCurve easing={globalEasing} width={280} height={30} color="#818cf8" />
          <div
            className="absolute w-2 h-2 bg-white rounded-full pointer-events-none"
            style={{
              left: `${Math.max(0, Math.min(1, progress)) * 100}%`,
              top: `${(1 - easedProgress) * 100}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.7)',
            }}
          />
        </div>
        <p className="text-center text-[10px] text-zinc-500 mt-1 truncate">{globalEasing}</p>
      </div>
    </div>
  );
}
