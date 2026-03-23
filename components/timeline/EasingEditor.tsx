import React, { useRef, useState, useEffect, useLayoutEffect, memo } from 'react';
import ReactDOM from 'react-dom';
import { EasingName, PROPERTY_COLORS } from '../../types';
import { Spline } from 'lucide-react';
import EasingCurve from './EasingCurve';
import BezierEditor from './BezierEditor';

const easingGroups: Record<string, EasingName[]> = {
    'Standard': ['linear', 'ease', 'easeIn', 'easeOut', 'easeInOut'],
    'Sine': ['easeInSine', 'easeOutSine', 'easeInOutSine'],
    'Quad': ['easeInQuad', 'easeOutQuad', 'easeInOutQuad'],
    'Cubic': ['easeInCubic', 'easeOutCubic', 'easeInOutCubic'],
    'Quart': ['easeInQuart', 'easeOutQuart', 'easeInOutQuart'],
    'Quint': ['easeInQuint', 'easeOutQuint', 'easeInOutQuint'],
    'Expo': ['easeInExpo', 'easeOutExpo', 'easeInOutExpo'],
    'Circ': ['easeInCirc', 'easeOutCirc', 'easeInOutCirc'],
    'Dynamic': [
        'easeInBack', 'easeOutBack', 'easeInOutBack', 'easeOutBackSoft',
        'easeInElastic', 'easeOutElastic', 'easeInOutElastic',
        'easeInBounce', 'easeOutBounce', 'easeInOutBounce',
        'spring', 'springy', 'snappy', 'snap', 'bouncy', 'anticipateOvershoot',
        'materialAccelerate', 'materialDecelerate'
    ],
};

interface EasingEditorProps {
    easing: EasingName | string;
    onEasingChange: (newEasing: EasingName | string) => void;
    color: string;
    onClose: () => void;
    anchorEl: HTMLButtonElement | null;
}

const EasingEditor = memo(({ easing, onEasingChange, color, onClose, anchorEl }: EasingEditorProps) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [transformOrigin, setTransformOrigin] = useState('top center');
    const [isVisible, setIsVisible] = useState(false);

    useLayoutEffect(() => {
        if (!anchorEl) return;

        const updatePosition = () => {
            if (!anchorEl || !popoverRef.current) return;

            const anchorRect = anchorEl.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();
            const gap = 8;

            let top = anchorRect.bottom + gap;
            let origin = 'top center';

            if (top + popoverRect.height > window.innerHeight && anchorRect.top - popoverRect.height - gap > 0) {
                top = anchorRect.top - popoverRect.height - gap;
                origin = 'bottom center';
            }

            let left = anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2;

            if (left < gap) left = gap;
            if (left + popoverRect.width > window.innerWidth - gap) {
                left = window.innerWidth - popoverRect.width - gap;
            }

            setPosition({ top, left });
            setTransformOrigin(origin);
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);

        const timer = setTimeout(() => setIsVisible(true), 10);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
        };
    }, [anchorEl]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && anchorEl && !anchorEl.contains(event.target as Node)) {
                onClose();
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, anchorEl]);

    if (!anchorEl) return null;

    return ReactDOM.createPortal(
        <div
            ref={popoverRef}
            className={`absolute z-[1001] bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-64 backdrop-blur-sm bg-opacity-80 flex flex-col transition-all duration-150 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                transformOrigin: transformOrigin,
            }}
        >
            <div className="flex items-center border-b border-zinc-800 shrink-0">
                <button onClick={() => setActiveTab('presets')} className={`flex-1 text-center text-[13px] p-2 ${activeTab === 'presets' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50'}`}>Presets</button>
                <button onClick={() => setActiveTab('custom')} className={`flex-1 text-center text-[13px] p-2 flex items-center justify-center gap-1 ${activeTab === 'custom' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50'}`}>
                    <Spline size={16} strokeWidth={2} /> Custom
                </button>
            </div>
            {activeTab === 'presets' && (
                <div className="space-y-1 p-1 overflow-y-auto" style={{ maxHeight: '20rem' }}>
                    {Object.entries(easingGroups).map(([groupName, easings]) => (
                        <div key={groupName}>
                            <h5 className="text-zinc-500 text-[10px] font-bold uppercase px-1 mt-1.5 first:mt-0">{groupName}</h5>
                            {easings.map(e => (
                                <button
                                    key={e}
                                    onClick={() => onEasingChange(e)}
                                    className={`w-full text-left p-1 rounded-md flex items-center gap-2 transition-colors ${easing === e ? 'bg-indigo-500 text-white' : 'hover:bg-zinc-800'}`}
                                >
                                    <div className="w-8 h-8 bg-zinc-950 border border-zinc-800 rounded-sm p-1 flex items-center justify-center shrink-0">
                                        <EasingCurve easing={e} width={24} height={24} color={easing === e ? '#fff' : color} />
                                    </div>
                                    <span className="text-[13px] font-medium truncate">{e}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}
            {activeTab === 'custom' && (
                <div className="p-2">
                    <BezierEditor
                        easing={easing}
                        onChange={onEasingChange}
                        color={color}
                    />
                </div>
            )}
        </div>,
        document.body
    );
});

export default EasingEditor;