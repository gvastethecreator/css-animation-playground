
import React from 'react';
import { StageStyle, TransformState } from '../types';
import StageLayers from './StageLayers';
import { CreditCard, Cpu } from 'lucide-react';

interface StageCardProps {
  transforms: TransformState;
  isExploded: boolean;
  isAdjusting: boolean;
  isPlaying: boolean;
  style: StageStyle['card'];
  showStageUI: boolean;
  willChangeString: string;
  onClick?: () => void;
  imageDataUrl?: string | null;
}

const StageCard = React.forwardRef<HTMLDivElement, StageCardProps>(({ 
    transforms,
    isExploded, 
    isAdjusting, 
    isPlaying,
    style,
    showStageUI,
    willChangeString,
    onClick,
    imageDataUrl,
}, ref) => {
  
  return (
    <StageLayers
      ref={ref}
      transforms={transforms}
      isExploded={isExploded}
      isAdjusting={isAdjusting}
      isPlaying={isPlaying}
      className="w-72 h-96"
      layerGap={50}
      showStageUI={showStageUI}
      willChangeString={willChangeString}
      onClick={onClick}
    >
        {/* Layer 1: Backface (Technical View) */}
        <div className="absolute inset-0 rounded-2xl preserve-3d">
            <div 
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center backface-hidden border-2"
                style={{ 
                    transform: 'rotateY(180deg)',
                    backgroundColor: '#18181b', // zinc-900
                    borderColor: style.border,
                    backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
                    backgroundSize: '10px 10px'
                }}
            >
                <div className="p-4 rounded-full bg-zinc-800/80 mb-4 border border-zinc-700">
                    <Cpu size={32} color={style.textSecondary} />
                </div>
                <p className="font-mono text-sm font-bold tracking-widest uppercase" style={{ color: style.textSecondary }}>Backend</p>
                <p className="font-mono text-[10px] mt-2 opacity-50" style={{ color: style.textSecondary }}>SISTEMA: V-2.0</p>
            </div>
        </div>
        
        {/* Layer 2: Base Card Background */}
        <div 
            className="absolute inset-0 rounded-2xl backface-hidden shadow-xl"
            style={{ backgroundColor: style.base, border: `1px solid ${style.border}` }}
        />
        
        {/* Layer 3: Image Layer with Gradient Overlay */}
        <div
            className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden"
        >
            <div className="h-2/3 relative w-full">
                <img 
                    src={imageDataUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"} 
                    alt="Card Cover" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                    <CreditCard size={16} className="text-white/80" />
                </div>
            </div>
        </div>
        
        {/* Layer 4: Content & Typography */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 backface-hidden pointer-events-none">
            <div className="relative z-10">
                <div className="flex gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white bg-indigo-500/80 backdrop-blur-sm border border-indigo-400/30">
                        CSS 3D
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white bg-white/10 backdrop-blur-sm border border-white/10">
                        WEBGL
                    </span>
                </div>
                <h3 className="text-2xl font-bold leading-tight mb-1 text-white drop-shadow-sm">
                    Dimensiones <br/> <span style={{ color: style.accent }}>Interactivas</span>
                </h3>
                <p className="text-sm font-medium text-zinc-400 leading-snug max-w-[90%]">
                    Explora transformaciones espaciales en tiempo real.
                </p>
            </div>
        </div>

        {/* Layer 5: Decorative UI Elements (Floating) */}
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full backface-hidden border-4 border-zinc-900" style={{ backgroundColor: style.accent }}>
             <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                3D
             </div>
        </div>
    </StageLayers>
  );
});

export default StageCard;
