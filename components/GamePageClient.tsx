
"use client";

import type { Player, GameState as GameStateType, Card } from '@/lib/types';
import { useState, useEffect } from 'react';
import { PlayerSetup } from './PlayerSetup';
import { GameBoard } from './GameBoard';
import { PlayerIdentitySelection } from './PlayerIdentitySelection';
import { SixesIcon } from './icons/SixesIcon';

const LOCAL_STORAGE_CURRENT_PLAYER_ID = 'sixes_currentPlayerId';

export function GamePageClient() {
  const [gameState, setGameState] = useState<GameStateType>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameId, setGameId] = useState(1); 
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const storedPlayerId = localStorage.getItem(LOCAL_STORAGE_CURRENT_PLAYER_ID);
    if (storedPlayerId) {
      setCurrentPlayerId(storedPlayerId);
    }
  }, []);

  const handleSetupComplete = (newPlayers: Player[]) => {
    setPlayers(newPlayers.map(p => ({ ...p, hand: [] }))); // Initialize with empty hands
    // If only one player or if currentPlayerId is already set and valid for new players, skip selection.
    if (newPlayers.length === 1) {
      const newPlayerId = newPlayers[0].id;
      setCurrentPlayerId(newPlayerId);
      localStorage.setItem(LOCAL_STORAGE_CURRENT_PLAYER_ID, newPlayerId);
      setGameState('playing');
      setGameId(prevId => prevId + 1);
    } else if (currentPlayerId && newPlayers.some(p => p.id === currentPlayerId)) {
      setGameState('playing');
      setGameId(prevId => prevId + 1);
    } else {
      // If currentPlayerId is not set or not valid for the new set of players, go to selection
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_PLAYER_ID); // Clear potentially stale ID
      setCurrentPlayerId(null);
      setGameState('player_selection');
    }
  };

  const handlePlayerSelected = (playerId: string) => {
    setCurrentPlayerId(playerId);
    localStorage.setItem(LOCAL_STORAGE_CURRENT_PLAYER_ID, playerId);
    setGameState('playing');
    setGameId(prevId => prevId + 1); 
  };

  const handleNewGame = () => {
    setGameState('setup');
    setPlayers([]);
    // currentPlayerId remains, will be validated or re-selected in handleSetupComplete
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log("Game State Change:", { gameState, players, gameId, currentPlayerId });
    }
  }, [gameState, players, gameId, currentPlayerId]);


  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-primary flex items-center justify-center">
          <SixesIcon className="h-12 w-12 md:h-16 md:w-16 mr-3 fill-current text-primary" />
          Sixes Scorecard
        </h1>
        <p className="text-muted-foreground text-lg mt-2 font-body">Track your Shishiyot game scores with ease!</p>
      </header>

      <main className="w-full max-w-3xl">
        {gameState === 'setup' && (
          <PlayerSetup onSetupComplete={handleSetupComplete} />
        )}
        {gameState === 'player_selection' && players.length > 0 && (
          <PlayerIdentitySelection players={players} onPlayerSelected={handlePlayerSelected} />
        )}
        {(gameState === 'playing' || gameState === 'final_round' || gameState === 'game_over') && players.length > 0 && currentPlayerId && (
          <GameBoard key={gameId} initialPlayers={players} onNewGame={handleNewGame} currentPlayerId={currentPlayerId} />
        )}
      </main>
      
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Sixes Scorecard. Enjoy the game!</p>
      </footer>
    </div>
  );
}
