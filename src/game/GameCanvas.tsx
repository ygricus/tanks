import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine';

interface GameCanvasProps {
  onScoreChange?: (score: number) => void;
  onLivesChange?: (lives: number) => void;
  onGameOver?: () => void;
  onEnemyCountChange?: (count: number) => void;
}

export default function GameCanvas({ onScoreChange, onLivesChange, onGameOver, onEnemyCountChange }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current);
    engine.setCallbacks({
      onScoreChange,
      onLivesChange,
      onGameOver,
      onEnemyCountChange,
    });
    engine.start();
    engineRef.current = engine;

    return () => {
      engine.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
