import React from 'react';
import { StageStyle, TransformState } from '../types';
import StageLayers from './StageLayers';

interface StageTextProps {
  transforms: TransformState;
  isAdjusting: boolean;
  isPlaying: boolean;
  style: StageStyle['text'];
  showStageUI: boolean;
  willChangeString: string;
  isExploded: boolean; // Added for StageLayers
  onClick?: () => void;
}

const StageText = React.forwardRef<HTMLDivElement, StageTextProps>(
  ({ transforms, isAdjusting, isPlaying, style, showStageUI, willChangeString, isExploded, onClick }, ref) => {
    const textStyle: React.CSSProperties = {
      fontSize: `${transforms.fontSize}px`,
      letterSpacing: `${transforms.letterSpacing}px`,
      fontWeight: transforms.fontWeight,
      textShadow: '0 4px 20px rgba(0,0,0,0.5)',
      color: transforms.textColor,
      backgroundImage:
        transforms.textColor === 'rgba(255, 255, 255, 1)'
          ? `linear-gradient(45deg, ${style.from}, ${style.to})`
          : 'none',
      backgroundColor: transforms.textColor !== 'rgba(255, 255, 255, 1)' ? transforms.textColor : 'transparent',
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
        layerGap={0} // Text is a single layer, so no gap
        className="w-auto h-auto"
        onClick={onClick}
      >
        <h1 className="font-bold text-transparent bg-clip-text drop-shadow-xl whitespace-nowrap" style={textStyle}>
          ANIMATE
        </h1>
      </StageLayers>
    );
  },
);

export default StageText;
