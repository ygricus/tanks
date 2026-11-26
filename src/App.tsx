import { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './game/GameCanvas';

type GameState = 'menu' | 'playing' | 'gameover';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [enemiesAlive, setEnemiesAlive] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('voxelTanksHighScore') || '0'); } catch { return 0; }
  });
  const gameKeyRef = useRef(0);

  const handleScoreChange = useCallback((s: number) => setScore(s), []);
  const handleLivesChange = useCallback((l: number) => setLives(l), []);
  const handleEnemyCountChange = useCallback((c: number) => setEnemiesAlive(c), []);
  
  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    setScore(prev => {
      if (prev > highScore) {
        setHighScore(prev);
        try { localStorage.setItem('voxelTanksHighScore', prev.toString()); } catch {}
      }
      return prev;
    });
  }, [highScore]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setEnemiesAlive(0);
    gameKeyRef.current += 1;
    setGameState('playing');
  };

  // Prevent scrolling on mobile
  useEffect(() => {
    const prevent = (e: TouchEvent) => {
      if (gameState === 'playing') e.preventDefault();
    };
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, [gameState]);

  return (
    <div className="w-screen h-screen bg-[#0a0a1a] overflow-hidden relative select-none">
      {/* Game Canvas */}
      {gameState === 'playing' && (
        <GameCanvas
          key={gameKeyRef.current}
          onScoreChange={handleScoreChange}
          onLivesChange={handleLivesChange}
          onGameOver={handleGameOver}
          onEnemyCountChange={handleEnemyCountChange}
        />
      )}

      {/* HUD */}
      {gameState === 'playing' && (
        <HUD score={score} lives={lives} enemiesAlive={enemiesAlive} />
      )}

      {/* Mobile Controls */}
      {gameState === 'playing' && <MobileControls />}

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <MenuScreen onStart={startGame} highScore={highScore} />
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <GameOverScreen score={score} highScore={highScore} onRestart={startGame} />
      )}
    </div>
  );
}

