"use client";

import { useCallback } from "react";

interface DPadProps {
  onButtonDown: (key: string) => void;
  onButtonUp: (key: string) => void;
}

export default function DPad({ onButtonDown, onButtonUp }: DPadProps) {
  const handleTouch = useCallback(
    (key: string) => (e: React.TouchEvent) => {
      e.preventDefault();
      onButtonDown(key);
    },
    [onButtonDown]
  );

  const handleTouchEnd = useCallback(
    (key: string) => (e: React.TouchEvent) => {
      e.preventDefault();
      onButtonUp(key);
    },
    [onButtonUp]
  );

  const btnBase =
    "absolute flex items-center justify-center bg-gray-700 active:bg-gray-600 select-none touch-none";

  return (
    <div className="relative w-28 h-28">
      {/* Up */}
      <button
        className={`${btnBase} top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-t-lg`}
        onTouchStart={handleTouch("w")}
        onTouchEnd={handleTouchEnd("w")}
        onMouseDown={() => onButtonDown("w")}
        onMouseUp={() => onButtonUp("w")}
      >
        <span className="text-white text-lg">&#9650;</span>
      </button>
      {/* Down */}
      <button
        className={`${btnBase} bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-b-lg`}
        onTouchStart={handleTouch("s")}
        onTouchEnd={handleTouchEnd("s")}
        onMouseDown={() => onButtonDown("s")}
        onMouseUp={() => onButtonUp("s")}
      >
        <span className="text-white text-lg">&#9660;</span>
      </button>
      {/* Left */}
      <button
        className={`${btnBase} top-1/2 left-0 -translate-y-1/2 w-10 h-10 rounded-l-lg`}
        onTouchStart={handleTouch("a")}
        onTouchEnd={handleTouchEnd("a")}
        onMouseDown={() => onButtonDown("a")}
        onMouseUp={() => onButtonUp("a")}
      >
        <span className="text-white text-lg">&#9664;</span>
      </button>
      {/* Right */}
      <button
        className={`${btnBase} top-1/2 right-0 -translate-y-1/2 w-10 h-10 rounded-r-lg`}
        onTouchStart={handleTouch("d")}
        onTouchEnd={handleTouchEnd("d")}
        onMouseDown={() => onButtonDown("d")}
        onMouseUp={() => onButtonUp("d")}
      >
        <span className="text-white text-lg">&#9654;</span>
      </button>
      {/* Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-800 rounded-sm" />
    </div>
  );
}
