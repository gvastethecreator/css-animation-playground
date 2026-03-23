
import React from 'react';
import {
    Expand, Vibrate, FlipVertical, ArrowDownToLine, PartyPopper, Waves,
    Undo2, Squircle, HeartPulse, LogIn, ZoomIn, Zap, GitCommitHorizontal, Annoyed,
    ArrowUpFromLine, ArrowLeftFromLine, Combine, Rabbit, ToyBrick,
    BookOpen, GalleryHorizontal, ArrowDownRight, RadioTower, BookKey, MousePointerClick,
    Wind, Camera, CircleDashed, Rocket, Palette, Moon, PenTool, Sun, Contrast,
    View, CircleSlash, MoveHorizontal, MoveVertical, Baseline, CaseSensitive,
    ArrowLeftRight, Move3d, Rotate3d, StretchHorizontal, StretchVertical,
    BoxSelect, ChevronsRightLeft, ChevronsUpDown, Crosshair, ScanEye, Radius,
    Feather, UnfoldVertical, ScanLine, Lightbulb, Clock, Puzzle, FileText, ToggleLeft, Power,
    LogOut, DoorOpen, Box, FastForward, Droplets, Focus, SunDim, ScrollText, HandMetal, Bomb, UnfoldHorizontal, Scale
} from 'lucide-react';


export interface TransformState {
    perspective: number;
    perspectiveOriginX: number;
    perspectiveOriginY: number;
    translateX: number;
    translateY: number;
    translateZ: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    skewX: number;
    skewY: number;
    transformOriginX: number;
    transformOriginY: number;
    transformOriginZ: number;
    // New granular filter properties
    opacityEnabled: boolean;
    opacity: number;
    blurEnabled: boolean;
    blur: number;
    brightnessEnabled: boolean;
    brightness: number;
    contrastEnabled: boolean;
    contrast: number;
    // New Appearance properties
    borderRadiusEnabled: boolean;
    borderRadius: number;
    dropShadowEnabled: boolean;
    dropShadowX: number;
    dropShadowY: number;
    dropShadowBlur: number;
    dropShadowColor: string;
    // New Typography properties
    fontSize: number;
    letterSpacing: number;
    fontWeight: number;
    textColor: string;
    // New 3D Model properties
    modelWireframe: boolean;
    // New Cube properties
    cubeShowNumbers: boolean;
    cubeWireframe: boolean;
    // New Image properties
    imageWidth: number;
}

export type GizmoMode = 'translate' | 'rotate' | 'scale' | 'skew';

export const defaultTransformState: TransformState = {
    perspective: 1000,
    perspectiveOriginX: 50,
    perspectiveOriginY: 50,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 10,  // Initial slight tilt
    rotateY: -20, // Initial slight rotation to show 3D
    rotateZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    skewX: 0,
    skewY: 0,
    transformOriginX: 50,
    transformOriginY: 50,
    transformOriginZ: 0,
    // New granular filter defaults
    opacityEnabled: false,
    opacity: 1,
    blurEnabled: false,
    blur: 0,
    brightnessEnabled: false,
    brightness: 100,
    contrastEnabled: false,
    contrast: 100,
    // New Appearance defaults
    borderRadiusEnabled: true, // Enabled by default for card
    borderRadius: 16, 
    dropShadowEnabled: true, // Enabled by default for depth
    dropShadowX: 0,
    dropShadowY: 20,
    dropShadowBlur: 40,
    dropShadowColor: 'rgba(0,0,0,0.4)',
    // New Typography defaults
    fontSize: 96,
    letterSpacing: 0,
    fontWeight: 700,
    textColor: 'rgba(255, 255, 255, 1)',
    // New 3D Model defaults
    modelWireframe: false,
    // New Cube defaults
    cubeShowNumbers: true,
    cubeWireframe: false,
    // New Image defaults
    imageWidth: 400,
};

export type PresetName = 'Front' | 'Isometric' | 'Top Down' | 'Side Look';

export type StageElement = 'card' | 'cube' | 'text' | 'image' | 'model';

export const VIEW_PRESETS: Record<PresetName, Partial<TransformState>> = {
    'Front': {
        rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, translateZ: 0, skewX: 0, skewY: 0,
        transformOriginX: 50, transformOriginY: 50, transformOriginZ: 0,
        perspectiveOriginX: 50, perspectiveOriginY: 50
    },
    'Isometric': {
        rotateX: 60, rotateY: 0, rotateZ: -45, translateX: 0, translateY: 0, translateZ: 0, skewX: 0, skewY: 0,
        transformOriginX: 50, transformOriginY: 50, transformOriginZ: 0,
        perspectiveOriginX: 50, perspectiveOriginY: 50
    },
    'Top Down': {
        rotateX: 75, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, translateZ: 0, skewX: 0, skewY: 0,
        transformOriginX: 50, transformOriginY: 50, transformOriginZ: 0,
        perspectiveOriginX: 50, perspectiveOriginY: 50
    },
    'Side Look': {
        rotateX: -15, rotateY: 45, rotateZ: 0, translateX: 0, translateY: 0, translateZ: 0, skewX: 0, skewY: 0,
        transformOriginX: 50, transformOriginY: 50, transformOriginZ: 0,
        perspectiveOriginX: 50, perspectiveOriginY: 50
    }
};

// --- NEW ANIMATION TYPES ---

export type EasingName =
    // Standard
    | 'linear' | 'ease' | 'easeIn' | 'easeOut' | 'easeInOut'
    // Sine
    | 'easeInSine' | 'easeOutSine' | 'easeInOutSine'
    // Quad
    | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
    // Cubic
    | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
    // Quart
    | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart'
    // Quint
    | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint'
    // Expo
    | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
    // Circ
    | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc'
    // Back
    | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
    // Elastic
    | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic'
    // Bounce
    | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce'
    // Special
    | 'snappy' | 'spring'
    // New custom
    | 'anticipateOvershoot' | 'easeOutBackSoft' | 'springy' | 'snap' | 'bouncy' 
    | 'materialDecelerate' | 'materialAccelerate';


export interface Keyframe {
    id: string; // Unique ID, e.g., timestamp + random
    time: number; // in milliseconds
    value: number | string | boolean; // Allow string for colors and boolean for toggles
    easing: EasingName | string; // easing function or custom cubic-bezier string
}

export type AnimationTrack = Keyframe[];

export interface TrackControlState {
  solo: boolean;
  mute: boolean;
}

export type AnimationDirection = 'normal' | 'alternate';

export type AnimationData = {
    [K in keyof TransformState]?: AnimationTrack;
};