// ============ HUD ============
function HUD({ score, lives, enemiesAlive }: { score: number; lives: number; enemiesAlive: number }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
      <div className="flex items-start justify-between p-3 md:p-4">
        {/* Score */}
        <div className="glass-panel px-3 py-2 md:px-4 md:py-2">
          <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Очки</div>
          <div className="text-lg md:text-2xl font-bold text-green-400 font-mono">{score.toString().padStart(6, '0')}</div>
        </div>

        {/* Center - enemies */}
        <div className="glass-panel px-3 py-2 md:px-4 md:py-2">
          <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider text-center">Враги</div>
          <div className="flex gap-1 mt-1 justify-center">
            {Array.from({ length: Math.max(enemiesAlive, 0) }).map((_, i) => (
              <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-sm" />
            ))}
            {enemiesAlive === 0 && <span className="text-xs text-gray-500">—</span>}
          </div>
        </div>

        {/* Lives */}
        <div className="glass-panel px-3 py-2 md:px-4 md:py-2">
          <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Жизни</div>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: lives }).map((_, i) => (
              <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Mobile Controls ============
function MobileControls() {
  const [activeDir, setActiveDir] = useState<string | null>(null);
  const shootIntervalRef = useRef<number | null>(null);

  const simulateKey = (key: string, type: 'down' | 'up') => {
    const event = new KeyboardEvent(type === 'down' ? 'keydown' : 'keyup', { key });
    window.dispatchEvent(event);
  };

  const handleDirStart = (dir: string) => {
    setActiveDir(dir);
    const keyMap: Record<string, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
    simulateKey(keyMap[dir], 'down');
  };

  const handleDirEnd = () => {
    if (activeDir) {
      const keyMap: Record<string, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
      simulateKey(keyMap[activeDir], 'up');
    }
    setActiveDir(null);
  };

  const handleShootStart = () => {
    simulateKey(' ', 'down');
    shootIntervalRef.current = window.setInterval(() => {
      simulateKey(' ', 'down');
    }, 300);
  };

  const handleShootEnd = () => {
    simulateKey(' ', 'up');
    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      shootIntervalRef.current = null;
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 md:hidden">
      <div className="flex items-end justify-between p-4 pb-8">
        {/* D-Pad */}
        <div className="relative w-36 h-36">
          {/* Up */}
          <button
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${activeDir === 'up' ? 'bg-green-500/40 scale-95' : 'bg-white/10'}`}
            onTouchStart={(e) => { e.preventDefault(); handleDirStart('up'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDirEnd(); }}
            onMouseDown={() => handleDirStart('up')}
            onMouseUp={handleDirEnd}
            onMouseLeave={handleDirEnd}
          >▲</button>
          {/* Down */}
          <button
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${activeDir === 'down' ? 'bg-green-500/40 scale-95' : 'bg-white/10'}`}
            onTouchStart={(e) => { e.preventDefault(); handleDirStart('down'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDirEnd(); }}
            onMouseDown={() => handleDirStart('down')}
            onMouseUp={handleDirEnd}
            onMouseLeave={handleDirEnd}
          >▼</button>
          {/* Left */}
          <button
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${activeDir === 'left' ? 'bg-green-500/40 scale-95' : 'bg-white/10'}`}
            onTouchStart={(e) => { e.preventDefault(); handleDirStart('left'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDirEnd(); }}
            onMouseDown={() => handleDirStart('left')}
            onMouseUp={handleDirEnd}
            onMouseLeave={handleDirEnd}
          >◀</button>
          {/* Right */}
          <button
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${activeDir === 'right' ? 'bg-green-500/40 scale-95' : 'bg-white/10'}`}
            onTouchStart={(e) => { e.preventDefault(); handleDirStart('right'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDirEnd(); }}
            onMouseDown={() => handleDirStart('right')}
            onMouseUp={handleDirEnd}
            onMouseLeave={handleDirEnd}
          >▶</button>
          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5" />
        </div>

        {/* Fire button */}
        <button
          className="w-20 h-20 rounded-full bg-red-500/30 border-2 border-red-500/50 flex items-center justify-center text-red-400 font-bold text-sm active:bg-red-500/50 active:scale-95 transition-all"
          onTouchStart={(e) => { e.preventDefault(); handleShootStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); handleShootEnd(); }}
          onMouseDown={handleShootStart}
          onMouseUp={handleShootEnd}
          onMouseLeave={handleShootEnd}
        >
          FIRE
        </button>
      </div>
    </div>
  );
}

// ============ Menu Screen ============
function MenuScreen({ onStart, highScore }: { onStart: () => void; highScore: number }) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a0a1a]">
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-transparent to-cyan-900/10" />
      
      {/* Floating voxel cubes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${5 + (i * 13) % 80}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i % 3}s`,
            }}
          >
            <div
              className="rounded-sm"
              style={{
                width: 12 + (i % 3) * 8,
                height: 12 + (i % 3) * 8,
                background: ['#4ade80', '#22d3ee', '#fb923c', '#a78bfa', '#fbbf24'][i % 5],
                opacity: 0.2,
              }}
            />
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Logo */}
        <div className="mb-2">
          <div className="flex justify-center gap-1 mb-4">
            {['#4ade80', '#4ade80', '#fb923c', '#4ade80', '#4ade80'].map((c, i) => (
              <div
                key={i}
                className="rounded-sm animate-float"
                style={{
                  width: 16,
                  height: 16,
                  background: c,
                  animationDelay: `${i * 0.2}s`,
                  boxShadow: `0 0 10px ${c}40`,
                }}
              />
            ))}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-2 tracking-tight">
          <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">VOXEL</span>
        </h1>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white">
          TANKS
        </h1>

        <p className="text-gray-400 mb-2 text-sm md:text-base">
          Воксельные танчики для Smart TV
        </p>
        <p className="text-gray-500 text-xs mb-8">
          Прототип • Three.js • Изометрический вид
        </p>

        {highScore > 0 && (
          <div className="mb-6 text-yellow-400 text-sm">
            🏆 Рекорд: {highScore.toString().padStart(6, '0')}
          </div>
        )}

        <button
          onClick={onStart}
          className="px-10 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold text-lg rounded-xl hover:scale-105 transition-transform animate-pulse-glow mb-4"
        >
          ▶ ИГРАТЬ
        </button>

        <div className="mt-4">
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-gray-400 text-sm hover:text-green-400 transition-colors"
          >
            {showControls ? '▲ Скрыть управление' : '▼ Как управлять?'}
          </button>
        </div>

        {showControls && (
          <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">W A S D</kbd>
                <span className="text-gray-400">Движение</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">↑ ← ↓ →</kbd>
                <span className="text-gray-400">Движение</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Space</kbd>
                <span className="text-gray-400">Стрельба</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Enter</kbd>
                <span className="text-gray-400">Стрельба</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              📱 На мобильных — экранные кнопки
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-6 text-xs text-gray-600">
          <span>🧊 Воксельная графика</span>
          <span>💥 Разрушаемость</span>
          <span>📺 Smart TV</span>
        </div>
      </div>
    </div>
  );
}

// ============ Game Over Screen ============
function GameOverScreen({ score, highScore, onRestart }: { score: number; highScore: number; onRestart: () => void }) {
  const isNewRecord = score >= highScore && score > 0;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center px-6 animate-slide-up">
        <div className="text-6xl mb-4">💥</div>
        <h2 className="text-4xl md:text-5xl font-black text-red-400 mb-2">GAME OVER</h2>
        
        {isNewRecord && (
          <div className="text-yellow-400 text-lg mb-4 animate-pulse">
            🏆 Новый рекорд!
          </div>
        )}

        <div className="glass-panel inline-block px-8 py-4 rounded-xl mb-6">
          <div className="text-sm text-gray-400 mb-1">Ваш счёт</div>
          <div className="text-4xl font-bold text-green-400 font-mono">
            {score.toString().padStart(6, '0')}
          </div>
          {highScore > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              Лучший: {highScore.toString().padStart(6, '0')}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold rounded-xl hover:scale-105 transition-transform mr-3"
          >
            🔄 Ещё раз
          </button>
        </div>
      </div>
    </div>
  );
}
