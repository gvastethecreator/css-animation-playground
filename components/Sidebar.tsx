import React, { useCallback } from 'react';
import {
  TransformState,
  AnimationData,
  AnimationEngine,
  EngineConfig,
  PresetName,
  VIEW_PRESETS,
  StageStyleName,
} from '../types';
import ControlGroup from './ControlGroup';
import RangeControl from './RangeControl';
import PositionGrid from './PositionGrid';
import ColorControl from './ColorControl';
import StageStyleSelector from './StageStyleSelector';
import {
  View,
  CircleSlash,
  Waves,
  Sun,
  Contrast,
  Radius,
  Palette,
  MoveHorizontal,
  MoveVertical,
  Baseline,
  Move3d,
  Rotate3d,
  StretchHorizontal,
  StretchVertical,
  BoxSelect,
  ChevronsRightLeft,
  ChevronsUpDown,
  Crosshair,
  ScanEye,
} from 'lucide-react';

interface SidebarProps {
  values: TransformState;
  onChange: (updates: Partial<TransformState>) => void;
  onAdjustStart: () => void;
  onAdjustEnd: () => void;
  animationData: AnimationData;
  currentTime: number;
  onKeyframeToggle: (property: keyof TransformState) => void;
  animationEngine: AnimationEngine;
  engineConfig: EngineConfig;
  onEngineConfigChange: (config: EngineConfig) => void;
  isThreeJsMode?: boolean;
  onViewPresetClick: (preset: PresetName) => void;
  stageStyle: StageStyleName;
  onStageStyleChange: (style: StageStyleName) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  values,
  onChange,
  onAdjustStart,
  onAdjustEnd,
  animationData,
  currentTime,
  onKeyframeToggle,
  animationEngine,
  engineConfig,
  onEngineConfigChange,
  isThreeJsMode,
  onViewPresetClick,
  stageStyle,
  onStageStyleChange,
}) => {
  const iconSize = 14;
  const iconStroke = 2;
  const iconClass = 'mr-1.5 text-zinc-500';

  const renderRangeControl = useCallback(
    (
      key: keyof TransformState,
      label: React.ReactNode,
      min: number,
      max: number,
      step = 1,
      unit = '',
      isActivatable = false,
      customDisabled = false,
    ) => {
      const isAnimated = key in animationData;
      const hasKeyframe = animationData[key]?.some((k) => k.time === currentTime) ?? false;
      const enabledKey = isActivatable ? (`${key}Enabled` as keyof TransformState) : undefined;

      return (
        <RangeControl
          key={key}
          label={label}
          value={values[key] as number}
          onChange={(v) => onChange({ [key]: v })}
          min={min}
          max={max}
          step={step}
          unit={unit}
          onMouseDown={onAdjustStart}
          onMouseUp={onAdjustEnd}
          propertyKey={key}
          isAnimated={isAnimated}
          hasKeyframeAtCurrentTime={hasKeyframe}
          onKeyframeToggle={() => onKeyframeToggle(key)}
          isActivatable={isActivatable}
          isEnabled={enabledKey ? (values[enabledKey] as boolean) : true}
          onToggleEnabled={() => enabledKey && onChange({ [enabledKey]: !values[enabledKey] })}
          disabled={customDisabled}
        />
      );
    },
    [values, onChange, onAdjustStart, onAdjustEnd, animationData, currentTime, onKeyframeToggle],
  );

  const renderColorControl = useCallback(
    (key: keyof TransformState, label: React.ReactNode, isActivatable = false, customDisabled = false) => {
      const isAnimated = key in animationData;
      const hasKeyframe = animationData[key]?.some((k) => k.time === currentTime) ?? false;
      const enabledKey = isActivatable ? (`${key.replace('Color', '')}Enabled` as keyof TransformState) : undefined;

      return (
        <ColorControl
          key={key}
          label={label}
          value={values[key] as string}
          onChange={(v) => onChange({ [key]: v })}
          propertyKey={key}
          isAnimated={isAnimated}
          hasKeyframeAtCurrentTime={hasKeyframe}
          onKeyframeToggle={() => onKeyframeToggle(key)}
          isActivatable={isActivatable}
          isEnabled={enabledKey ? (values[enabledKey] as boolean) : true}
          onToggleEnabled={() => enabledKey && onChange({ [enabledKey]: !values[enabledKey] })}
          disabled={customDisabled}
        />
      );
    },
    [values, onChange, animationData, currentTime, onKeyframeToggle],
  );

  const renderEngineControls = () => {
    if (isThreeJsMode) return null; // No engine controls in three.js mode
    switch (animationEngine) {
      case 'gsap':
        return (
          <ControlGroup title="GSAP Ease Settings">
            <p className="text-[11px] text-zinc-500 mb-2">These settings apply to 'elastic' and 'back' easing types.</p>
            <RangeControl
              label={<>Amplitude</>}
              value={engineConfig.gsap.easeAmplitude}
              onChange={(v) =>
                onEngineConfigChange({ ...engineConfig, gsap: { ...engineConfig.gsap, easeAmplitude: v } })
              }
              min={0.1}
              max={2}
              step={0.1}
              onMouseDown={onAdjustStart}
              onMouseUp={onAdjustEnd}
              propertyKey="perspective"
              isAnimated={false}
              hasKeyframeAtCurrentTime={false}
              onKeyframeToggle={() => { }}
            />
            <RangeControl
              label={<>Period</>}
              value={engineConfig.gsap.easePeriod}
              onChange={(v) => onEngineConfigChange({ ...engineConfig, gsap: { ...engineConfig.gsap, easePeriod: v } })}
              min={0.1}
              max={1}
              step={0.05}
              onMouseDown={onAdjustStart}
              onMouseUp={onAdjustEnd}
              propertyKey="perspective"
              isAnimated={false}
              hasKeyframeAtCurrentTime={false}
              onKeyframeToggle={() => { }}
            />
          </ControlGroup>
        );
      case 'animejs':
        return (
          <ControlGroup title="Anime.js Settings">
            <RangeControl
              label={<>Elasticity</>}
              value={engineConfig.animejs.elasticity}
              onChange={(v) =>
                onEngineConfigChange({ ...engineConfig, animejs: { ...engineConfig.animejs, elasticity: v } })
              }
              min={0}
              max={1000}
              step={10}
              onMouseDown={onAdjustStart}
              onMouseUp={onAdjustEnd}
              propertyKey="perspective"
              isAnimated={false}
              hasKeyframeAtCurrentTime={false}
              onKeyframeToggle={() => { }}
            />
          </ControlGroup>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pt-2">
      <div className="px-3 space-y-2 pb-2">
        <ControlGroup title="Stage Style">
          <StageStyleSelector selectedStyle={stageStyle} onStyleChange={onStageStyleChange} />
        </ControlGroup>

        <ControlGroup title="View Presets">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(VIEW_PRESETS) as PresetName[]).map((preset) => (
              <button
                key={preset}
                onClick={() => onViewPresetClick(preset)}
                className="px-2 py-1.5 text-[12px] font-medium rounded-md transition-colors text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {preset}
              </button>
            ))}
          </div>
        </ControlGroup>

        {renderEngineControls()}

        <ControlGroup title="Perspective">
          {renderRangeControl(
            'perspective',
            <>
              <View size={iconSize} strokeWidth={iconStroke} className={iconClass} />
              Distance
            </>,
            1,
            2000,
            10,
            'px',
          )}
        </ControlGroup>

        <ControlGroup title="Filters & Effects">
          {renderRangeControl(
            'opacity',
            <>
              <CircleSlash size={iconSize} strokeWidth={iconStroke} className={iconClass} />
              Opacity
            </>,
            0,
            1,
            0.01,
            '',
            true,
          )}
          {renderRangeControl(
            'blur',
            <>
              <Waves size={iconSize} strokeWidth={iconStroke} className={iconClass} />
              Blur
            </>,
            0,
            50,
            1,
            'px',
            true,
            isThreeJsMode,
          )}
          {renderRangeControl(
            'brightness',
            <>
              <Sun size={iconSize} strokeWidth={iconStroke} className={iconClass} />
              Brightness
            </>,
            0,
            200,
            1,
            '%',
            true,
            isThreeJsMode,
          )}
          {renderRangeControl(
            'contrast',
            <>
              <Contrast size={iconSize} strokeWidth={iconStroke} className={iconClass} />
              Contrast
            </>,
            0,
            200,
            1,
            '%',
            true,
            isThreeJsMode,
          )}
        </ControlGroup>

        <ControlGroup title="Appearance">
          {renderRangeControl(
            'borderRadius',
            <>
              <Radius size={iconSize} strokeWidth={iconStroke} className={iconClass} />
              Border Radius
            </>,
            0,
            200,
            1,
            'px',
            true,
            isThreeJsMode,
          )}
        </ControlGroup>

        <ControlGroup title="Shadows">
          {renderColorControl(
            'dropShadowColor',
            <>
              <Palette size={iconSize} strokeWidth={iconStroke} className={iconClass} />
              Color
            </>,
            true,
            isThreeJsMode,
          )}
          {renderRangeControl(
            'dropShadowX',
            <>
              <MoveHorizontal size={iconSize} strokeWidth={iconStroke} className={iconClass} />X Offset
            </>,
            -100,
            100,
            1,
            'px',
            true,
            isThreeJsMode,
          )}
          {renderRangeControl(
            'dropShadowY',
            <>
              <MoveVertical size={iconSize} strokeWidth={iconStroke} className={iconClass} />Y Offset
            </>,
            -100,
            100,
            1,
            'px',
            true,
            isThreeJsMode,
          )}
          {renderRangeControl(
            'dropShadowBlur',
            <>
              <Baseline size={iconSize} strokeWidth={iconStroke} className={iconClass} />
              Blur
            </>,
            0,
            100,
            1,
            'px',
            true,
            isThreeJsMode,
          )}
        </ControlGroup>

        <ControlGroup title="Translate">
          {renderRangeControl(
            'translateX',
            <>
              <MoveHorizontal size={iconSize} strokeWidth={iconStroke} className={iconClass} />X
            </>,
            -500,
            500,
            1,
            'px',
          )}
          {renderRangeControl(
            'translateY',
            <>
              <MoveVertical size={iconSize} strokeWidth={iconStroke} className={iconClass} />Y
            </>,
            -500,
            500,
            1,
            'px',
          )}
          {renderRangeControl(
            'translateZ',
            <>
              <Move3d size={iconSize} strokeWidth={iconStroke} className={iconClass} />Z
            </>,
            -1000,
            1000,
            1,
            'px',
          )}
        </ControlGroup>

        <ControlGroup title="Rotate">
          {renderRangeControl(
            'rotateX',
            <>
              <Rotate3d size={iconSize} strokeWidth={iconStroke} className={iconClass} />X
            </>,
            -360,
            360,
            1,
            '°',
          )}
          {renderRangeControl(
            'rotateY',
            <>
              <Rotate3d size={iconSize} strokeWidth={iconStroke} className={iconClass} />Y
            </>,
            -360,
            360,
            1,
            '°',
          )}
          {renderRangeControl(
            'rotateZ',
            <>
              <Rotate3d size={iconSize} strokeWidth={iconStroke} className={iconClass} />Z
            </>,
            -360,
            360,
            1,
            '°',
          )}
        </ControlGroup>

        <ControlGroup title="Scale">
          {renderRangeControl(
            'scaleX',
            <>
              <StretchHorizontal size={iconSize} strokeWidth={iconStroke} className={iconClass} />X
            </>,
            0,
            5,
            0.01,
          )}
          {renderRangeControl(
            'scaleY',
            <>
              <StretchVertical size={iconSize} strokeWidth={iconStroke} className={iconClass} />Y
            </>,
            0,
            5,
            0.01,
          )}
          {renderRangeControl(
            'scaleZ',
            <>
              <BoxSelect size={iconSize} strokeWidth={iconStroke} className={iconClass} />Z
            </>,
            0,
            5,
            0.01,
          )}
        </ControlGroup>

        <ControlGroup title="Skew">
          {renderRangeControl(
            'skewX',
            <>
              <ChevronsRightLeft size={iconSize} strokeWidth={iconStroke} className={iconClass} />X
            </>,
            -90,
            90,
            1,
            '°',
            false,
            isThreeJsMode,
          )}
          {renderRangeControl(
            'skewY',
            <>
              <ChevronsUpDown size={iconSize} strokeWidth={iconStroke} className={iconClass} />Y
            </>,
            -90,
            90,
            1,
            '°',
            false,
            isThreeJsMode,
          )}
        </ControlGroup>

        <ControlGroup title="Transform Origin">
          <div className="grid grid-cols-2 gap-x-4 items-start">
            <PositionGrid
              valueX={values.transformOriginX}
              valueY={values.transformOriginY}
              onChange={(x, y) => onChange({ transformOriginX: x, transformOriginY: y })}
              propertyKeyX="transformOriginX"
              isAnimated={'transformOriginX' in animationData || 'transformOriginY' in animationData}
              hasKeyframeAtCurrentTime={
                (animationData['transformOriginX']?.some((k) => k.time === currentTime) ?? false) ||
                (animationData['transformOriginY']?.some((k) => k.time === currentTime) ?? false)
              }
              onKeyframeToggle={() => {
                onKeyframeToggle('transformOriginX');
                onKeyframeToggle('transformOriginY');
              }}
            />
            <div className="space-y-3">
              {renderRangeControl(
                'transformOriginX',
                <>
                  <Crosshair size={iconSize} strokeWidth={iconStroke} className={iconClass} />X
                </>,
                -100,
                200,
                1,
                '%',
              )}
              {renderRangeControl(
                'transformOriginY',
                <>
                  <Crosshair size={iconSize} strokeWidth={iconStroke} className={iconClass} />Y
                </>,
                -100,
                200,
                1,
                '%',
              )}
              {renderRangeControl(
                'transformOriginZ',
                <>
                  <Move3d size={iconSize} strokeWidth={iconStroke} className={iconClass} />Z
                </>,
                -500,
                500,
                1,
                'px',
              )}
            </div>
          </div>
        </ControlGroup>

        <ControlGroup title="Perspective Origin">
          <div className="grid grid-cols-2 gap-x-4 items-start">
            <PositionGrid
              valueX={values.perspectiveOriginX}
              valueY={values.perspectiveOriginY}
              onChange={(x, y) => onChange({ perspectiveOriginX: x, perspectiveOriginY: y })}
              propertyKeyX="perspectiveOriginX"
              isAnimated={'perspectiveOriginX' in animationData || 'perspectiveOriginY' in animationData}
              hasKeyframeAtCurrentTime={
                (animationData['perspectiveOriginX']?.some((k) => k.time === currentTime) ?? false) ||
                (animationData['perspectiveOriginY']?.some((k) => k.time === currentTime) ?? false)
              }
              onKeyframeToggle={() => {
                onKeyframeToggle('perspectiveOriginX');
                onKeyframeToggle('perspectiveOriginY');
              }}
            />
            <div className="space-y-3">
              {renderRangeControl(
                'perspectiveOriginX',
                <>
                  <ScanEye size={iconSize} strokeWidth={iconStroke} className={iconClass} />X
                </>,
                -100,
                200,
                1,
                '%',
              )}
              {renderRangeControl(
                'perspectiveOriginY',
                <>
                  <ScanEye size={iconSize} strokeWidth={iconStroke} className={iconClass} />Y
                </>,
                -100,
                200,
                1,
                '%',
              )}
            </div>
          </div>
        </ControlGroup>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
