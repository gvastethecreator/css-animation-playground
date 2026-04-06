import React, { useState, useEffect, useRef, memo } from "react";
import { EasingName, EasingValue } from "../types";
import { easingFunctions, EASING_CSS_MAP } from "../easing";

interface BezierEditorProps {
  easing: EasingValue;
  onChange: (easing: string) => void;
  color: string;
}

const parseBezier = (easing: string): [number, number, number, number] => {
  // 1. Direct match for a cubic-bezier string
  if (typeof easing === "string" && easing.startsWith("cubic-bezier")) {
    const match = easing.match(/-?[\d.]+/g);
    if (match && match.length === 4) {
      return match.map(Number) as [number, number, number, number];
    }
  }

  // 2. Look up a named easing in our map
  const cssValue = EASING_CSS_MAP[easing as EasingName];
  if (cssValue) {
    // 3. If the mapped value is a cubic-bezier string, parse it directly
    if (cssValue.startsWith("cubic-bezier")) {
      const match = cssValue.match(/-?[\d.]+/g);
      if (match && match.length === 4) {
        return match.map(Number) as [number, number, number, number];
      }
    }
    // 4. Handle standard CSS keywords by mapping them to their bezier equivalents
    const keywordMap: Record<string, [number, number, number, number]> = {
      ease: [0.25, 0.1, 0.25, 1.0],
      "ease-in": [0.42, 0, 1.0, 1.0],
      "ease-out": [0, 0, 0.58, 1.0],
      "ease-in-out": [0.42, 0, 0.58, 1.0],
      linear: [0, 0, 1, 1],
    };
    if (keywordMap[cssValue]) {
      return keywordMap[cssValue];
    }
  }

  // 5. Fallback for anything else (like 'steps()', invalid strings, etc.)
  return [0.42, 0, 0.58, 1]; // Default to easeInOut's values
};

const BezierEditor = memo(({ easing, onChange, color }: BezierEditorProps) => {
  const [p1, setP1] = useState({ x: 0, y: 0 });
  const [p2, setP2] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<"p1" | "p2" | null>(null);

  const p1Ref = useRef(p1);
  const p2Ref = useRef(p2);
  p1Ref.current = p1;
  p2Ref.current = p2;

  useEffect(() => {
    const [x1, y1, x2, y2] = parseBezier(easing);
    setP1({ x: x1, y: y1 });
    setP2({ x: x2, y: y2 });
  }, [easing]);

  const getMousePos = (e: MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = (e.clientY - rect.top) / rect.height;
    return { x, y: 1 - y };
  };

  const handleMouseDown = (point: "p1" | "p2") => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(point);
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = getMousePos(e);
      const updater = dragging === "p1" ? setP1 : setP2;
      updater({ x, y });
    };

    const handleMouseUp = () => {
      onChange(
        `cubic-bezier(${p1Ref.current.x.toFixed(3)}, ${p1Ref.current.y.toFixed(3)}, ${p2Ref.current.x.toFixed(3)}, ${p2Ref.current.y.toFixed(3)})`,
      );
      setDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, onChange]);

  const size = 200;
  const padding = 20;
  const graphSize = size - padding * 2;
  const toSVG = (p: { x: number; y: number }) => ({
    x: padding + p.x * graphSize,
    y: padding + (1 - p.y) * graphSize,
  });

  const p0_svg = { x: padding, y: padding + graphSize };
  const p1_svg = toSVG(p1);
  const p2_svg = toSVG(p2);
  const p3_svg = { x: padding + graphSize, y: padding };
  const bezierFunc = easingFunctions.createBezier(p1.x, p1.y, p2.x, p2.y);

  let pathData = `M ${p0_svg.x} ${p0_svg.y}`;
  const points = 50;
  for (let i = 1; i <= points; i++) {
    const t = i / points;
    const easedT = bezierFunc(t);
    pathData += ` L ${padding + t * graphSize} ${padding + (1 - easedT) * graphSize}`;
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="bg-zinc-800 rounded-md cursor-pointer"
      >
        <path
          d={`M ${padding} ${padding} L ${padding} ${size - padding} L ${size - padding} ${size - padding}`}
          fill="none"
          stroke="#4b5563"
          strokeWidth="1"
        />
        <line
          x1={p0_svg.x}
          y1={p0_svg.y}
          x2={p1_svg.x}
          y2={p1_svg.y}
          stroke="#6b7280"
          strokeWidth="1"
        />
        <line
          x1={p3_svg.x}
          y1={p3_svg.y}
          x2={p2_svg.x}
          y2={p2_svg.y}
          stroke="#6b7280"
          strokeWidth="1"
        />
        <path d={pathData} stroke={color} strokeWidth="2.5" fill="none" />
        <circle
          cx={p1_svg.x}
          cy={p1_svg.y}
          r="6"
          fill="white"
          onMouseDown={handleMouseDown("p1")}
          className="cursor-grab active:cursor-grabbing"
        />
        <circle
          cx={p2_svg.x}
          cy={p2_svg.y}
          r="6"
          fill="white"
          onMouseDown={handleMouseDown("p2")}
          className="cursor-grab active:cursor-grabbing"
        />
      </svg>
      <div className="font-mono text-[11px] text-zinc-400 mt-2 bg-zinc-800 px-2 py-1 rounded w-full text-center select-all">
        {`cubic-bezier(${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)}, ${p2.y.toFixed(2)})`}
      </div>
    </div>
  );
});

export default BezierEditor;
