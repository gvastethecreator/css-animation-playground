import React from "react";
import { StageStyleName, STAGE_STYLES } from "../types";
import Tooltip from "./Tooltip";

interface StageStyleSelectorProps {
  selectedStyle: StageStyleName;
  onStyleChange: (style: StageStyleName) => void;
}

export default function StageStyleSelector({
  selectedStyle,
  onStyleChange,
}: StageStyleSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {(Object.keys(STAGE_STYLES) as StageStyleName[]).map((name) => {
        const style = STAGE_STYLES[name];
        return (
          <Tooltip key={name} content={name}>
            <button
              onClick={() => onStyleChange(name)}
              className={`flex items-center justify-center rounded-md transition-colors aspect-square ${
                selectedStyle === name
                  ? "bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-500"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              }`}
            >
              <style.icon size={20} strokeWidth={2} />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
