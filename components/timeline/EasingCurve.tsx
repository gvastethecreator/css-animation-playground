import React from 'react';
import { getEasingFunction } from '../../easing';
import { EasingName } from '../../types';

interface EasingCurveProps {
  easing: EasingName | string;
  width: number;
  height: number;
  color: string;
  strokeWidth?: number;
}

export default function EasingCurve({ easing, width, height, color, strokeWidth = 2 }: EasingCurveProps) {
  const func = getEasingFunction(easing);
  
  if (width <= 0 || height <= 0) return null;

  const points = 20;
  let pathData = `M 0 ${height}`;
  
  for (let i = 0; i <= points; i++) {
    const x = (i / points);
    const y = func(x);
    pathData += ` L ${x * width} ${height - (y * height)}`;
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={pathData} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin='round' strokeLinecap='round' />
    </svg>
  );
}