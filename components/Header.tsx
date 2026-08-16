import {
  CornerUpLeft,
  CornerUpRight,
  Dices,
  GitFork,
  HelpCircle,
  Loader,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { AnimationEngine, PresetAnimationName } from '../types';
import AnimationPresetPopover from './AnimationPresetPopover';
import EngineSelector from './EngineSelector';
import Tooltip from './Tooltip';

interface HeaderProps {
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  onReset: () => void;
  onShowHelp: () => void;
  onAnimationPresetClick: (preset: PresetAnimationName) => void;
  onPresetHoverStart: (preset: PresetAnimationName) => void;
  onPresetHoverEnd: () => void;
  onFileChange: (file: File) => void;
  onFileRemove: () => void;
  onLoadRandomModel: () => void;
  hasMedia: boolean;
  isLoadingModel: boolean;
  animationEngine: AnimationEngine;
  onAnimationEngineChange: (engine: AnimationEngine) => void;
}

const Header: React.FC<HeaderProps> = ({
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  onReset,
  onShowHelp,
  onAnimationPresetClick,
  onPresetHoverStart,
  onPresetHoverEnd,
  onFileChange,
  onFileRemove,
  onLoadRandomModel,
  hasMedia,
  isLoadingModel,
  animationEngine,
  onAnimationEngineChange,
}) => {
  const [isPresetPopoverOpen, setIsPresetPopoverOpen] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handlePresetClick = useCallback(
    (preset: PresetAnimationName) => {
      onAnimationPresetClick(preset);
      setIsPresetPopoverOpen(false);
      setPopoverAnchorEl(null);
    },
    [onAnimationPresetClick],
  );

  const handleOpenPresets = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setPopoverAnchorEl(event.currentTarget);
    setIsPresetPopoverOpen(true);
  }, []);

  const handleClosePresets = useCallback(() => {
    setIsPresetPopoverOpen(false);
    setPopoverAnchorEl(null);
  }, []);

  const handleFileChangeEvent = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onFileChange(e.target.files[0]);
      }
    },
    [onFileChange],
  );

  const btnClass =
    'p-2 rounded-lg text-zinc-400 hover:text-zinc-100 btn-tactile disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:bg-transparent';

  return (
    <header className="app-header flex items-center justify-between px-4 py-2 glass-panel border-b border-zinc-700/50 shrink-0 h-16 z-30">
      {/* Left Section */}
      <div className="header-left flex items-center gap-4">
        <div className="header-brand flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-raised bg-linear-to-br from-indigo-700 to-purple-800 border border-white/10">
            3D
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 tracking-tight leading-none">CSS</h1>
            <h1 className="text-xs font-semibold text-zinc-500 tracking-wider leading-none">PLAYGROUND</h1>
          </div>
        </div>

        <div className="header-divider h-6 w-px bg-zinc-700/50" />

        <Tooltip content="Browse animation presets">
          <button
            onClick={handleOpenPresets}
            className={`header-presets btn-tactile px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-zinc-300 ${isPresetPopoverOpen ? 'active' : ''}`}
          >
            <Sparkles size={14} strokeWidth={2} className="text-indigo-400" />
            Presets
          </button>
        </Tooltip>
        <AnimationPresetPopover
          isOpen={isPresetPopoverOpen}
          onClose={handleClosePresets}
          onPresetClick={handlePresetClick}
          onPresetHover={onPresetHoverStart}
          onPresetLeave={onPresetHoverEnd}
          anchorEl={popoverAnchorEl}
        />

        <div className="header-media flex items-center gap-2">
          <Tooltip content="Upload Image, Video (.webm), or 3D Model (.glb, .gltf)">
            <label
              htmlFor="header-file-upload"
              className="header-upload btn-tactile px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer"
            >
              <Upload size={14} strokeWidth={2} />
              Upload
            </label>
          </Tooltip>
          <input
            id="header-file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChangeEvent}
            accept="image/*,video/webm,.gltf,.glb"
          />
          <Tooltip content="Load a random sample 3D model">
            <button
              onClick={onLoadRandomModel}
              disabled={isLoadingModel}
              className="header-sample btn-tactile px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-zinc-300 disabled:opacity-50"
            >
              {isLoadingModel ? (
                <Loader size={14} strokeWidth={2} className="animate-spin" />
              ) : (
                <Dices size={14} strokeWidth={2} />
              )}
              {isLoadingModel ? 'Loading...' : 'Sample'}
            </button>
          </Tooltip>
          {hasMedia && (
            <Tooltip content="Remove uploaded media">
              <button
                onClick={onFileRemove}
                className="btn-tactile w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-300"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Center Section */}
      <div className="header-engine absolute left-1/2">
        <EngineSelector engine={animationEngine} onEngineChange={onAnimationEngineChange} />
      </div>

      {/* Right Section */}
      <div className="header-right flex items-center gap-2">
        <div className="header-history flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5 shadow-inner-depth">
          <Tooltip content="Undo (⌘Z)">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
              className="p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-30"
            >
              <CornerUpLeft size={16} strokeWidth={2} />
            </button>
          </Tooltip>
          <Tooltip content="Redo (⌘⇧Z)">
            <button
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
              className="p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-30"
            >
              <CornerUpRight size={16} strokeWidth={2} />
            </button>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-zinc-700/50 mx-1" />

        <Tooltip content="Reset Scene">
          <button onClick={onReset} className={btnClass}>
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </Tooltip>
        <Tooltip content="Keyboard Shortcuts">
          <button onClick={onShowHelp} className={btnClass}>
            <HelpCircle size={16} strokeWidth={2} />
          </button>
        </Tooltip>
        <Tooltip content="View source on GitHub">
          <a
            href="https://github.com/gvastethecreator/css-animation-playground"
            target="_blank"
            rel="noopener noreferrer"
            className={btnClass}
            aria-label="View source on GitHub"
          >
            <GitFork size={16} strokeWidth={2} />
          </a>
        </Tooltip>
      </div>
    </header>
  );
};

export default React.memo(Header);
