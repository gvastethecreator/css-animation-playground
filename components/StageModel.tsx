import React from 'react';
import { TransformState } from '../types';
import { UploadCloud, VenetianMask } from 'lucide-react';
import StageLayers from './StageLayers';
import { useStageDragHandlers } from '../hooks/useStageDragHandlers';

interface StageModelProps {
  transforms: TransformState;
  isAdjusting: boolean;
  isPlaying: boolean;
  modelDataUrl: string | null;
  onFileChange: (file: File) => void;
  showStageUI: boolean;
  willChangeString: string;
  isExploded: boolean; // Added for StageLayers
  onClick?: () => void;
}

const StageModel = React.forwardRef<HTMLDivElement, StageModelProps>(
  (
    {
      transforms,
      isAdjusting,
      isPlaying,
      modelDataUrl,
      onFileChange,
      showStageUI,
      willChangeString,
      isExploded,
      onClick,
    },
    ref,
  ) => {
    const { isDraggingOver, handleDragEnter, handleDragLeave, handleDragOver, handleDrop } =
      useStageDragHandlers(onFileChange);

    return (
      <StageLayers
        ref={ref}
        transforms={transforms}
        isExploded={isExploded}
        isAdjusting={isAdjusting}
        isPlaying={isPlaying}
        showStageUI={showStageUI}
        willChangeString={willChangeString}
        layerGap={0} // Model is a single layer
        className="w-auto h-auto"
        sizeFromFirstLayer
        onClick={onClick}
      >
        {modelDataUrl ? (
          <div className="w-80 h-80 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 flex flex-col items-center justify-center text-center p-4">
            <VenetianMask size={48} className="text-zinc-600" />
            <p className="mt-4 font-bold text-lg text-zinc-500">3D Model View</p>
            <p className="mt-1 text-sm text-zinc-600">
              This element is only visible with the <b className="text-zinc-400">Three.js</b> engine. Please select it
              from the header.
            </p>
          </div>
        ) : (
          <label
            htmlFor="stage-file-upload-model"
            className={`w-80 h-80 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${isDraggingOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <UploadCloud
              size={48}
              className={`transition-colors ${isDraggingOver ? 'text-indigo-400' : 'text-zinc-600'}`}
            />
            <p
              className={`mt-4 font-bold text-lg transition-colors ${isDraggingOver ? 'text-indigo-300' : 'text-zinc-500'}`}
            >
              Drop 3D Model here
            </p>
            <p className={`mt-1 text-sm transition-colors ${isDraggingOver ? 'text-indigo-400' : 'text-zinc-600'}`}>
              (.glb, .gltf)
            </p>
            <input
              id="stage-file-upload-model"
              type="file"
              className="hidden"
              onChange={(e) => e.target.files && onFileChange(e.target.files[0])}
              accept=".gltf,.glb"
            />
          </label>
        )}
      </StageLayers>
    );
  },
);

export default StageModel;
