import React from "react";
import KeyframeButton from "./KeyframeButton";
import { TransformState, PROPERTY_COLORS, PROPERTY_ICONS } from "../types";
import Tooltip from "./Tooltip";

interface ToggleControlProps {
  label: React.ReactNode;
  value: boolean;
  onChange: (value: boolean) => void;
  propertyKey: keyof TransformState;
  isAnimated: boolean;
  hasKeyframeAtCurrentTime: boolean;
  onKeyframeToggle: () => void;
}

const ToggleControl: React.FC<ToggleControlProps> = ({
  label,
  value,
  onChange,
  propertyKey,
  isAnimated,
  hasKeyframeAtCurrentTime,
  onKeyframeToggle,
}) => {
  const color = PROPERTY_COLORS[propertyKey] || "#818cf8";
  const Icon = PROPERTY_ICONS[propertyKey];

  return (
    <div className="flex justify-between items-center py-1">
      <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-300">
        <div
          className="w-1 h-3 rounded-full transition-colors"
          style={{ backgroundColor: isAnimated ? color : "transparent" }}
        />
        <KeyframeButton
          onClick={onKeyframeToggle}
          isAnimated={isAnimated}
          hasKeyframeAtCurrentTime={hasKeyframeAtCurrentTime}
          color={color}
        />
        <div className="flex items-center tracking-wide">
          {Icon && <Icon size={14} strokeWidth={2} className="mr-1.5 text-zinc-500" />}
          {label}
        </div>
      </div>
      <Tooltip content={value ? "Disable" : "Enable"}>
        <button
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none 
            ${value ? "bg-indigo-500 shadow-glow-sm" : "bg-zinc-800 shadow-inner-depth"}`}
        >
          <span
            className={`${value ? "translate-x-4 bg-white" : "translate-x-0 bg-zinc-500"}
                pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
          />
        </button>
      </Tooltip>
    </div>
  );
};

export default ToggleControl;
