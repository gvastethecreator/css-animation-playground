import React, { useState, useRef } from "react";
import { PresetAnimationName } from "../types";
import AnimationPresetPopover from "./AnimationPresetPopover";
import { Upload, Dices, Loader, Sparkles, Trash2 } from "lucide-react";

interface ToolbarProps {
  onAnimationPresetClick: (preset: PresetAnimationName) => void;
  onPresetHoverStart: (preset: PresetAnimationName) => void;
  onPresetHoverEnd: () => void;
  onFileChange: (file: File) => void;
  onFileRemove: () => void;
  onLoadRandomModel: () => void;
  hasMedia: boolean;
  isLoadingModel: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAnimationPresetClick,
  onPresetHoverStart,
  onPresetHoverEnd,
  onFileChange,
  onFileRemove,
  onLoadRandomModel,
  hasMedia,
  isLoadingModel,
}) => {
  const [isPresetPopoverOpen, setIsPresetPopoverOpen] = useState(false);
  const presetButtonRef = useRef<HTMLButtonElement>(null);

  const handlePresetClick = (preset: PresetAnimationName) => {
    onAnimationPresetClick(preset);
    setIsPresetPopoverOpen(false);
  };

  const handleFileChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-950 border-b border-zinc-800 shrink-0">
      <div className="flex items-center gap-2">
        <button
          ref={presetButtonRef}
          onClick={() => setIsPresetPopoverOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium rounded-md transition-colors"
        >
          <Sparkles size={16} strokeWidth={2} className="text-indigo-400" />
          Presets
        </button>
        <AnimationPresetPopover
          isOpen={isPresetPopoverOpen}
          onClose={() => setIsPresetPopoverOpen(false)}
          onPresetClick={handlePresetClick}
          onPresetHover={onPresetHoverStart}
          onPresetLeave={onPresetHoverEnd}
          anchorEl={presetButtonRef.current}
        />
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="toolbar-file-upload"
          className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium rounded-md transition-colors cursor-pointer"
        >
          <Upload size={16} strokeWidth={2} />
          Upload
        </label>
        <input
          id="toolbar-file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChangeEvent}
          accept="image/*,video/webm,.gltf,.glb"
        />
        <button
          onClick={onLoadRandomModel}
          disabled={isLoadingModel}
          className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoadingModel ? (
            <Loader size={16} strokeWidth={2} className="animate-spin" />
          ) : (
            <Dices size={16} strokeWidth={2} />
          )}
          {isLoadingModel ? "Loading..." : "Sample"}
        </button>
        {hasMedia && (
          <button
            onClick={onFileRemove}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 text-[13px] font-medium rounded-md transition-colors"
          >
            <Trash2 size={16} strokeWidth={2} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