// New, more vibrant color palette
export const PROPERTY_COLORS: Record<string, string> = {
    perspective: '#f472b6', // Pink 400
    perspectiveOriginX: '#ec4899', // Pink 500
    perspectiveOriginY: '#db2777', // Pink 600
    translateX: '#34d399', // Emerald 400
    translateY: '#10b981', // Emerald 500
    translateZ: '#059669', // Emerald 600
    rotateX: '#22d3ee', // Cyan 400
    rotateY: '#06b6d4', // Cyan 500
    rotateZ: '#0891b2', // Cyan 600
    scaleX: '#fbbf24', // Amber 400
    scaleY: '#f59e0b', // Amber 500
    scaleZ: '#d97706', // Amber 600
    skewX: '#ef4444', // Red 500
    skewY: '#dc2626', // Red 600
    transformOriginX: '#a8a29e', // Stone 400
    transformOriginY: '#78716c', // Stone 500
    transformOriginZ: '#57534e', // Stone 600
    // Filter & Effects colors
    opacityEnabled: '#c084fc',
    opacity: '#c084fc', // Purple 400
    blurEnabled: '#67e8f9',
    blur: '#67e8f9', // Cyan 300
    brightnessEnabled: '#facc15',
    brightness: '#facc15', // Yellow 400
    contrastEnabled: '#fb923c',
    contrast: '#fb923c', // Orange 400
    // New Appearance colors
    borderRadiusEnabled: '#818cf8', // Indigo 400
    borderRadius: '#818cf8', // Indigo 400
    dropShadowEnabled: '#f87171',
    dropShadowX: '#f87171', // Red 400
    dropShadowY: '#fb923c', // Orange 400
    dropShadowBlur: '#fdba74', // Orange 300
    dropShadowColor: '#4f46e5', // Indigo 600
    // New Typography colors
    fontSize: '#a78bfa', // Violet 400
    letterSpacing: '#7dd3fc', // Sky 300
    fontWeight: '#93c5fd', // Blue 300
    textColor: '#fef08a', // Yellow 200
    // New 3D Model colors
    modelWireframe: '#fca5a5', // Red 300
    // New Cube colors
    cubeShowNumbers: '#d8b4fe', // Purple 300
    cubeWireframe: '#fda4af', // Rose 300
    // New Image colors
    imageWidth: '#6ee7b7', // Emerald 300
};

// FIX: Added color prop to the icon type to match usage in LiveAnimationInfo
export const PROPERTY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string, strokeWidth?: number, color?: string }>> = {
    perspective: View,
    opacityEnabled: Power,
    opacity: CircleSlash,
    blurEnabled: Power,
    blur: Waves,
    brightnessEnabled: Power,
    brightness: Sun,
    contrastEnabled: Power,
    contrast: Contrast,
    borderRadiusEnabled: Power,
    borderRadius: Radius,
    dropShadowEnabled: Power,
    dropShadowColor: Palette,
    dropShadowX: MoveHorizontal,
    dropShadowY: MoveVertical,
    dropShadowBlur: Baseline,
    fontSize: CaseSensitive,
    letterSpacing: ArrowLeftRight,
    fontWeight: Baseline,
    textColor: Palette,
    modelWireframe: Puzzle,
    cubeShowNumbers: FileText,
    cubeWireframe: CircleDashed,
    imageWidth: StretchHorizontal,
    translateX: MoveHorizontal,
    translateY: MoveVertical,
    translateZ: Move3d,
    rotateX: Rotate3d,
    rotateY: Rotate3d,
    rotateZ: Rotate3d,
    scaleX: StretchHorizontal,
    scaleY: StretchVertical,
    scaleZ: BoxSelect,
    skewX: ChevronsRightLeft,
    skewY: ChevronsUpDown,
    transformOriginX: Crosshair,
    transformOriginY: Crosshair,
    transformOriginZ: Move3d,
    perspectiveOriginX: ScanEye,
    perspectiveOriginY: ScanEye,
};

// --- ANIMATION PRESETS ---

export type PresetAnimationName = 
    'Grow' | 'Flip' | 'Drop In' | 'Tada' | 'Heartbeat' | 'ZoomIn' | 'Flash' |
    'Pulse Glow' | '3D Unfold' | 'Material Pop' | 'Neon Flash' | 'Drift Away' | 'Shutter' | 'Orbit' |
    'Shake' | 'Wobble' | 'Swing' | 'Jello' | 'RubberBand' | 'HeadShake' | 'Jiggle' | 'Boing' | 'Carousel' | 'Fall Away' |
    'Stomp' | 'Glitch' | 'Float' | 'Unfurl' | 'Vortex In' | 'Scan Reveal' | 'Flicker' | 'Pendulum' | 'Jigsaw Snap' | 'Pixelate In' | 'Paper Fold' |
    'Fade In Up' | 'Slide In Left' | 'Bounce In' | 'Shrink Out' | 'Hinge' | 'Tumble' | 'Swoop In' | 'Conveyor Belt' | 'Liquify' | 'Focus Blur' | 
    'Spotlight' | 'Unroll' | 'Rock On' | 'Explode' | 'Squeeze' |
    'Swoosh In' | 'Illuminate' | 'Jitter' | 'Pop Out' | 'Slide Out Right' | 'Perspective Shift' | 'Iris In';


interface AnimationPreset {
    animationData: AnimationData;
    timelineState: {
        duration: number;
        isLooping: boolean;
        direction?: AnimationDirection;
        easing?: EasingName | string;
    };
    // FIX: Added strokeWidth to icon type to match usage in AnimationPresetPopover
    icon: React.ComponentType<{ size?: number; className?: string, color?: string, strokeWidth?: number }>;
    iconColor: string;
    initialTransforms?: Partial<TransformState>;
}

const createKeyframe = (time: number, value: number | string | boolean, easing: EasingName | string = 'linear'): Keyframe => ({
    id: `preset-${time}-${value}-${Math.random()}`,
    time,
    value,
    easing,
});


