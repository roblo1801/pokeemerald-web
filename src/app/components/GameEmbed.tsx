"use client";

import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";

export interface GameEmbedHandle {
  sendKey: (key: string, type: "keydown" | "keyup") => void;
}

interface LoadProgress {
  phase: "downloading" | "starting" | "ready";
  bytesLoaded: number;
  bytesTotal: number;
  currentFile: string;
}

const GAME_FILES = [
  { url: "/game/index.wasm", label: "Engine" },
  { url: "/game/index.pck", label: "Game Data" },
  { url: "/game/index.js", label: "Loader" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const GameEmbed = forwardRef<GameEmbedHandle>(function GameEmbed(_, ref) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [progress, setProgress] = useState<LoadProgress>({
    phase: "downloading",
    bytesLoaded: 0,
    bytesTotal: 0,
    currentFile: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function preloadFiles() {
      let totalLoaded = 0;
      let totalSize = 0;

      // First, do HEAD requests to get total size
      const sizes = await Promise.all(
        GAME_FILES.map(async (f) => {
          try {
            const res = await fetch(f.url, { method: "HEAD" });
            return parseInt(res.headers.get("content-length") || "0", 10);
          } catch {
            return 0;
          }
        })
      );
      totalSize = sizes.reduce((a, b) => a + b, 0);

      if (cancelled) return;
      setProgress((p) => ({ ...p, bytesTotal: totalSize }));

      // Download each file sequentially to show per-file progress
      for (const file of GAME_FILES) {
        if (cancelled) return;
        setProgress((p) => ({ ...p, currentFile: file.label }));

        try {
          const res = await fetch(file.url);
          const reader = res.body?.getReader();
          if (!reader) continue;

          while (true) {
            const { done, value } = await reader.read();
            if (done || cancelled) break;
            totalLoaded += value.byteLength;
            setProgress((p) => ({ ...p, bytesLoaded: totalLoaded }));
          }
        } catch {
          // File might not exist yet — skip
        }
      }

      if (cancelled) return;
      setProgress({ phase: "starting", bytesLoaded: totalSize, bytesTotal: totalSize, currentFile: "" });
    }

    preloadFiles();
    return () => { cancelled = true; };
  }, []);

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

    const canvas = iframe.contentWindow.document.querySelector("canvas");
    if (canvas) {
      canvas.dispatchEvent(event);
    }
  }, []);

  useImperativeHandle(ref, () => ({ sendKey }), [sendKey]);

  const percent = progress.bytesTotal > 0
    ? Math.min(100, Math.round((progress.bytesLoaded / progress.bytesTotal) * 100))
    : 0;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {progress.phase !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-4 px-8">
          <div className="text-white text-xl font-bold">Pokemon Emerald</div>

          {progress.phase === "downloading" && (
            <>
              {/* Progress bar */}
              <div className="w-full max-w-xs h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-200"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Stats */}
              <div className="text-gray-400 text-sm text-center">
                {progress.currentFile && (
                  <div>Loading {progress.currentFile}...</div>
                )}
                <div>
                  {formatBytes(progress.bytesLoaded)}
                  {progress.bytesTotal > 0 && ` / ${formatBytes(progress.bytesTotal)}`}
                  {" "}&mdash; {percent}%
                </div>
              </div>
            </>
          )}

          {progress.phase === "starting" && (
            <div className="text-gray-400 text-sm animate-pulse">Starting game engine...</div>
          )}
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={progress.phase !== "downloading" ? "/game/index.html" : undefined}
        className="border-0 w-full h-full"
        allow="autoplay; gamepad; cross-origin-isolated"
        onLoad={() => {
          if (progress.phase !== "downloading") {
            setProgress((p) => ({ ...p, phase: "ready" }));
          }
        }}
      />
    </div>
  );
});

export default GameEmbed;
