"use client";

import { useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";

export interface GameEmbedHandle {
  sendKey: (key: string, type: "keydown" | "keyup") => void;
}

const GameEmbed = forwardRef<GameEmbedHandle>(function GameEmbed(_, ref) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  const sendKey = useCallback((key: string, type: "keydown" | "keyup") => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const KEY_CODES: Record<string, number> = {
      Enter: 13, Backspace: 8,
      w: 87, a: 65, s: 83, d: 68,
      z: 90, x: 88, q: 81, e: 69,
    };

    const event = new KeyboardEvent(type, {
      key,
      code: key === "Enter" ? "Enter" : key === "Backspace" ? "Backspace" : `Key${key.toUpperCase()}`,
      keyCode: KEY_CODES[key] ?? key.charCodeAt(0),
      bubbles: true,
      cancelable: true,
    });

    iframe.contentWindow.document.dispatchEvent(event);

    // Also try dispatching on the canvas directly
    const canvas = iframe.contentWindow.document.querySelector("canvas");
    if (canvas) {
      canvas.dispatchEvent(event);
    }
  }, []);

  useImperativeHandle(ref, () => ({ sendKey }), [sendKey]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-white text-lg animate-pulse">Loading game...</div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/game/index.html"
        className="border-0 w-full h-full"
        allow="autoplay; gamepad; cross-origin-isolated"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
});

export default GameEmbed;
