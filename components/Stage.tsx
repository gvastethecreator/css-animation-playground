import React, { useRef, useState, useEffect, lazy, Suspense } from 'react';
import {
  TransformState,
  StageElement,
  StageStyle,
  AnimationData,
  TrackControlState,
  AnimationEngine,
  EasingValue,
  GizmoMode,
  StageViewportState,
  StageMediaType,
} from '../types';
import CameraInfo from './CameraInfo';
import CameraControls from './CameraControls';
import FrameCounter from './FrameCounter';
import StageElementSelector from './StageElementSelector';
import StageCard from './StageCard';
import StageCube from './StageCube';
import StageText from './StageText';
import StageImage from './StageImage';
import StageModel from './StageModel';
import OriginInfo from './OriginInfo';
import { Layers, Move3d, Eye, EyeOff, Expand, Minimize } from 'lucide-react';
import LiveAnimationInfo from './LiveAnimationInfo';
import FloatingPanel from './FloatingPanel';
import ElementControls from './ElementControls';
const ThreeCanvas = lazy(() => import('./ThreeCanvas'));
import Tooltip from './Tooltip';
import TransformGizmoToolbar from './TransformGizmoToolbar';
import CSSGizmo from './CSSGizmo';

interface StageProps {
  transforms: TransformState;
  showGrid: boolean;
  showStageUI: boolean;
  alignGridToView: boolean;
  isExploded: boolean;
  scene: StageViewportState;
  isDragging: boolean;
  isAdjusting: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  onResetView: () => void;
  onFocusTO: () => void;
  onFocusPO: () => void;
  onResetZoom: () => void;
  currentTime: number;
  duration: number;
  fps: number;
  stageElement: StageElement;
  onStageElementChange: (element: StageElement) => void;
  onShowGridChange: (show: boolean) => void;
  onShowStageUIChange: (show: boolean) => void;
  onAlignGridToViewChange: (align: boolean) => void;
  stageElementRef: React.RefObject<HTMLDivElement | null>;
  imageDataUrl: string | null;
  modelDataUrl: string | null;
  mediaType: StageMediaType | null;
  onFileChange: (file: File) => void;
  stageStyle: StageStyle;
  animationData: AnimationData;
  trackControls: Partial<Record<keyof TransformState, TrackControlState>>;
  isPlaying: boolean;
  onChange: (updates: Partial<TransformState>) => void;
  onAdjustStart: () => void;
  onAdjustEnd: () => void;
  onKeyframeToggle: (property: keyof TransformState) => void;
  onExplodeToggle: () => void;
  animationEngine: AnimationEngine;
  willChangeString: string;
  globalEasing: EasingValue;
  gizmoMode: GizmoMode;
  onGizmoModeChange: (mode: GizmoMode) => void;
  onElementClick: () => void;
  onAnimationEngineChange: (engine: AnimationEngine) => void;
}

