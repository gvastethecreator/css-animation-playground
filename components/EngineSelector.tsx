import React from "react";
import { AnimationEngine, ENGINE_COLORS } from "../types";

interface EngineSelectorProps {
  engine: AnimationEngine;
  onEngineChange: (engine: AnimationEngine) => void;
  disabled?: boolean;
}

const EngineSelector: React.FC<EngineSelectorProps> = ({
  engine: currentEngine,
  onEngineChange,
  disabled,
}) => {
  return (
    <div
      className={`flex items-center gap-1 p-1 bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {(Object.keys(ENGINE_COLORS) as AnimationEngine[]).map((engine) => {
        const colors = ENGINE_COLORS[engine];
        const isActive = currentEngine === engine;
        const label = engine === "threejs" ? "three.js" : engine;
        return (
          <button
            key={engine}
            onClick={() => onEngineChange(engine)}
            title={`Use ${engine} engine`}
            disabled={disabled}
            className={`relative flex-1 text-center text-[11px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-md transition-all ${
              isActive ? `${colors.bg} ${colors.text}` : "text-zinc-500 hover:bg-zinc-800"
            }`}
          >
            {label}
            {isActive && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default EngineSelector;
