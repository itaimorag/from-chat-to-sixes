"use client";

import type { Player, GameState as GameStateType, Card } from "@/lib/types";
import { useState, useEffect } from "react";
import { PlayerSetup } from "./PlayerSetup";
import { GameBoard } from "./GameBoard";
import { PlayerIdentitySelection } from "./PlayerIdentitySelection";
import { SixesIcon } from "./icons/SixesIcon";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Gamepad2, Trophy, Settings } from "lucide-react";

const LOCAL_STORAGE_CURRENT_PLAYER_ID = "sixes_currentPlayerId";

export function GamePageClient() {
  const [gameState, setGameState] = useState<GameStateType>("playing");
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameId, setGameId] = useState(1);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const storedPlayerId = localStorage.getItem(
      LOCAL_STORAGE_CURRENT_PLAYER_ID
    );
    if (storedPlayerId) {
      setCurrentPlayerId(storedPlayerId);
    }
  }, []);

  const handleSetupComplete = (newPlayers: Player[]) => {
    setPlayers(newPlayers.map((p) => ({ ...p, hand: [] }))); // Initialize with empty hands
    // If only one player or if currentPlayerId is already set and valid for new players, skip selection.
    if (newPlayers.length === 1) {
      const newPlayerId = newPlayers[0].id;
      setCurrentPlayerId(newPlayerId);
      localStorage.setItem(LOCAL_STORAGE_CURRENT_PLAYER_ID, newPlayerId);
      setGameState("playing");
      setGameId((prevId) => prevId + 1);
    } else if (
      currentPlayerId &&
      newPlayers.some((p) => p.id === currentPlayerId)
    ) {
      setGameState("playing");
      setGameId((prevId) => prevId + 1);
    } else {
      // If currentPlayerId is not set or not valid for the new set of players, go to selection
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_PLAYER_ID); // Clear potentially stale ID
      setCurrentPlayerId(null);
      setGameState("player_selection");
    }
  };

  const handlePlayerSelected = (playerId: string) => {
    setCurrentPlayerId(playerId);
    localStorage.setItem(LOCAL_STORAGE_CURRENT_PLAYER_ID, playerId);
    setGameState("playing");
    setGameId((prevId) => prevId + 1);
  };

  const handleNewGame = () => {
    setGameState("setup");
    setPlayers([]);
    // currentPlayerId remains, will be validated or re-selected in handleSetupComplete
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("Game State Change:", {
        gameState,
        players,
        gameId,
        currentPlayerId,
      });
    }
  }, [gameState, players, gameId, currentPlayerId]);

  const getGameStateBadge = () => {
    switch (gameState) {
      case "setup":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Settings className="h-3 w-3" /> Setup
          </Badge>
        );
      case "player_selection":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" /> Player Selection
          </Badge>
        );
      case "playing":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Gamepad2 className="h-3 w-3" /> Playing
          </Badge>
        );
      case "final_round":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            Final Round
          </Badge>
        );
      case "game_over":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" /> Game Over
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
        {/* Header with enhanced styling */}
        <header className="mb-8 text-center w-full">
          <div className="flex items-center justify-center mb-4">
            {getGameStateBadge()}
          </div>
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent flex items-center justify-center mb-4">
              <SixesIcon className="h-16 w-16 md:h-20 md:w-20 mr-4 fill-current text-primary animate-pulse" />
              Sixes
            </h1>
            <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4">
              <div className="w-4 h-4 md:w-6 md:h-6 bg-primary rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
          <p className="text-muted-foreground text-lg md:text-xl mt-2 font-body max-w-2xl mx-auto">
            Track your Shishiyot game scores with ease! The ultimate card game
            companion.
          </p>

          {/* Game info display */}
          {players.length > 0 && (
            <UICard className="mt-6 max-w-md mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-semibold text-primary">
                    {players.length}
                  </span>
                </div>
                {currentPlayerId && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">You are:</span>
                    <span className="font-semibold text-primary">
                      {players.find((p) => p.id === currentPlayerId)?.name}
                    </span>
                  </div>
                )}
              </CardContent>
            </UICard>
          )}
        </header>

        {/* Main content with enhanced animations */}
        <main className="w-full max-w-4xl">
          <div className="transition-all duration-500 ease-in-out">
            {gameState === "setup" && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <PlayerSetup onSetupComplete={handleSetupComplete} />
              </div>
            )}
            {gameState === "player_selection" && players.length > 0 && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <PlayerIdentitySelection
                  players={players}
                  onPlayerSelected={handlePlayerSelected}
                />
              </div>
            )}
            {(gameState === "playing" ||
              gameState === "final_round" ||
              gameState === "game_over") &&
              players.length > 0 &&
              currentPlayerId && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <GameBoard
                    key={gameId}
                    initialPlayers={players}
                    onNewGame={handleNewGame}
                    currentPlayerId={currentPlayerId}
                  />
                </div>
              )}
          </div>
        </main>

        {/* Enhanced footer */}
        <footer className="mt-12 text-center text-muted-foreground text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
          <p>
            &copy; {new Date().getFullYear()} Sixes Scorecard. Enjoy the game!
          </p>
        </footer>
      </div>
    </div>
  );
}
