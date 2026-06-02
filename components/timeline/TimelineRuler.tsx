import React from 'react';

interface RulerProps {
  duration: number;
  pixelsPerMs: number;
}

const TimelineRuler = ({ duration, pixelsPerMs }: RulerProps) => {
  if (duration <= 0 || pixelsPerMs <= 0) return null;

  // Target pixel spacing for major ticks
  const targetSpacing = 100;

  // Available time intervals in ms
  const intervals = [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

  let majorTickIntervalMs = intervals[0];

  // Find optimal interval
  for (const interval of intervals) {
    const spacing = interval * pixelsPerMs;
    if (spacing >= targetSpacing) {
      majorTickIntervalMs = interval;
      break;
    }
    majorTickIntervalMs = interval; // Fallback to largest if none fit, though unlikely with this list
  }

  const minorTicksPerMajor = 5;
  const numMajorTicks = Math.floor(duration / majorTickIntervalMs);
  const ticks = [];

  for (let i = 0; i <= numMajorTicks; i++) {
    const time = i * majorTickIntervalMs;
    const left = time * pixelsPerMs;

    ticks.push(
      <div key={`major-${i}`} className="absolute h-full w-px bg-zinc-600 top-0" style={{ left: `${left}px` }}>
        <span className="absolute top-full mt-0.5 -translate-x-1/2 text-[10px] text-zinc-500 font-mono whitespace-nowrap">
          {time >= 1000 ? `${(time / 1000).toFixed(1).replace(/\.0$/, '')}s` : `${time}ms`}
        </span>
      </div>,
    );

    // Minor ticks
    if (i < numMajorTicks) {
      const minorTickSpacing = (majorTickIntervalMs / minorTicksPerMajor) * pixelsPerMs;
      if (minorTickSpacing > 6) {
        // Only draw if space permits
        for (let j = 1; j < minorTicksPerMajor; j++) {
          const minorTime = time + j * (majorTickIntervalMs / minorTicksPerMajor);
          if (minorTime > duration) break;
          const minorLeft = minorTime * pixelsPerMs;
          ticks.push(
            <div
              key={`minor-${i}-${j}`}
              className="absolute h-1/3 w-px bg-zinc-800 top-0"
              style={{ left: `${minorLeft}px` }}
            />,
          );
        }
      }
    }
  }

  return <div className="absolute top-0 left-0 w-full h-4 pointer-events-none border-b border-zinc-800">{ticks}</div>;
};

export default React.memo(TimelineRuler);
