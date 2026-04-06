import React from "react";
import { VIEW_PRESETS, PresetName } from "../types";
import Tooltip from "./Tooltip";

interface ViewPresetControlsProps {
  onViewPresetClick: (preset: PresetName) => void;
}

export default function ViewPresetControls({ onViewPresetClick }: ViewPresetControlsProps) {
  return (
    <div
      className="flex items-center gap-0.5 p-0.5 bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {(Object.keys(VIEW_PRESETS) as PresetName[]).map((preset) => (
        <Tooltip key={preset} content={`Set view to ${preset}`}>
          <button
            onClick={() => onViewPresetClick(preset)}
            className="px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors text-zinc-300 hover:bg-zinc-800"
          >
            {preset}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