function Stage({
  transforms,
  showGrid,
  showStageUI,
  alignGridToView,
  isExploded,
  scene,
  isDragging,
  isAdjusting,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onResetView,
  onFocusTO,
  onFocusPO,
  onResetZoom,
  currentTime,
  duration,
  fps,
  stageElement,
  onStageElementChange,
  onShowGridChange,
  onShowStageUIChange,
  onAlignGridToViewChange,
  stageElementRef,
  imageDataUrl,
  modelDataUrl,
  mediaType,
  onFileChange,
  stageStyle,
  animationData,
  trackControls,
  isPlaying,
  onChange,
  onAdjustStart,
  onAdjustEnd,
  onKeyframeToggle,
  onExplodeToggle,
  animationEngine,
  willChangeString,
  globalEasing,
  gizmoMode,
  onGizmoModeChange,
  onElementClick,
  onAnimationEngineChange,
}: StageProps) {
  const { perspective, perspectiveOriginX, perspectiveOriginY } = transforms;

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!stageContainerRef.current) return;
    if (isFullscreen) {
      void document.exitFullscreen();
    } else {
      void stageContainerRef.current.requestFullscreen();
    }
  };

  const perspectiveStyle: React.CSSProperties = {
    perspective: `${perspective}px`,
    perspectiveOrigin: `${perspectiveOriginX}% ${perspectiveOriginY}%`,
  };

  const sceneStyle: React.CSSProperties = {
    transform: `translate3d(${scene.translateX}px, ${scene.translateY}px, ${scene.translateZ}px)`,
  };

  const gridContainerStyle: React.CSSProperties = alignGridToView
    ? {
        transform: `rotateX(${transforms.rotateX}deg) rotateY(${transforms.rotateY}deg) rotateZ(${transforms.rotateZ}deg)`,
        transformOrigin: `${transforms.transformOriginX}% ${transforms.transformOriginY}% ${transforms.transformOriginZ}px`,
      }
    : {};

  const gridAndGuidelinesClass = isAdjusting ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-none';

  const renderDOMStageElement = () => {
    const cssElementProps = {
      ref: stageElementRef,
      transforms,
      isExploded,
      isAdjusting,
      isPlaying,
      showStageUI,
      willChangeString,
      onClick: onElementClick,
    };

    switch (stageElement) {
      case 'card':
        return <StageCard {...cssElementProps} style={stageStyle.card} imageDataUrl={imageDataUrl} />;
      case 'cube':
        return <StageCube {...cssElementProps} style={stageStyle.cube} />;
      case 'text':
        return <StageText {...cssElementProps} style={stageStyle.text} />;
      case 'image':
        return (
          <StageImage
            {...cssElementProps}
            imageDataUrl={imageDataUrl}
            mediaType={mediaType}
            onFileChange={onFileChange}
          />
        );
      case 'model':
        return (
          <StageModel
            {...cssElementProps}
            modelDataUrl={modelDataUrl}
            onFileChange={onFileChange}
            onSwitchToThreeJs={() => onAnimationEngineChange('threejs')}
          />
        );
      default:
        return <StageCard {...cssElementProps} style={stageStyle.card} imageDataUrl={imageDataUrl} />;
    }
  };

  const panelTitle = `${stageElement.charAt(0).toUpperCase() + stageElement.slice(1)} Controls`;

  return (
    <div
      id="stage-root" // ID used to identify clicks on the stage background
      ref={stageContainerRef}
      className={`relative flex-1 bg-zinc-900 overflow-hidden flex items-center justify-center select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp} // Stop dragging if mouse leaves the area
      onWheel={onWheel}
    >
      <div className="absolute top-4 left-4 z-20 flex items-start gap-2">
        <div className="flex items-center gap-2 p-1 bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg">
          <Tooltip content={showStageUI ? 'Hide UI' : 'Show UI'}>
            <button
              onClick={() => onShowStageUIChange(!showStageUI)}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${!showStageUI ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
            >
              {showStageUI ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
            </button>
          </Tooltip>
          <Tooltip content={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            <button
              onClick={handleToggleFullscreen}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-all text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              {isFullscreen ? <Minimize size={18} strokeWidth={2} /> : <Expand size={18} strokeWidth={2} />}
            </button>
          </Tooltip>
          {showStageUI && (
            <>
              <div className="w-px h-5 bg-zinc-800" />
              <StageElementSelector
                selectedElement={stageElement}
                onElementChange={onStageElementChange}
                hasMedia={!!imageDataUrl || !!modelDataUrl}
              />
              <div className="w-px h-5 bg-zinc-800" />
              <TransformGizmoToolbar gizmoMode={gizmoMode} onGizmoModeChange={onGizmoModeChange} />
              <div className="w-px h-5 bg-zinc-800" />
              <Tooltip content="Toggle Grid">
                <button
                  onClick={() => onShowGridChange(!showGrid)}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${showGrid ? 'bg-indigo-500/30 text-indigo-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                >
                  <Layers size={18} strokeWidth={2} />
                </button>
              </Tooltip>
              <Tooltip content="Align Grid to View">
                <button
                  onClick={() => onAlignGridToViewChange(!alignGridToView)}
                  disabled={!showGrid}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${alignGridToView ? 'bg-indigo-500/30 text-indigo-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                >
                  <Move3d size={18} strokeWidth={2} />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {showStageUI && (
        <FloatingPanel title={panelTitle}>
          <ElementControls
            stageElement={stageElement}
            transforms={transforms}
            onChange={onChange}
            onAdjustStart={onAdjustStart}
            onAdjustEnd={onAdjustEnd}
            animationData={animationData}
            currentTime={currentTime}
            onKeyframeToggle={onKeyframeToggle}
            isExploded={isExploded}
            onExplodeToggle={onExplodeToggle}
          />
        </FloatingPanel>
      )}

      {showStageUI && (
        <>
          <FrameCounter currentTime={currentTime} fps={fps} />
          <CameraInfo translateX={scene.translateX} translateY={scene.translateY} translateZ={scene.translateZ} />
          <LiveAnimationInfo
            isPlaying={isPlaying}
            transforms={transforms}
            animationData={animationData}
            currentTime={currentTime}
            duration={duration}
            trackControls={trackControls}
            globalEasing={globalEasing}
          />
          <CameraControls
            onResetView={onResetView}
            onFocusTO={onFocusTO}
            onFocusPO={onFocusPO}
            onResetZoom={onResetZoom}
          />
          <OriginInfo
            transformOriginX={transforms.transformOriginX}
            transformOriginY={transforms.transformOriginY}
            transformOriginZ={transforms.transformOriginZ}
            perspectiveOriginX={transforms.perspectiveOriginX}
            perspectiveOriginY={transforms.perspectiveOriginY}
          />
        </>
      )}

      {animationEngine === 'threejs' ? (
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
              Loading 3D engine…
            </div>
          }
        >
          <ThreeCanvas
            transforms={transforms}
            scene={scene}
            stageElement={stageElement}
            modelDataUrl={modelDataUrl}
            imageDataUrl={imageDataUrl}
            stageStyle={stageStyle}
            showGrid={showGrid}
            alignGridToView={alignGridToView}
            isExploded={isExploded}
            onFileChange={onFileChange}
            gizmoMode={gizmoMode}
            onChange={onChange}
            onAdjustStart={onAdjustStart}
            onAdjustEnd={onAdjustEnd}
            onElementClick={onElementClick}
          />
        </Suspense>
      ) : (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{ background: stageStyle.stage.background }} />
          <div
            className="w-full h-full flex items-center justify-center preserve-3d pointer-events-none"
            style={perspectiveStyle}
          >
            {/* Perspective Origin Marker */}
            {showStageUI && (
              <Tooltip
                content={`Perspective Origin: ${perspectiveOriginX.toFixed(0)}%, ${perspectiveOriginY.toFixed(0)}%`}
              >
                <div
                  className="absolute z-50 w-4 h-4 rounded-full bg-cyan-500/50 border-2 border-cyan-400 pointer-events-none"
                  style={{
                    left: `${perspectiveOriginX}%`,
                    top: `${perspectiveOriginY}%`,
                    transform: 'translate3d(-50%, -50%, 5000px)',
                  }}
                >
                  <div className="absolute w-full h-0.5 bg-cyan-400 top-1/2 -translate-y-1/2" />
                  <div className="absolute h-full w-0.5 bg-cyan-400 left-1/2 -translate-x-1/2" />
                </div>
              </Tooltip>
            )}
            <div
              className={`relative preserve-3d pointer-events-auto w-0 h-0 ${!isDragging && !isAdjusting ? 'transition-transform duration-500 ease-in-out' : ''}`}
              style={sceneStyle}
            >
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none preserve-3d" style={gridContainerStyle}>
                  <div
                    className={`absolute transition-all duration-300 ${gridAndGuidelinesClass}`}
                    style={{
                      width: '4000px',
                      height: '4000px',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotateX(90deg) translateZ(-200px)',
                      backgroundImage: `
                                    linear-gradient(${stageStyle.stage.gridColor} 2px, transparent 2px), 
                                    linear-gradient(90deg, ${stageStyle.stage.gridColor} 2px, transparent 2px)
                                `,
                      backgroundSize: '50px 50px',
                      maskImage: 'radial-gradient(circle at center, black 0%, transparent 55%)',
                      WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 55%)',
                    }}
                  />
                  <div
                    className={`absolute left-1/2 top-1/2 h-0.5 w-500 -translate-x-1/2 -translate-y-1/2 bg-red-500/80 transition-all duration-300 ${gridAndGuidelinesClass}`}
                  />
                  <div
                    className={`absolute left-1/2 top-1/2 h-500 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-green-500/80 transition-all duration-300 ${gridAndGuidelinesClass}`}
                  />
                </div>
              )}
              {renderDOMStageElement()}
              {showStageUI && !isAdjusting && (
                <CSSGizmo
                  transforms={transforms}
                  gizmoMode={gizmoMode}
                  onChange={onChange}
                  onAdjustStart={onAdjustStart}
                  onAdjustEnd={onAdjustEnd}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(Stage);
