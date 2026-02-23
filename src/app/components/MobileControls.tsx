"use client";

import { useCallback, useEffect, useState } from "react";
import DPad from "./DPad";
import ActionButtons from "./ActionButtons";
import { GameEmbedHandle } from "./GameEmbed";

interface MobileControlsProps {
  gameRef: React.RefObject<GameEmbedHandle | null>;
}

export default function MobileControls({ gameRef }: MobileControlsProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const onButtonDown = useCallback(
    (key: string) => {
      gameRef.current?.sendKey(key, "keydown");
    },
    [gameRef]
  );

  const onButtonUp = useCallback(
    (key: string) => {
      gameRef.current?.sendKey(key, "keyup");
    },
    [gameRef]
  );

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

  if (!isTouchDevice) return null;

  const shoulderBtn =
    "px-6 py-3 bg-gray-700 active:bg-gray-600 text-white font-bold rounded-lg select-none touch-none text-sm";
  const menuBtn =
    "px-4 py-2 bg-gray-600 active:bg-gray-500 text-white rounded-full select-none touch-none text-xs";

  return (
    <>
      {/* L/R shoulder buttons — top bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between p-2 z-20">
        <button
          className={shoulderBtn}
          onTouchStart={handleTouch("q")}
          onTouchEnd={handleTouchEnd("q")}
          onMouseDown={() => onButtonDown("q")}
          onMouseUp={() => onButtonUp("q")}
        >
          L
        </button>
        <button
          className={shoulderBtn}
          onTouchStart={handleTouch("e")}
          onTouchEnd={handleTouchEnd("e")}
          onMouseDown={() => onButtonDown("e")}
          onMouseUp={() => onButtonUp("e")}
        >
          R
        </button>
      </div>

      {/* D-pad — left side */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
        <DPad onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
      </div>

      {/* A/B — right side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
        <ActionButtons onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
      </div>

      {/* Start/Select — bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6 p-3 z-20">
        <button
          className={menuBtn}
          onTouchStart={handleTouch("Backspace")}
          onTouchEnd={handleTouchEnd("Backspace")}
          onMouseDown={() => onButtonDown("Backspace")}
          onMouseUp={() => onButtonUp("Backspace")}
        >
          SELECT
        </button>
        <button
          className={menuBtn}
          onTouchStart={handleTouch("Enter")}
          onTouchEnd={handleTouchEnd("Enter")}
          onMouseDown={() => onButtonDown("Enter")}
          onMouseUp={() => onButtonUp("Enter")}
        >
          START
        </button>
      </div>
    </>
  );
}
