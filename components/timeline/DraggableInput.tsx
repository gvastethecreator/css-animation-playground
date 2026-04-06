import React, { useState, useEffect, useRef } from "react";
import Tooltip from "../Tooltip";

interface DraggableInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  title?: string;
  children?: React.ReactNode;
}

const DraggableInput: React.FC<DraggableInputProps> = ({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  className = "",
  title = "",
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const getPrecision = (num: number) => (num.toString().split(".")[1] || "").length;

  useEffect(() => {
    if (!isEditing) {
      const precision = getPrecision(step);
      setInputValue(value.toFixed(precision));
    }
  }, [value, isEditing, step]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleCommit = () => {
    setIsEditing(false);
    let numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      numericValue = Math.max(min, Math.min(max, numericValue));
      onChange(numericValue);
    } else {
      const precision = getPrecision(step);
      setInputValue(value.toFixed(precision));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCommit();
    else if (e.key === "Escape") {
      setIsEditing(false);
      const precision = getPrecision(step);
      setInputValue(value.toFixed(precision));
    }
  };

  const handleDragMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault();
    const startX = e.clientX;
    const startValue = value;

    document.body.style.cursor = "ew-resize";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let sensitivity = step;
      if (moveEvent.shiftKey) {
        sensitivity *= 10;
      }
      let newValue = startValue + deltaX * sensitivity;
      newValue = Math.max(min, Math.min(max, newValue));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      document.body.style.cursor = "default";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const precision = getPrecision(step);

  return (
    <Tooltip content={title}>
      <div
        className={`relative flex items-center group cursor-ew-resize ${className}`}
        onMouseDown={handleDragMouseDown}
        onDoubleClick={() => setIsEditing(true)}
      >
        {children}
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            min={min}
            max={max}
            step={step}
            className="w-full h-full bg-zinc-800 text-center font-mono text-zinc-300 rounded p-0.5 border border-indigo-500 outline-none pl-7 pr-2"
          />
        ) : (
          <span className="w-full text-center font-mono text-zinc-400 select-none group-hover:text-white py-0.5 pl-7 pr-2">
            {value.toFixed(precision)}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default DraggableInput;