export const ANIMATION_PRESETS: Record<PresetAnimationName, AnimationPreset> = {
    // --- Enhanced Core Presets ---
    'Grow': {
        icon: Expand,
        iconColor: '#a78bfa', // Violet
        initialTransforms: { dropShadowEnabled: true, brightnessEnabled: true },
        animationData: {
            scaleX: [ createKeyframe(0, 1), createKeyframe(1000, 1.1) ],
            scaleY: [ createKeyframe(0, 1), createKeyframe(1000, 1.1) ],
            dropShadowBlur: [ createKeyframe(0, 20), createKeyframe(1000, 35) ],
            dropShadowY: [ createKeyframe(0, 10), createKeyframe(1000, 15) ],
            brightness: [ createKeyframe(0, 100), createKeyframe(1000, 105) ],
        },
        timelineState: { duration: 1000, isLooping: true, direction: 'alternate', easing: 'easeInOut' },
    },
    'Flip': {
        icon: FlipVertical,
        iconColor: '#22d3ee', // Cyan
        initialTransforms: { blurEnabled: true },
        animationData: {
            rotateY: [ createKeyframe(0, 0, 'easeInCubic'), createKeyframe(1500, 360, 'easeOutCubic') ],
            translateZ: [ createKeyframe(600, 0), createKeyframe(750, 50), createKeyframe(900, 0) ],
            blur: [ createKeyframe(650, 0), createKeyframe(750, 8), createKeyframe(850, 0) ],
        },
        timelineState: { duration: 1500, isLooping: true, easing: 'easeInOut' },
    },
    'Drop In': {
        icon: ArrowDownToLine,
        iconColor: '#34d399', // Emerald
        initialTransforms: { opacityEnabled: true, blurEnabled: true },
        animationData: {
            translateY: [ createKeyframe(0, -500), createKeyframe(1200, 0) ],
            rotateX: [ createKeyframe(0, -90), createKeyframe(1200, 0) ],
            rotateZ: [ createKeyframe(0, 15), createKeyframe(1200, 0) ],
            opacity: [ createKeyframe(0, 0), createKeyframe(600, 1) ],
            blur: [ createKeyframe(0, 20), createKeyframe(1200, 0) ],
        },
        timelineState: { duration: 1500, isLooping: false, easing: 'easeOutBounce' },
    },
    'Tada': {
        icon: PartyPopper,
        iconColor: '#f472b6', // Pink
        initialTransforms: { brightnessEnabled: true },
        animationData: {
            scaleX: [ createKeyframe(0, 1), createKeyframe(100, .9), createKeyframe(300, 1.1), createKeyframe(1000, 1) ],
            scaleY: [ createKeyframe(0, 1), createKeyframe(100, .9), createKeyframe(300, 1.1), createKeyframe(1000, 1) ],
            rotateZ: [ createKeyframe(0, 0), createKeyframe(100, -3), createKeyframe(300, 3), createKeyframe(500, -3), createKeyframe(700, 3), createKeyframe(900, -3), createKeyframe(1000, 0) ],
            brightness: [ createKeyframe(0, 100), createKeyframe(300, 120), createKeyframe(500, 100), createKeyframe(700, 120), createKeyframe(900, 100) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeInOut' },
    },
    'Heartbeat': {
        icon: HeartPulse,
        iconColor: '#ef4444', // Red
        initialTransforms: { dropShadowEnabled: true },
        animationData: {
            scaleX: [ createKeyframe(0, 1), createKeyframe(500, 1.3), ],
            scaleY: [ createKeyframe(0, 1), createKeyframe(500, 1.3), ],
            dropShadowY: [ createKeyframe(0, 10), createKeyframe(500, 20), ],
            dropShadowBlur: [ createKeyframe(0, 20), createKeyframe(500, 30), ],
        },
        timelineState: { duration: 1000, isLooping: true, direction: 'alternate', easing: 'easeInOut' },
    },
    'ZoomIn': {
        icon: ZoomIn,
        iconColor: '#818cf8', // Indigo
        initialTransforms: { opacityEnabled: true, blurEnabled: true },
        animationData: {
            scaleX: [ createKeyframe(0, 0), createKeyframe(800, 1) ],
            scaleY: [ createKeyframe(0, 0), createKeyframe(800, 1) ],
            translateZ: [ createKeyframe(0, -500), createKeyframe(800, 0) ],
            opacity: [ createKeyframe(0, 0), createKeyframe(400, 1) ],
            blur: [ createKeyframe(0, 50), createKeyframe(800, 0) ],
        },
        timelineState: { duration: 800, isLooping: false, easing: 'easeOutQuint' },
    },
    'Flash': {
        icon: Zap,
        iconColor: '#facc15', // Yellow
        initialTransforms: { brightnessEnabled: true, opacityEnabled: true },
        animationData: {
            brightness: [ createKeyframe(0, 100, 'easeOutCubic'), createKeyframe(250, 200), createKeyframe(500, 50), createKeyframe(750, 150), createKeyframe(1000, 100) ],
            opacity: [ createKeyframe(0, 1), createKeyframe(250, 0.5), createKeyframe(500, 1), createKeyframe(750, 0.7), createKeyframe(1000, 1) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeInOut' },
    },
    // --- New Creative Presets ---
    'Pulse Glow': {
        icon: RadioTower,
        iconColor: '#34d399', // Emerald
        initialTransforms: { dropShadowEnabled: true, brightnessEnabled: true },
        animationData: {
            scaleX: [ createKeyframe(0, 1), createKeyframe(1500, 1.05) ],
            scaleY: [ createKeyframe(0, 1), createKeyframe(1500, 1.05) ],
            brightness: [ createKeyframe(0, 100), createKeyframe(1500, 110) ],
            dropShadowBlur: [ createKeyframe(0, 20), createKeyframe(1500, 40) ],
            dropShadowColor: [ createKeyframe(0, 'rgba(0,0,0,0.5)'), createKeyframe(1500, 'rgba(4,120,87,0.7)') ],
        },
        timelineState: { duration: 1500, isLooping: true, direction: 'alternate', easing: 'easeInOutSine' },
    },
    '3D Unfold': {
        icon: BookKey,
        iconColor: '#f59e0b', // Amber
        initialTransforms: { transformOriginY: 0, opacityEnabled: true },
        animationData: {
            rotateX: [ createKeyframe(0, -90), createKeyframe(1200, 0) ],
            opacity: [ createKeyframe(0, 0), createKeyframe(800, 1) ],
            translateZ: [ createKeyframe(0, -100), createKeyframe(1200, 0) ],
        },
        timelineState: { duration: 1200, isLooping: false, easing: 'easeOutExpo' },
    },
    'Material Pop': {
        icon: MousePointerClick,
        iconColor: '#818cf8', // Indigo
        initialTransforms: { dropShadowEnabled: true },
        animationData: {
            scaleX: [ createKeyframe(0, 1), createKeyframe(150, 1.05), createKeyframe(1000, 1) ],
            scaleY: [ createKeyframe(0, 1), createKeyframe(150, 1.05), createKeyframe(1000, 1) ],
            translateZ: [ createKeyframe(0, 0), createKeyframe(150, 30), createKeyframe(1000, 0) ],
            dropShadowY: [ createKeyframe(0, 10), createKeyframe(150, 25), createKeyframe(1000, 10) ],
            dropShadowBlur: [ createKeyframe(0, 20), createKeyframe(150, 40), createKeyframe(1000, 20) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeOutCubic' },
    },
    'Neon Flash': {
        icon: Zap,
        iconColor: '#ec4899', // Pink
        initialTransforms: { dropShadowEnabled: true, brightnessEnabled: true, opacityEnabled: true },
        animationData: {
            opacity: [ createKeyframe(0, 1), createKeyframe(50, 0.8), createKeyframe(100, 1) ],
            brightness: [ createKeyframe(0, 100), createKeyframe(50, 150), createKeyframe(100, 100) ],
            dropShadowColor: [ createKeyframe(0, 'rgba(0,0,0,0.5)'), createKeyframe(50, 'rgba(219,39,119,1)'), createKeyframe(100, 'rgba(0,0,0,0.5)') ],
            dropShadowBlur: [ createKeyframe(0, 20), createKeyframe(50, 40), createKeyframe(100, 20) ],
        },
        timelineState: { duration: 800, isLooping: true, easing: 'linear' },
    },
    'Drift Away': {
        icon: Wind,
        iconColor: '#67e8f9', // Cyan
        initialTransforms: { opacityEnabled: true, blurEnabled: true },
        animationData: {
            translateX: [ createKeyframe(0, 0), createKeyframe(1500, 100) ],
            rotateZ: [ createKeyframe(0, 0), createKeyframe(1500, 5) ],
            opacity: [ createKeyframe(0, 1), createKeyframe(1500, 0) ],
            blur: [ createKeyframe(500, 0), createKeyframe(1500, 10) ],
        },
        timelineState: { duration: 1500, isLooping: false, easing: 'easeInQuint' },
    },
    'Shutter': {
        icon: Camera,
        iconColor: '#a8a29e', // Stone
        initialTransforms: { transformOriginX: 0, opacityEnabled: true },
        animationData: {
            rotateY: [ createKeyframe(0, 0), createKeyframe(500, 90) ],
            scaleX: [ createKeyframe(0, 1), createKeyframe(500, 0) ],
            opacity: [ createKeyframe(250, 1), createKeyframe(500, 0) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeInOutExpo' },
    },
    'Orbit': {
        icon: CircleDashed,
        iconColor: '#fb923c', // Orange
        animationData: {
            translateX: [ createKeyframe(0, 200), createKeyframe(1000, 0), createKeyframe(2000, -200), createKeyframe(3000, 0), createKeyframe(4000, 200) ],
            translateZ: [ createKeyframe(0, 0), createKeyframe(1000, 100), createKeyframe(2000, 0), createKeyframe(3000, -100), createKeyframe(4000, 0) ],
            rotateY: [ createKeyframe(0, -90, 'linear'), createKeyframe(4000, 270, 'linear') ],
        },
        timelineState: { duration: 4000, isLooping: true, easing: 'linear' },
    },
    // --- Classic Transform Presets ---
    'Shake': {
        icon: Vibrate,
        iconColor: '#fbbf24', // Amber
        animationData: {
            translateX: [ createKeyframe(0, 0, 'easeOutQuad'), createKeyframe(100, -10), createKeyframe(200, 10), createKeyframe(300, -10), createKeyframe(400, 10), createKeyframe(700, 0) ],
            rotateZ: [ createKeyframe(0, 0, 'easeOutQuad'), createKeyframe(100, -3), createKeyframe(200, 3), createKeyframe(300, -3), createKeyframe(400, 3), createKeyframe(700, 0) ],
        },
        timelineState: { duration: 800, isLooping: true, easing: 'easeInOut' },
    },
    'Wobble': {
        icon: Waves,
        iconColor: '#7dd3fc', // Sky
        animationData: {
            translateX: [ createKeyframe(0, 0), createKeyframe(150, -50), createKeyframe(300, 40), createKeyframe(450, -30), createKeyframe(600, 20), createKeyframe(1000, 0) ],
            rotateZ: [ createKeyframe(0, 0), createKeyframe(150, -5), createKeyframe(300, 3), createKeyframe(450, -3), createKeyframe(600, 2), createKeyframe(1000, 0) ],
        },
        timelineState: { duration: 1000, isLooping: true, easing: 'easeInOut' },
    },
    'Swing': {
        icon: Undo2,
        iconColor: '#fdba74', // Orange
        initialTransforms: { transformOriginY: 0 },
        animationData: { rotateZ: [ createKeyframe(0, 0), createKeyframe(400, 15) ] },
        timelineState: { duration: 800, isLooping: true, direction: 'alternate', easing: 'easeInOut' },
    },
    'Jello': {
        icon: Squircle,
        iconColor: '#c084fc', // Purple
        animationData: {
            skewX: [ createKeyframe(0, 0), createKeyframe(111, 0), createKeyframe(222, -12.5), createKeyframe(333, 6.25), createKeyframe(444, -3.125), createKeyframe(666, -0.78125), createKeyframe(1000, 0) ],
            skewY: [ createKeyframe(0, 0), createKeyframe(111, 0), createKeyframe(222, -12.5), createKeyframe(333, 6.25), createKeyframe(444, -3.125), createKeyframe(666, -0.78125), createKeyframe(1000, 0) ],
        },
        timelineState: { duration: 1000, isLooping: true, easing: 'easeInOut' },
    },
    'RubberBand': {
        icon: GitCommitHorizontal,
        iconColor: '#f87171', // Red
        animationData: {
            scaleX: [ createKeyframe(0, 1), createKeyframe(300, 1.25, 'easeOutBack'), createKeyframe(400, 0.75), createKeyframe(500, 1.15), createKeyframe(1000, 1) ],
            scaleY: [ createKeyframe(0, 1), createKeyframe(300, 0.75, 'easeOutBack'), createKeyframe(400, 1.25), createKeyframe(500, 0.85), createKeyframe(1000, 1) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeInOut' },
    },
    'HeadShake': {
        icon: Annoyed,
        iconColor: '#fb923c', // Orange
        animationData: {
            translateX: [ createKeyframe(0, 0), createKeyframe(65, -6), createKeyframe(185, 5), createKeyframe(315, -3), createKeyframe(500, 0) ],
            rotateZ: [ createKeyframe(0, 0), createKeyframe(65, -9), createKeyframe(185, 7), createKeyframe(315, -5), createKeyframe(500, 0) ],
        },
        timelineState: { duration: 1000, isLooping: true, easing: 'easeInOut' },
    },
    'Jiggle': {
        icon: Rabbit,
        iconColor: '#fca5a5', // Red
        animationData: {
            rotateZ: [ createKeyframe(0, 0), createKeyframe(100, -4), createKeyframe(200, 4), createKeyframe(300, -2), createKeyframe(500, 0) ],
            skewX: [ createKeyframe(0, 0), createKeyframe(100, -8), createKeyframe(200, 8), createKeyframe(300, -4), createKeyframe(500, 0) ],
        },
        timelineState: { duration: 500, isLooping: true, easing: 'easeInOut' },
    },
    'Boing': {
        icon: ToyBrick,
        iconColor: '#10b981', // Emerald
        initialTransforms: { dropShadowEnabled: true },
        animationData: {
            translateY: [ createKeyframe(0, -300, 'easeInCubic'), createKeyframe(600, 0), createKeyframe(800, -20), createKeyframe(1000, 0) ],
            scaleX: [ createKeyframe(500, 1), createKeyframe(600, 1.2), createKeyframe(700, 1), createKeyframe(800, 1.05), createKeyframe(1000, 1) ],
            scaleY: [ createKeyframe(500, 1), createKeyframe(600, 0.8), createKeyframe(700, 1), createKeyframe(800, 0.95), createKeyframe(1000, 1) ],
            dropShadowY: [ createKeyframe(500, 20), createKeyframe(600, 5), createKeyframe(700, 15), createKeyframe(1000, 10) ],
        },
        timelineState: { duration: 1200, isLooping: false, easing: 'easeOutBounce' },
    },
    'Carousel': {
        icon: GalleryHorizontal,
        iconColor: '#06b6d4', // Cyan
        animationData: {
            rotateY: [ createKeyframe(0, 0, 'linear'), createKeyframe(4000, 360, 'linear') ],
            translateZ: [ createKeyframe(0, 200), createKeyframe(1000, -200), createKeyframe(2000, 200), createKeyframe(3000, -200), createKeyframe(4000, 200) ],
            scaleX: [ createKeyframe(0, 1), createKeyframe(1000, .8), createKeyframe(2000, 1), createKeyframe(3000, .8), createKeyframe(4000, 1) ],
        },
        timelineState: { duration: 4000, isLooping: true, easing: 'easeInOutSine' },
    },
    'Fall Away': {
        icon: ArrowDownRight,
        iconColor: '#78716c', // Stone
        initialTransforms: { opacityEnabled: true, blurEnabled: true },
        animationData: {
            translateY: [ createKeyframe(0, 0), createKeyframe(1000, 200) ],
            translateZ: [ createKeyframe(0, 0), createKeyframe(1000, -800) ],
            rotateX: [ createKeyframe(0, 0), createKeyframe(1000, 45) ],
            opacity: [ createKeyframe(0, 1), createKeyframe(1000, 0) ],
            blur: [ createKeyframe(0, 0), createKeyframe(1000, 10) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeInExpo' },
    },
    // --- NEW DYNAMIC & EFFECTS PRESETS ---
    'Stomp': {
        icon: ArrowDownToLine,
        iconColor: '#ef4444', // Red
        initialTransforms: { translateY: -400, opacity: 0, opacityEnabled: true },
        animationData: {
            translateY: [ createKeyframe(0, -400, 'easeInCubic'), createKeyframe(500, 0, 'easeOutBounce') ],
            opacity: [ createKeyframe(0, 0), createKeyframe(300, 1) ],
            scaleX: [ createKeyframe(500, 1), createKeyframe(550, 1.1), createKeyframe(650, 0.95), createKeyframe(800, 1) ],
            scaleY: [ createKeyframe(500, 1), createKeyframe(550, 0.9), createKeyframe(650, 1.05), createKeyframe(800, 1) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeInOut' },
    },
    'Glitch': {
        icon: Zap,
        iconColor: '#67e8f9', // Cyan
        initialTransforms: { opacityEnabled: true },
        animationData: {
            translateX: [
                createKeyframe(0, 0, 'steps(1, end)'), createKeyframe(200, 0), createKeyframe(210, -10), createKeyframe(220, 10),
                createKeyframe(230, -10), createKeyframe(240, 0), createKeyframe(400, 0), createKeyframe(410, 5),
                createKeyframe(420, -5), createKeyframe(430, 5), createKeyframe(440, 0)
            ],
            opacity: [
                createKeyframe(0, 1, 'steps(1, end)'), createKeyframe(205, 0.8), createKeyframe(215, 1), createKeyframe(405, 0.9), createKeyframe(415, 1)
            ]
        },
        timelineState: { duration: 800, isLooping: true, easing: 'linear' },
    },
    'Float': {
        icon: Feather,
        iconColor: '#c084fc', // Purple
        animationData: {
            translateY: [ createKeyframe(0, 0), createKeyframe(2000, -20) ],
            rotateZ: [ createKeyframe(0, 0), createKeyframe(2000, 2) ],
        },
        timelineState: { duration: 4000, isLooping: true, direction: 'alternate', easing: 'easeInOutSine' },
    },
    'Unfurl': {
        icon: UnfoldVertical,
        iconColor: '#f59e0b', // Amber
        initialTransforms: { transformOriginY: 0, scaleY: 0 },
        animationData: {
            scaleY: [ createKeyframe(0, 0), createKeyframe(1000, 1) ],
            rotateX: [ createKeyframe(0, -90), createKeyframe(1000, 0) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeOutExpo' },
    },
    'Vortex In': {
        icon: LogIn,
        iconColor: '#34d399', // Emerald
        initialTransforms: { scaleX: 3, scaleY: 3, rotateZ: 270, opacity: 0, opacityEnabled: true },
        animationData: {
            scaleX: [ createKeyframe(0, 3), createKeyframe(1200, 1) ],
            scaleY: [ createKeyframe(0, 3), createKeyframe(1200, 1) ],
            rotateZ: [ createKeyframe(0, 270), createKeyframe(1200, 0) ],
            opacity: [ createKeyframe(0, 0), createKeyframe(1200, 1) ],
        },
        timelineState: { duration: 1200, isLooping: false, easing: 'easeOutCubic' },
    },
    'Scan Reveal': {
        icon: ScanLine,
        iconColor: '#22d3ee', // Cyan
        initialTransforms: { brightness: 0, opacity: 0, brightnessEnabled: true, opacityEnabled: true },
        animationData: {
            brightness: [ createKeyframe(0, 0), createKeyframe(500, 300), createKeyframe(1000, 100) ],
            opacity: [ createKeyframe(200, 0), createKeyframe(500, 1) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeOutCubic' },
    },
    'Flicker': {
        icon: Lightbulb,
        iconColor: '#facc15', // Yellow
        initialTransforms: { opacityEnabled: true },
        animationData: {
            opacity: [
                createKeyframe(0, 1, 'steps(1, end)'), createKeyframe(100, 0.9), createKeyframe(150, 1),
                createKeyframe(300, 0.85), createKeyframe(350, 1), createKeyframe(500, 0.95), createKeyframe(550, 1),
            ]
        },
        timelineState: { duration: 700, isLooping: true, easing: 'linear' },
    },
    'Pendulum': {
        icon: Clock,
        iconColor: '#a8a29e', // Stone
        initialTransforms: { transformOriginY: 0 },
        animationData: {
            rotateZ: [ createKeyframe(0, -20), createKeyframe(1000, 20) ],
        },
        timelineState: { duration: 2000, isLooping: true, direction: 'alternate', easing: 'easeInOutSine' },
    },
    'Jigsaw Snap': {
        icon: Puzzle,
        iconColor: '#818cf8', // Indigo
        initialTransforms: { translateX: -200, translateY: -200, rotateZ: -45, opacity: 0, opacityEnabled: true },
        animationData: {
            translateX: [ createKeyframe(0, -200), createKeyframe(1000, 0) ],
            translateY: [ createKeyframe(0, -200), createKeyframe(1000, 0) ],
            rotateZ: [ createKeyframe(0, -45), createKeyframe(1000, 0) ],
            opacity: [ createKeyframe(0, 0), createKeyframe(500, 1) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeOutBack' },
    },
    'Pixelate In': {
        icon: ToyBrick,
        iconColor: '#f472b6', // Pink
        initialTransforms: { blur: 20, scaleX: 0.8, scaleY: 0.8, opacity: 0, blurEnabled: true, opacityEnabled: true },
        animationData: {
            blur: [ createKeyframe(0, 20), createKeyframe(1000, 0) ],
            scaleX: [ createKeyframe(0, 0.8), createKeyframe(1000, 1) ],
            scaleY: [ createKeyframe(0, 0.8), createKeyframe(1000, 1) ],
            opacity: [ createKeyframe(0, 0), createKeyframe(1000, 1) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeOutQuint' },
    },
    'Paper Fold': {
        icon: FileText,
        iconColor: '#fbbf24', // Amber
        initialTransforms: { transformOriginX: 0, scaleX: 0 },
        animationData: {
            scaleX: [ createKeyframe(0, 0), createKeyframe(1000, 1) ],
            rotateY: [ createKeyframe(0, 90), createKeyframe(1000, 0) ],
        },
        timelineState: { duration: 1200, isLooping: false, easing: 'easeInOutCubic' },
    },
    // --- NEW ENTRANCE & EXIT PRESETS ---
    'Fade In Up': {
        icon: ArrowUpFromLine,
        iconColor: '#34d399', // Emerald
        initialTransforms: { opacity: 0, translateY: 50, opacityEnabled: true },
        animationData: {
            opacity: [ createKeyframe(0, 0), createKeyframe(800, 1) ],
            translateY: [ createKeyframe(0, 50), createKeyframe(800, 0) ],
        },
        timelineState: { duration: 800, isLooping: false, easing: 'easeOutCubic' },
    },
    'Slide In Left': {
        icon: ArrowLeftFromLine,
        iconColor: '#22d3ee', // Cyan
        initialTransforms: { opacity: 0, translateX: -100, opacityEnabled: true },
        animationData: {
            opacity: [ createKeyframe(0, 0), createKeyframe(800, 1) ],
            translateX: [ createKeyframe(0, -100), createKeyframe(800, 0) ],
        },
        timelineState: { duration: 800, isLooping: false, easing: 'easeOutCubic' },
    },
    'Bounce In': {
        icon: LogIn,
        iconColor: '#f59e0b', // Amber
        initialTransforms: { opacity: 0, scaleX: 0.5, scaleY: 0.5, opacityEnabled: true },
        animationData: {
            opacity: [ createKeyframe(0, 0), createKeyframe(200, 1) ],
            scaleX: [ createKeyframe(0, 0.5), createKeyframe(1000, 1) ],
            scaleY: [ createKeyframe(0, 0.5), createKeyframe(1000, 1) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeOutBounce' },
    },
    'Shrink Out': {
        icon: LogOut,
        iconColor: '#ef4444', // Red
        initialTransforms: { opacityEnabled: true },
        animationData: {
            opacity: [ createKeyframe(0, 1), createKeyframe(800, 0) ],
            scaleX: [ createKeyframe(0, 1), createKeyframe(800, 0.3) ],
            scaleY: [ createKeyframe(0, 1), createKeyframe(800, 0.3) ],
        },
        timelineState: { duration: 800, isLooping: false, easing: 'easeInCubic' },
    },
    'Hinge': {
        icon: DoorOpen,
        iconColor: '#a8a29e', // Stone
        initialTransforms: { transformOriginX: 0, transformOriginY: 0, opacityEnabled: true },
        animationData: {
            rotateZ: [
                createKeyframe(0, 0, 'easeInOut'),
                createKeyframe(400, 80, 'easeInOut'),
                createKeyframe(800, 60, 'easeInOut'),
                createKeyframe(1200, 80, 'easeInOut'),
                createKeyframe(1600, 60)
            ],
            translateY: [
                createKeyframe(0, 0),
                createKeyframe(1600, 0, 'easeInCubic'),
                createKeyframe(2000, 700)
            ],
            opacity: [
                createKeyframe(0, 1),
                createKeyframe(1600, 1, 'easeInCubic'),
                createKeyframe(2000, 0)
            ]
        },
        timelineState: { duration: 2000, isLooping: false },
    },

    // --- NEW 3D & PERSPECTIVE PRESETS ---
    'Tumble': {
        icon: Box,
        iconColor: '#818cf8', // Indigo
        animationData: {
            rotateX: [ createKeyframe(0, 0), createKeyframe(1500, 360) ],
            rotateY: [ createKeyframe(0, 0), createKeyframe(1500, -360) ],
            rotateZ: [ createKeyframe(0, 0), createKeyframe(1500, 360) ],
            translateZ: [ createKeyframe(0, 0), createKeyframe(500, -100), createKeyframe(1000, 100), createKeyframe(1500, 0) ],
        },
        timelineState: { duration: 1500, isLooping: true, easing: 'linear' },
    },
    'Swoop In': {
        icon: Rocket,
        iconColor: '#f472b6', // Pink
        initialTransforms: { opacity: 0, rotateX: 90, translateY: -200, opacityEnabled: true },
        animationData: {
            opacity: [ createKeyframe(0, 0), createKeyframe(500, 1) ],
            rotateX: [ createKeyframe(0, 90), createKeyframe(1000, 0) ],
            translateY: [ createKeyframe(0, -200), createKeyframe(1000, 0) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeOutExpo' },
    },
    'Conveyor Belt': {
        icon: FastForward,
        iconColor: '#a8a29e', // Stone
        initialTransforms: { perspective: 800, rotateY: 20 },
        animationData: {
            translateX: [ createKeyframe(0, -300, 'linear'), createKeyframe(3000, 300, 'linear') ],
            translateZ: [ createKeyframe(0, -100, 'linear'), createKeyframe(1500, 50), createKeyframe(3000, -100, 'linear') ],
        },
        timelineState: { duration: 3000, isLooping: true, easing: 'linear' },
    },

    // --- NEW EFFECT & FUN PRESETS ---
    'Liquify': {
        icon: Droplets,
        iconColor: '#67e8f9', // Cyan
        animationData: {
            skewX: [ createKeyframe(0, 0), createKeyframe(250, -10), createKeyframe(500, 10), createKeyframe(750, -5), createKeyframe(1000, 0) ],
            skewY: [ createKeyframe(0, 0), createKeyframe(250, 5), createKeyframe(500, -5), createKeyframe(750, 2.5), createKeyframe(1000, 0) ],
        },
        timelineState: { duration: 2000, isLooping: true, direction: 'alternate', easing: 'easeInOutSine' },
    },
    'Focus Blur': {
        icon: Focus,
        iconColor: '#fbbf24', // Amber
        initialTransforms: { blurEnabled: true },
        animationData: {
            scaleX: [ createKeyframe(0, 1.1), createKeyframe(1000, 1) ],
            scaleY: [ createKeyframe(0, 1.1), createKeyframe(1000, 1) ],
            blur: [ createKeyframe(0, 8), createKeyframe(1000, 0) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeOutCubic' },
    },
    'Spotlight': {
        icon: SunDim,
        iconColor: '#facc15', // Yellow
        initialTransforms: { brightnessEnabled: true },
        animationData: {
            brightness: [ createKeyframe(0, 50), createKeyframe(1000, 150) ],
        },
        timelineState: { duration: 2000, isLooping: true, direction: 'alternate', easing: 'easeInOutSine' },
    },
    'Unroll': {
        icon: ScrollText,
        iconColor: '#78716c', // Stone
        initialTransforms: { transformOriginY: 0, scaleY: 0, opacityEnabled: true },
        animationData: {
            scaleY: [ createKeyframe(0, 0), createKeyframe(1200, 1) ],
            opacity: [ createKeyframe(0, 0), createKeyframe(200, 1) ],
        },
        timelineState: { duration: 1200, isLooping: false, easing: 'easeOutElastic' },
    },
    'Rock On': {
        icon: HandMetal,
        iconColor: '#ec4899', // Pink
        animationData: {
            rotateZ: [ createKeyframe(0, 0), createKeyframe(100, -15), createKeyframe(200, 10), createKeyframe(300, -15), createKeyframe(400, 10), createKeyframe(500, 0) ],
        },
        timelineState: { duration: 500, isLooping: true, easing: 'easeInOut' },
    },
    'Explode': {
        icon: Bomb,
        iconColor: '#f87171', // Red
        initialTransforms: { opacityEnabled: true, blurEnabled: true },
        animationData: {
            scaleX: [ createKeyframe(0, 1), createKeyframe(500, 2) ],
            scaleY: [ createKeyframe(0, 1), createKeyframe(500, 2) ],
            opacity: [ createKeyframe(200, 1), createKeyframe(500, 0) ],
            blur: [ createKeyframe(0, 0), createKeyframe(500, 15) ],
        },
        timelineState: { duration: 500, isLooping: false, easing: 'easeInCubic' },
    },
    'Squeeze': {
        icon: UnfoldHorizontal,
        iconColor: '#a78bfa', // Violet
        animationData: {
            scaleX: [ createKeyframe(0, 1), createKeyframe(200, 1.2), createKeyframe(500, 1) ],
            scaleY: [ createKeyframe(0, 1), createKeyframe(200, 0.8), createKeyframe(500, 1) ],
        },
        timelineState: { duration: 1000, isLooping: true, direction: 'alternate', easing: 'easeInOutBack' },
    },

    // --- Additional Presets ---
    'Swoosh In': {
        icon: FastForward,
        iconColor: '#34d399', // Emerald
        initialTransforms: { translateX: -200, skewX: 15, opacity: 0, opacityEnabled: true },
        animationData: {
            translateX: [ createKeyframe(0, -200), createKeyframe(800, 0) ],
            skewX: [ createKeyframe(0, 15), createKeyframe(800, 0) ],
            opacity: [ createKeyframe(0, 0), createKeyframe(400, 1) ],
        },
        timelineState: { duration: 800, isLooping: false, easing: 'easeOutQuint' },
    },
    'Illuminate': {
        icon: SunDim,
        iconColor: '#facc15', // Yellow
        initialTransforms: { brightnessEnabled: true, dropShadowEnabled: true },
        animationData: {
            brightness: [ createKeyframe(0, 100), createKeyframe(1000, 175), createKeyframe(2000, 100) ],
            dropShadowX: [ createKeyframe(0, -80), createKeyframe(2000, 80) ],
            dropShadowColor: [ createKeyframe(0, 'rgba(255,255,240,0)'), createKeyframe(1000, 'rgba(255,255,240,0.6)'), createKeyframe(2000, 'rgba(255,255,240,0)') ],
            dropShadowBlur: [ createKeyframe(0, 20), createKeyframe(1000, 50), createKeyframe(2000, 20) ],
        },
        timelineState: { duration: 2000, isLooping: true, direction: 'alternate', easing: 'easeInOutSine' },
    },
    'Jitter': {
        icon: Vibrate,
        iconColor: '#fb923c', // Orange
        animationData: {
            translateX: [ createKeyframe(0, 0), createKeyframe(25, -2), createKeyframe(50, 2), createKeyframe(75, -2), createKeyframe(100, 2), createKeyframe(125, -2), createKeyframe(150, 0) ],
            rotateZ: [ createKeyframe(0, 0), createKeyframe(25, 1), createKeyframe(50, -1), createKeyframe(75, 1), createKeyframe(100, -1), createKeyframe(125, 1), createKeyframe(150, 0) ],
        },
        timelineState: { duration: 150, isLooping: true, easing: 'linear' },
    },
    'Pop Out': {
        icon: BoxSelect,
        iconColor: '#c084fc', // Purple
        initialTransforms: { opacity: 0, scaleX: 0.5, scaleY: 0.5, opacityEnabled: true },
        animationData: {
            scaleX: [ createKeyframe(0, 0.5), createKeyframe(800, 1) ],
            scaleY: [ createKeyframe(0, 0.5), createKeyframe(800, 1) ],
            translateZ: [ createKeyframe(0, 0), createKeyframe(500, 50), createKeyframe(800, 0) ],
            opacity: [ createKeyframe(0, 0), createKeyframe(300, 1) ],
        },
        timelineState: { duration: 800, isLooping: false, easing: 'easeOutBack' },
    },
    'Slide Out Right': {
        icon: LogOut,
        iconColor: '#f87171', // Red
        initialTransforms: { opacityEnabled: true },
        animationData: {
            translateX: [ createKeyframe(0, 0), createKeyframe(800, 200) ],
            opacity: [ createKeyframe(0, 1), createKeyframe(800, 0) ],
            skewX: [ createKeyframe(0, 0), createKeyframe(800, -10) ],
        },
        timelineState: { duration: 800, isLooping: false, easing: 'easeInCubic' },
    },
    'Perspective Shift': {
        icon: ScanEye,
        iconColor: '#67e8f9', // Cyan
        animationData: {
            perspectiveOriginX: [ createKeyframe(0, 0), createKeyframe(2000, 100) ],
            perspectiveOriginY: [ createKeyframe(0, 50), createKeyframe(1000, 100), createKeyframe(2000, 0) ],
        },
        timelineState: { duration: 2000, isLooping: true, direction: 'alternate', easing: 'easeInOutSine' },
    },
    'Iris In': {
        icon: Camera,
        iconColor: '#a8a29e', // Stone
        initialTransforms: { opacity: 0, scaleX: 0, scaleY: 0, borderRadius: 200, opacityEnabled: true, borderRadiusEnabled: true },
        animationData: {
            opacity: [ createKeyframe(0, 0), createKeyframe(500, 1) ],
            scaleX: [ createKeyframe(0, 0), createKeyframe(1000, 1) ],
            scaleY: [ createKeyframe(0, 0), createKeyframe(1000, 1) ],
            borderRadius: [ createKeyframe(0, 200), createKeyframe(1000, 12) ],
        },
        timelineState: { duration: 1000, isLooping: false, easing: 'easeOutQuint' },
    },
};

// --- NEW STAGE STYLE TYPES ---

export type StageStyleName = 'Default' | 'Synthwave' | 'Blueprint' | 'Golden Hour' | 'Monochrome';

export interface StageStyle {
  name: StageStyleName;
  // FIX: Added strokeWidth to icon type to match usage in StageStyleSelector
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; }>;
  stage: {
    background: string; // CSS background value
    gridColor: string;
  };
  card: {
    base: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
  cube: string[]; // array of 6 face colors
  text: {
    from: string;
    to: string;
  };
}

export const STAGE_STYLES: Record<StageStyleName, StageStyle> = {
    'Default': {
        name: 'Default',
        icon: Palette,
        stage: {
            background: 'radial-gradient(circle at center, #111, #000)', // zinc-800 to zinc-950
            gridColor: 'rgba(129, 140, 248, 0.4)', // indigo-400
        },
        card: {
            base: 'rgba(39, 39, 42, 1)', // zinc-800
            accent: '#6366f1', // indigo-500
            textPrimary: '#ffffff',
            textSecondary: '#a1a1aa', // zinc-400
            border: '#52525b', // zinc-600
        },
        cube: [
            'rgba(167, 139, 250, 0.5)',
            'rgba(99, 102, 241, 0.5)',
            'rgba(79, 70, 229, 0.5)',
            'rgba(55, 48, 163, 0.5)',
            'rgba(239, 68, 68, 0.5)',
            'rgba(245, 158, 11, 0.5)',
        ],
        text: { from: '#818cf8', to: '#67e8f9' }, // indigo-400 to cyan-300
    },
    'Synthwave': {
        name: 'Synthwave',
        icon: Moon,
        stage: {
            background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
            gridColor: 'rgba(255, 0, 255, 0.4)',
        },
        card: {
            base: 'rgba(29, 17, 57, 0.8)',
            accent: '#ec4899', // pink-500
            textPrimary: '#f0f9ff', // sky-50
            textSecondary: '#00d9ff',
            border: 'rgba(236, 72, 153, 0.5)',
        },
        cube: [
            'rgba(236, 72, 153, 0.6)',
            'rgba(192, 38, 211, 0.6)',
            'rgba(139, 92, 246, 0.6)',
            'rgba(99, 102, 241, 0.6)',
            'rgba(56, 189, 248, 0.6)',
            'rgba(34, 211, 238, 0.6)',
        ],
        text: { from: '#ec4899', to: '#22d3ee' },
    },
    'Blueprint': {
        name: 'Blueprint',
        icon: PenTool,
        stage: {
            background: '#335182',
            gridColor: 'rgba(255, 255, 255, 0.3)',
        },
        card: {
            base: 'rgba(255, 255, 255, 0.1)',
            accent: '#ffffff',
            textPrimary: '#ffffff',
            textSecondary: '#bfdbfe', // blue-200
            border: 'rgba(255, 255, 255, 0.4)',
        },
        cube: Array(6).fill('rgba(255, 255, 255, 0.2)'),
        text: { from: '#ffffff', to: '#bfdbfe' },
    },
    'Golden Hour': {
        name: 'Golden Hour',
        icon: Sun,
        stage: {
            background: 'radial-gradient(circle at center, #4d3319, #1c1917)',
            gridColor: 'rgba(251, 146, 60, 0.4)',
        },
        card: {
            base: 'rgba(40, 26, 13, 0.9)',
            accent: '#f59e0b', // amber-500
            textPrimary: '#fff7ed', // orange-50
            textSecondary: '#fed7aa', // orange-200
            border: 'rgba(202, 138, 4, 0.5)',
        },
        cube: [
            'rgba(217, 119, 6, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(251, 191, 36, 0.6)',
            'rgba(202, 138, 4, 0.6)',
            'rgba(180, 83, 9, 0.6)',
            'rgba(146, 64, 14, 0.6)',
        ],
        text: { from: '#fcd34d', to: '#fb923c' },
    },
    'Monochrome': {
        name: 'Monochrome',
        icon: Contrast,
        stage: {
            background: 'radial-gradient(circle at center, #404040, #171717)',
            gridColor: 'rgba(255, 255, 255, 0.2)',
        },
        card: {
            base: 'rgba(38, 38, 38, 0.9)',
            accent: '#fafafa', // gray-50
            textPrimary: '#fafafa',
            textSecondary: '#a3a3a3', // neutral-400
            border: '#737373', // neutral-500
        },
        cube: [
            'rgba(255, 255, 255, 0.1)',
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.4)',
            'rgba(255, 255, 255, 0.5)',
            'rgba(255, 255, 255, 0.6)',
        ],
        text: { from: '#e5e5e5', to: '#d4d4d4' },
    },
};

// --- NEW ENGINE TYPES ---

export type AnimationEngine = 'css' | 'gsap' | 'animejs' | 'motion' | 'threejs';

export interface MotionEngineConfig {
    type: 'spring' | 'tween';
    stiffness: number;
    damping: number;
    mass: number;
}
export interface GsapEngineConfig {
    easeAmplitude: number;
    easePeriod: number;
}
export interface AnimejsEngineConfig {
    elasticity: number;
}
export interface EngineConfig {
    motion: MotionEngineConfig;
    gsap: GsapEngineConfig;
    animejs: AnimejsEngineConfig;
}

export const ENGINE_COLORS: Record<AnimationEngine, { bg: string; text: string; border: string }> = {
    css: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500' },
    gsap: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500' },
    animejs: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
    motion: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500' },
    threejs: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', border: 'border-zinc-500' },
};
