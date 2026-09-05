import React, { useEffect, useMemo, useState } from 'react';
import {
  AnimationData,
  AnimationEngine,
  ENGINE_COLORS,
  StageElement,
  TimelineDocumentState,
  TrackControlState,
  TransformState,
} from '../types';
import { ChevronDown, ChevronUp, Code, Loader } from 'lucide-react';
import { useVerticalResize } from '../hooks/useVerticalResize';
import { generateCodeExport } from '../utils/codeExport';
import { getActiveAnimationProperties } from '../utils/trackControls';
import Tooltip from './Tooltip';

interface CodeOutputPanelProps {
  transforms: TransformState;
  height: number;
  onHeightChange: (height: number) => void;
  animationData: AnimationData;
  timelineState: TimelineDocumentState;
  trackControls: Partial<Record<keyof TransformState, TrackControlState>>;
  stageElement: StageElement;
  engine: AnimationEngine;
}

const CodeOutputPanel: React.FC<CodeOutputPanelProps> = ({
  transforms,
  height,
  onHeightChange,
  animationData,
  timelineState,
  trackControls,
  stageElement,
  engine,
}) => {
  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const isOpen = height > 37;

  const activeAnimatedProperties = useMemo(
    () => getActiveAnimationProperties(animationData, trackControls),
    [animationData, trackControls],
  );

  useEffect(() => {
    if (!isOpen) {
      setGeneratedCode('');
      return;
    }

    setIsGenerating(true);
    const timerId = setTimeout(() => {
      const code = generateCodeExport({
        engine,
        transforms,
        animationData,
        timelineState,
        trackControls,
        activeAnimatedProperties,
      });
      setGeneratedCode(code);
      setIsGenerating(false);
    }, 50);

    return () => clearTimeout(timerId);
  }, [isOpen, engine, transforms, animationData, timelineState, trackControls, activeAnimatedProperties]);

  const handleCopy = () => {
    if (isGenerating) return;
    void navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResizeMouseDown = useVerticalResize({ height, onHeightChange });
  const language = engine === 'css' ? 'css' : 'javascript';
  const colors = ENGINE_COLORS[engine];

  return (
    <div
      className="bg-zinc-950 flex flex-col shrink-0 transition-all duration-300 ease-in-out"
      style={{ height: `${height}px` }}
    >
      <Tooltip content="Resize Panel">
        <div
          onMouseDown={handleResizeMouseDown}
          className="group w-full h-1.5 flex items-center justify-center cursor-row-resize"
        >
          <div className="h-1 w-8 bg-zinc-800 group-hover:bg-zinc-700 rounded-full transition-colors" />
        </div>
      </Tooltip>
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-950 border-t border-zinc-900">
        <div className="flex items-center gap-3">
          <Tooltip content={isOpen ? 'Collapse Panel' : 'Expand Panel'}>
            <button
              onClick={() => onHeightChange(height > 37 ? 37 : 400)}
              className="flex items-center gap-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Code size={16} strokeWidth={2} />
              Code Export
            </button>
          </Tooltip>
          <div
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {engine}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip content="Copy Code">
            <button
              onClick={handleCopy}
              disabled={isGenerating}
              className="text-[11px] px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </Tooltip>
          <Tooltip content={isOpen ? 'Collapse' : 'Expand'}>
            <button
              onClick={() => onHeightChange(height > 37 ? 37 : 400)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              {isOpen ? <ChevronDown size={18} strokeWidth={2} /> : <ChevronUp size={18} strokeWidth={2} />}
            </button>
          </Tooltip>
        </div>
      </div>
      <div className={`flex-1 flex flex-col min-h-0 ${!isOpen ? 'hidden' : ''}`}>
        {stageElement === 'model' && engine !== 'threejs' && (
          <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-[11px] text-amber-200">
            For 3D models, the most complete export path is <span className="font-semibold">threejs</span> (GSAP-driven
            scene output).
          </div>
        )}
        <div className="flex-1 overflow-auto bg-zinc-950">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
              <Loader size={18} className="animate-spin mr-3" />
              Generating code...
            </div>
          ) : (
            <pre
              className={`font-mono text-[13px] selection:bg-indigo-500/30 leading-relaxed h-full language-${language}`}
            >
              <code className={`language-${language}`}>{generatedCode}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CodeOutputPanel);
