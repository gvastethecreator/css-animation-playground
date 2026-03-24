import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

type TooltipPosition = `${'top' | 'bottom' | 'left' | 'right'}-${'start' | 'center' | 'end'}`;

const PLACEMENT_ORDER: TooltipPosition[] = [
  'top-center',
  'bottom-center',
  'right-center',
  'left-center',
  'top-start',
  'top-end',
  'bottom-start',
  'bottom-end',
  'right-start',
  'right-end',
  'left-start',
  'left-end',
];

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, delay = 200 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [dataPos, setDataPos] = useState<TooltipPosition>('top-center');
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const handleMouseEnter = useCallback(() => {
    timerRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(timerRef.current);
    setIsVisible(false);
  }, []);

  useLayoutEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const gap = 8;

      const positions: Record<TooltipPosition, () => { top: number; left: number }> = {
        'top-center': () => ({ top: triggerRect.top - gap, left: triggerRect.left + triggerRect.width / 2 }),
        'top-start': () => ({ top: triggerRect.top - gap, left: triggerRect.left }),
        'top-end': () => ({ top: triggerRect.top - gap, left: triggerRect.right }),
        'bottom-center': () => ({ top: triggerRect.bottom + gap, left: triggerRect.left + triggerRect.width / 2 }),
        'bottom-start': () => ({ top: triggerRect.bottom + gap, left: triggerRect.left }),
        'bottom-end': () => ({ top: triggerRect.bottom + gap, left: triggerRect.right }),
        'right-center': () => ({ top: triggerRect.top + triggerRect.height / 2, left: triggerRect.right + gap }),
        'right-start': () => ({ top: triggerRect.top, left: triggerRect.right + gap }),
        'right-end': () => ({ top: triggerRect.bottom, left: triggerRect.right + gap }),
        'left-center': () => ({ top: triggerRect.top + triggerRect.height / 2, left: triggerRect.left - gap }),
        'left-start': () => ({ top: triggerRect.top, left: triggerRect.left - gap }),
        'left-end': () => ({ top: triggerRect.bottom, left: triggerRect.left - gap }),
      };

      const placements = PLACEMENT_ORDER;

      let bestPlacement: TooltipPosition = 'top-center';

      for (const placement of placements) {
        const { top, left } = positions[placement]();

        let finalLeft = left;
        let finalTop = top;

        if (placement.endsWith('center')) finalLeft -= tooltipRect.width / 2;
        if (placement.endsWith('end')) finalLeft -= tooltipRect.width;

        if (placement.startsWith('top')) finalTop -= tooltipRect.height;
        if (placement.startsWith('right') || placement.startsWith('left')) {
          if (placement.endsWith('center')) finalTop -= tooltipRect.height / 2;
          if (placement.endsWith('end')) finalTop -= tooltipRect.height;
        }
        if (placement.startsWith('left')) finalLeft -= tooltipRect.width;

        if (
          finalTop >= 0 &&
          finalLeft >= 0 &&
          finalTop + tooltipRect.height <= window.innerHeight &&
          finalLeft + tooltipRect.width <= window.innerWidth
        ) {
          bestPlacement = placement;
          break;
        }
      }

      setDataPos(bestPlacement);
      setPosition(positions[bestPlacement]());
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isVisible]);

  // Usamos un wrapper div (con display: contents para no afectar layout) en lugar de cloneElement
  // Esto es más seguro y funciona con cualquier hijo.
  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        style={{ display: 'contents' }}
      >
        {children}
      </div>
      {isVisible &&
        ReactDOM.createPortal(
          <div
            role="tooltip"
            ref={tooltipRef}
            className={`tooltip-content ${isVisible ? 'visible' : ''}`}
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            data-pos={dataPos}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
};

export default Tooltip;
