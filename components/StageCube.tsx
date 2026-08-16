import React from 'react';
import { TransformState } from '../types';
import StageLayers from './StageLayers';

interface StageCubeProps {
  transforms: TransformState;
  isExploded: boolean;
  isAdjusting: boolean;
  isPlaying: boolean;
  style: string[]; // Array of 6 face colors
  showStageUI: boolean;
  willChangeString: string;
  onClick?: () => void;
}

const StageCube = React.forwardRef<HTMLDivElement, StageCubeProps>(
  (
    { transforms, isExploded, isAdjusting, isPlaying, style: faceColors, showStageUI, willChangeString, onClick },
    ref,
  ) => {
    const { cubeShowNumbers, cubeWireframe } = transforms;
    const size = 200;

    const faces = [
      { transform: `rotateY(0deg) translateZ(${size / 2}px)`, name: 'front' },
      { transform: `rotateY(180deg) translateZ(${size / 2}px)`, name: 'back' },
      { transform: `rotateY(90deg) translateZ(${size / 2}px)`, name: 'right' },
      { transform: `rotateY(-90deg) translateZ(${size / 2}px)`, name: 'left' },
      { transform: `rotateX(90deg) translateZ(${size / 2}px)`, name: 'top' },
      { transform: `rotateX(-90deg) translateZ(${size / 2}px)`, name: 'bottom' },
    ];

    const faceBaseStyle: React.CSSProperties = {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      fontWeight: 'bold',
      color: 'white',
      backfaceVisibility: 'hidden',
      border: cubeWireframe ? '2px solid rgba(255,255,255,0.7)' : 'none',
      boxSizing: 'border-box',
    };

    return (
      <StageLayers
        ref={ref}
        transforms={transforms}
        isExploded={isExploded}
        isAdjusting={isAdjusting}
        isPlaying={isPlaying}
        className="w-[200px] h-[200px]"
        layerGap={0} // Explosion for cube is handled by its own transforms
        showStageUI={showStageUI}
        willChangeString={willChangeString}
        onClick={onClick}
      >
        <div className="absolute w-full h-full preserve-3d">
          {faces.map((face, i) => (
            <div
              key={face.name}
              style={{
                ...faceBaseStyle,
                transform: face.transform,
                backgroundColor: cubeWireframe ? 'transparent' : faceColors[i] || 'rgba(255,255,255,0.2)',
              }}
            >
              {cubeShowNumbers && <span className="drop-shadow-lg">{i + 1}</span>}
            </div>
          ))}
        </div>
      </StageLayers>
    );
  },
);

export default StageCube;
