"use client";

import { useCallback } from "react";

interface ActionButtonsProps {
  onButtonDown: (key: string) => void;
  onButtonUp: (key: string) => void;
}

export default function ActionButtons({ onButtonDown, onButtonUp }: ActionButtonsProps) {
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
    "flex items-center justify-center rounded-full select-none touch-none font-bold";

  return (
    <div className="flex flex-col items-center gap-2">
      {/* A and B buttons */}
      <div className="flex items-center gap-3">
        <button
          className={`${btnBase} w-14 h-14 bg-red-700 active:bg-red-600 text-white text-xl`}
          onTouchStart={handleTouch("x")}
          onTouchEnd={handleTouchEnd("x")}
          onMouseDown={() => onButtonDown("x")}
          onMouseUp={() => onButtonUp("x")}
        >
          B
        </button>
        <button
          className={`${btnBase} w-14 h-14 bg-green-700 active:bg-green-600 text-white text-xl -mt-6`}
          onTouchStart={handleTouch("z")}
          onTouchEnd={handleTouchEnd("z")}
          onMouseDown={() => onButtonDown("z")}
          onMouseUp={() => onButtonUp("z")}
        >
          A
        </button>
      </div>
    </div>
  );
}
