import React from 'react';
import { StageMediaType, TransformState } from '../types';
import { UploadCloud } from 'lucide-react';
import StageLayers from './StageLayers';
import { useStageDragHandlers } from '../hooks/useStageDragHandlers';

interface StageImageProps {
  transforms: TransformState;
  isAdjusting: boolean;
  isPlaying: boolean;
  imageDataUrl: string | null;
  mediaType: StageMediaType | null;
  onFileChange: (file: File) => void;
  showStageUI: boolean;
  willChangeString: string;
  isExploded: boolean; // Added for StageLayers
  onClick?: () => void;
}

const StageImage = React.forwardRef<HTMLDivElement, StageImageProps>(
  (
    {
      transforms,
      isAdjusting,
      isPlaying,
      imageDataUrl,
      mediaType,
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

    const mediaStyle: React.CSSProperties = {
      width: `${transforms.imageWidth}px`,
      maxWidth: 'initial',
      maxHeight: 'initial',
      borderRadius: 'inherit', // Inherit border radius from the container
    };

    return (
      <StageLayers
        ref={ref}
        transforms={transforms}
        isExploded={isExploded}
        isAdjusting={isAdjusting}
        isPlaying={isPlaying}
        showStageUI={showStageUI}
        willChangeString={willChangeString}
        layerGap={0} // Image is a single layer
        className="w-auto h-auto"
        sizeFromFirstLayer
        onClick={onClick}
      >
        {imageDataUrl ? (
          <div onMouseDown={(e) => e.stopPropagation()} className="overflow-hidden" style={{ borderRadius: 'inherit' }}>
            {mediaType === 'video' ? (
              <video
                src={imageDataUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-auto h-auto object-contain drop-shadow-2xl"
                style={mediaStyle}
              />
            ) : (
              <img
                src={imageDataUrl}
                alt="User uploaded content"
                className="w-auto h-auto object-contain drop-shadow-2xl"
                style={mediaStyle}
              />
            )}
          </div>
        ) : (
          <label
            htmlFor="stage-file-upload"
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
              Drop Image/Video here
            </p>
            <p className={`mt-1 text-sm transition-colors ${isDraggingOver ? 'text-indigo-400' : 'text-zinc-600'}`}>
              or click to browse
            </p>
            <input
              id="stage-file-upload"
              type="file"
              className="hidden"
              onChange={(e) => e.target.files && onFileChange(e.target.files[0])}
              accept="image/*,video/webm"
            />
          </label>
        )}
      </StageLayers>
    );
  },
);

export default StageImage;
