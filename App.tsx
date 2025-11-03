import React, { useState, useCallback } from 'react';
import { GameState } from './types';
import GameScreen from './components/GameScreen';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import { useGameAudio } from './hooks/useGameAudio';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [gameOutcome, setGameOutcome] = useState<'win' | 'lose' | null>(null);
  const { initializeAudio, playSound, isMuted, toggleMute, playMusic, stopMusic } = useGameAudio();

  const handleStartGame = useCallback(() => {
    initializeAudio();
    stopMusic(); // Stop any previous music
    playMusic();
    setScore(0);
    setGameOutcome(null);
    setGameState('playing');
  }, [initializeAudio, playMusic, stopMusic]);

  const handleEndGame = useCallback((finalScore: number, reason: 'win' | 'lose') => {
    setScore(finalScore);
    setGameOutcome(reason);
    stopMusic();
    setGameState('gameOver');
  }, [stopMusic]);

  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  return (
    <div className="w-screen h-screen bg-gray-900 text-white overflow-hidden select-none">
      {gameState === 'start' && <StartScreen onStart={handleStartGame} />}
      {gameState === 'playing' && (
        <GameScreen
          onEndGame={handleEndGame}
          audio={{ playSound, isMuted, toggleMute, playMusic, stopMusic }}
        />
      )}
      {gameState === 'gameOver' && <EndScreen score={score} onRestart={handleRestart} outcome={gameOutcome!} />}
    </div>
  );
};

export default App;
