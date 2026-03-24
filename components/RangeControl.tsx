import React, { useState, useEffect, useRef } from 'react';
import KeyframeButton from './KeyframeButton';
import { TransformState, PROPERTY_COLORS } from '../types';
import ActivationSwitch from './ActivationSwitch';
import Tooltip from './Tooltip';

interface RangeControlProps {
  label: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  propertyKey: keyof TransformState;
  isAnimated: boolean;
  hasKeyframeAtCurrentTime: boolean;
  onKeyframeToggle: () => void;
  isActivatable?: boolean;
  isEnabled?: boolean;
  onToggleEnabled?: () => void;
  disabled?: boolean;
}

function RangeControl({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  onMouseDown,
  onMouseUp,
  propertyKey,
  isAnimated,
  hasKeyframeAtCurrentTime,
  onKeyframeToggle,
  isActivatable,
  isEnabled,
  onToggleEnabled,
  disabled,
}: RangeControlProps) {
  const color = PROPERTY_COLORS[propertyKey] || '#818cf8';

  // Extract RGB components for CSS variable usage (simple hex to rgb conversion)
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '129, 140, 248';
  };
  const colorRgb = hexToRgb(color);

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure progress is clamped 0-100
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const isControlDisabled = disabled || (isActivatable && !isEnabled);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toFixed(step < 1 ? 2 : 0));
    }
  }, [value, isEditing, step]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleCommit = () => {
    setIsEditing(false);
    let numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      numericValue = Math.max(min, Math.min(max, numericValue));
      onChange(numericValue);
    } else {
      setInputValue(value.toFixed(step < 1 ? 2 : 0)); // Reset if invalid
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(value.toFixed(step < 1 ? 2 : 0));
    }
  };

  return (
    <div className={`space-y-2 py-1 ${isControlDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center text-[11px] leading-none">
        <div className="flex items-center gap-2">
          <div
            className="w-1 h-3 rounded-full transition-colors"
            style={{ backgroundColor: isAnimated ? color : 'transparent' }}
          />
          <KeyframeButton
            onClick={onKeyframeToggle}
            isAnimated={isAnimated}
            hasKeyframeAtCurrentTime={hasKeyframeAtCurrentTime}
            color={color}
          />
          {isActivatable && onToggleEnabled && (
            <ActivationSwitch isEnabled={isEnabled!} onToggle={onToggleEnabled} color={color} />
          )}
          <div className="font-bold text-zinc-300 flex items-center tracking-wide">{label}</div>
        </div>
        <Tooltip content="Click to edit value">
          <div
            className="font-mono text-zinc-400 cursor-pointer rounded px-1.5 py-0.5 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            onClick={() => !isEditing && setIsEditing(true)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleCommit}
                onKeyDown={handleKeyDown}
                min={min}
                max={max}
                step={step}
                className="w-14 bg-zinc-800 text-zinc-100 text-right p-0 m-0 border border-zinc-600 outline-none rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <span>
                {value.toFixed(step < 1 ? 2 : 0)}
                {unit}
              </span>
            )}
          </div>
        </Tooltip>
      </div>
      <div className="flex items-center px-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchEnd={onMouseUp}
          className={`custom-slider ${isAnimated ? 'is-animated' : ''}`}
          style={
            {
              '--slider-color': color,
              '--slider-color-rgb': colorRgb,
              background: `linear-gradient(90deg, ${color} ${percentage}%, #18181b ${percentage}%)`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}

export default React.memo(RangeControl);
