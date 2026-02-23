"use client";

import { useRef } from "react";
import GameEmbed, { GameEmbedHandle } from "./components/GameEmbed";
import MobileControls from "./components/MobileControls";

export default function Home() {
  const gameRef = useRef<GameEmbedHandle>(null);

  return (
    <main className="relative w-screen h-dvh bg-black">
      <GameEmbed ref={gameRef} />
      <MobileControls gameRef={gameRef} />
    </main>
  );
}
