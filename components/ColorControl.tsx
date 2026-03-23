import React, { useRef } from 'react';
import KeyframeButton from './KeyframeButton';
import { TransformState, PROPERTY_COLORS } from '../types';
import ActivationSwitch from './ActivationSwitch';
import Tooltip from './Tooltip';

interface AlphaSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  propertyKey: keyof TransformState;
}

const AlphaSlider: React.FC<AlphaSliderProps> = ({
  label, value, onChange, min, max, step, propertyKey
}) => {
  const color = PROPERTY_COLORS[propertyKey] || '#818cf8';
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-2">
      <label className="text-zinc-500 text-[11px] font-medium w-12">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full custom-slider"
        style={{
          '--slider-color': color,
          '--progress': `${progress}%`,
        } as React.CSSProperties}
      />
    </div>
  );
};


interface ColorControlProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  propertyKey: keyof TransformState;
  isAnimated: boolean;
  hasKeyframeAtCurrentTime: boolean;
  onKeyframeToggle: () => void;
  isActivatable?: boolean;
  isEnabled?: boolean;
  onToggleEnabled?: () => void;
  disabled?: boolean;
}

function ColorControl({
  label, value, onChange, propertyKey, isAnimated, hasKeyframeAtCurrentTime, onKeyframeToggle,
  isActivatable, isEnabled, onToggleEnabled, disabled
}: ColorControlProps) {
  const color = PROPERTY_COLORS[propertyKey] || '#818cf8';
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isControlDisabled = disabled || (isActivatable && !isEnabled);

  const openColorPicker = () => {
    colorInputRef.current?.click();
  };
  
  const toHex = (rgba: string) => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#000000';
    return `#${(+match[1]).toString(16).padStart(2, '0')}${(+match[2]).toString(16).padStart(2, '0')}${(+match[3]).toString(16).padStart(2, '0')}`;
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const currentAlpha = value.match(/rgba?\([^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\)/)?.[1] || '1';
    onChange(`rgba(${r}, ${g}, ${b}, ${currentAlpha})`);
  };
  
  const handleAlphaChange = (newAlpha: number) => {
    const rgb = value.match(/rgba?\((\d+,\s*\d+,\s*\d+)/)?.[1] || '0,0,0';
    onChange(`rgba(${rgb}, ${newAlpha.toFixed(2)})`);
  }

  const currentAlpha = parseFloat(value.match(/rgba?\([^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\)/)?.[1] || '1');


  return (
    <div className={`space-y-1 ${isControlDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center text-[11px] leading-none">
        <div className="flex items-center gap-1.5">
           <div 
             className="w-1 h-2 rounded-full transition-colors" 
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
          <div className="font-bold text-zinc-300 flex items-center">{label}</div>
        </div>
        <div className="flex items-center gap-2">
            <Tooltip content="Open color picker">
              <button
                  onClick={openColorPicker}
                  className="w-5 h-5 rounded-md border-2 border-zinc-700"
                  style={{ backgroundColor: value }}
              />
            </Tooltip>
            <input 
                ref={colorInputRef}
                type="color" 
                value={toHex(value)} 
                onChange={handleColorChange}
                className="absolute -z-10 w-0 h-0 opacity-0"
            />
        </div>
      </div>
       <AlphaSlider
          label="Opacity"
          value={currentAlpha}
          onChange={handleAlphaChange}
          min={0}
          max={1}
          step={0.01}
          propertyKey={propertyKey}
       />
    </div>
  );
}

export default React.memo(ColorControl);