"use client";

import type { Player, Card as CardType, Suit, Rank, Room } from '@/lib/types';
import type { GameState } from '@/lib/types';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Scoreboard } from './Scoreboard';
import { RoundScoreForm } from './RoundScoreForm';
import { StopAdvisorDialog } from './StopAdvisorDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { calculateNewTotalScore, applyStopBonusesAndPenalties } from '@/lib/game-logic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hand, Brain, RotateCcw, PartyPopper, Users, CheckSquare, Layers, Shuffle, HelpCircle } from 'lucide-react';

interface PlayerHandDisplayProps {
  players: Player[];
  currentPlayerId: string | null;
  bottomRowPeeked: boolean;
  gameState: GameState;
  onDonePeek: () => void;
  onReplaceCard: (row: 'top' | 'bottom', idx: number, pile: 'deck' | 'discard') => void;
  drawnPile?: 'deck' | 'discard' | null;
  adminId?: string;
  onKickPlayer: (playerId: string) => void;
  onMakeAdmin: (playerId: string) => void;
}

function PlayerHandsDisplay({ players, currentPlayerId, bottomRowPeeked, gameState, onDonePeek, onReplaceCard, drawnPile, adminId, onKickPlayer, onMakeAdmin }: PlayerHandDisplayProps) {
  const peekPhase = gameState === 'peeking';
  const gameOver = gameState === 'game_over';
  const isCurrentPlayerAdmin = adminId === currentPlayerId;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Shuffle className="mr-2 h-7 w-7 text-primary" />
          Player Hands
        </CardTitle>
        <CardDescription>Each player has 6 cards in two rows. Your bottom row is shown face up at the start. Others are face down.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map(player => {
            const isCurrentPlayer = player.id === currentPlayerId;
            const isPlayerAdmin = player.id === adminId;
            // Show bottom row face up only for the current player during their peek, and only if they haven't clicked Done
            const showBottomRow = peekPhase && isCurrentPlayer && !bottomRowPeeked;
            console.log("showBottomRow", showBottomRow, peekPhase, isCurrentPlayer, bottomRowPeeked);
            // Enable clicking for replacement if it's the current player's turn and they've drawn a card
            const canClickForReplacement = isCurrentPlayer && !peekPhase && drawnPile !== null;
            
            return (
              <div key={player.id} className="p-4 border rounded-lg bg-card/50 relative">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-primary">
                    {player.name}'s Hand {isCurrentPlayer ? "(Your Hand)" : ""}
                    {isPlayerAdmin && (
                      <span className="ml-2 text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full">Admin</span>
                    )}
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${player.isActive ? 'bg-green-500 text-green-900' : 'bg-red-500 text-red-900'}`}>
                      {player.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {peekPhase && (
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${player.hasPeeked ? 'bg-green-500 text-green-900' : 'bg-yellow-500 text-yellow-900'}`}>
                        {player.hasPeeked ? 'Peeked' : 'Waiting'}
                      </span>
                    )}
                  </h3>
                  {isCurrentPlayerAdmin && !isCurrentPlayer && onKickPlayer && (
                    <Button 
                      onClick={() => onKickPlayer(player.id)} 
                      variant="destructive" 
                      size="sm"
                      className="text-xs"
                    >
                      Kick
                    </Button>
                  )}
                  {isCurrentPlayerAdmin && !isCurrentPlayer && !isPlayerAdmin && player.isActive && (
                    <Button 
                      onClick={() => onMakeAdmin(player.id)} 
                      variant="outline" 
                      size="sm"
                      className="text-xs ml-2"
                    >
                      Make Admin
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {/* Top row */}
                  <div className="flex gap-2 justify-center">
                    {(player.hand.top || []).map((card, idx) => {
                      return (
                        <div 
                          key={idx}
                          className={`cursor-pointer transition-transform hover:scale-105 ${canClickForReplacement ? 'hover:ring-2 hover:ring-primary' : ''}`}
                          onClick={canClickForReplacement ? () => onReplaceCard?.('top', idx, drawnPile!) : undefined}
                        >
                          {gameOver ? (
                            <Image
                              src={getCardImageSrc(card)}
                              alt={card.rank + " of " + card.suit}
                              width={70}
                              height={100}
                              className="rounded shadow-md"
                              data-ai-hint={card.rank + " " + card.suit}
                            />
                          ) : (
                            <Image
                              src={"/assets/playing-card-back.png"}
                              alt="Face-down card"
                              width={70}
                              height={100}
                              className="rounded shadow-md"
                              data-ai-hint="card back"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Bottom row */}
                  <div className="flex gap-2 justify-center">
                    {(player.hand.bottom || []).map((card, idx) => {
                      const canClickBottomForReplacement = canClickForReplacement && player.canReplaceBottom;
                      
                      return (
                        <div 
                          key={idx}
                          className={`cursor-pointer transition-transform hover:scale-105 ${canClickBottomForReplacement ? 'hover:ring-2 hover:ring-primary' : ''}`}
                          onClick={canClickBottomForReplacement ? () => onReplaceCard?.('bottom', idx, drawnPile!) : undefined}
                        >
                          {showBottomRow || gameOver ? (
                            <Image
                              src={getCardImageSrc(card)}
                              alt={card.rank + " of " + card.suit}
                              width={70}
                              height={100}
                              className="rounded shadow-md"
                              data-ai-hint={card.rank + " " + card.suit}
                            />
                          ) : (
                            <Image
                              src={"/assets/playing-card-back.png"}
                              alt="Face-down card"
                              width={70}
                              height={100}
                              className="rounded shadow-md"
                              data-ai-hint="card back"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Show Done button for local player during peek phase, only if it's their turn */}
                  {showBottomRow && isCurrentPlayer && (
                    <div className="flex justify-center mt-2">
                      <Button onClick={onDonePeek} variant="outline">Done</Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface GameBoardProps {
  playerId: string;
  room: Room;
  onPeekDone: () => void;
  onReplaceCard: (row: 'top' | 'bottom', idx: number, pile: 'deck' | 'discard') => void;
  onDiscardCard: () => void;
  onCallStop: () => void;
  onNewGame: () => void;
  onKickPlayer: (playerId: string) => void;
  onStartGame: () => void;
  onMakeAdmin: (playerId: string) => void;
}

// Helper to get the correct image path for each card
function getCardImageSrc(card: CardType) {
  return `/assets/${card.rank}_of_${card.suit}.png`;
}

// Type guard for gameStatus
function isGameOver(phase: GameState) {
  return phase === 'game_over';
}

export function GameBoard({ playerId, room, onPeekDone, onReplaceCard, onDiscardCard, onCallStop, onNewGame, onKickPlayer, onStartGame, onMakeAdmin }: GameBoardProps) {
  const currentRound = Math.max(0, ...room.players.map((p: Player) => p.scoresByRound.length));
  // All state comes from props; no local state needed for multiplayer
  const { toast } = useToast();
  const [drawnPile, setDrawnPile] = useState<'deck' | 'discard' | null>(null);

  // Main gameplay logic
  const player = room.players.find((p: Player) => p.id === playerId);
  console.log("player", player);
  const isMyTurn = playerId === room.currentTurnPlayerId;
  const isCurrentPlayerAdmin = room.adminId === playerId;
  const peekPhase = room.gameState === 'peeking';
  const currentPlayer = room.players.find((p: Player) => p.id === room.currentTurnPlayerId);

  const handlePeekDone = () => {;
    onPeekDone();
  };

  const handleDrawFromDeck = () => {
    setDrawnPile('deck');
  };

  const handleDrawFromDiscard = () => {
    setDrawnPile('discard');
  };

  const handleReplaceCard = (row: 'top' | 'bottom', idx: number, pile: 'deck' | 'discard') => {
    setDrawnPile(null);
    
    onReplaceCard(row, idx, pile);
  };

  const handleDiscardCard = () => {
    setDrawnPile(null);
    
    onDiscardCard();
  };

  return (
    <div className="space-y-8">
      {isCurrentPlayerAdmin && room.gameState === 'waiting_for_players' && room.players.length > 1 && (
        <div className="text-center p-4 bg-green-100 border border-green-200 rounded-lg">
          <p className="text-green-800 mb-2">There are enough players to start the game.</p>
          <Button onClick={onStartGame} size="lg">Start Game</Button>
        </div>
      )}

      {/* Show turn indicator */}
      <div className="text-center mb-4">
        {room.gameState === 'waiting_for_players' ? (
          <span className="text-lg font-semibold text-gray-500">Waiting for players... (Need at least 2)</span>
        ) : peekPhase ? (
          <div className="space-y-2">
            <span className="text-lg font-semibold text-primary">Peeking Phase</span>
            <div className="flex flex-wrap justify-center gap-4">
              {room.players.map(player => (
                <div key={player.id} className="flex items-center gap-2">
                  <span className="text-sm font-medium">{player.name}:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${player.hasPeeked ? 'bg-green-500 text-green-900' : 'bg-yellow-500 text-yellow-900'}`}>
                    {player.hasPeeked ? 'Peeked' : 'Waiting'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-lg font-semibold text-primary">Current turn: {currentPlayer?.name}</span>
        )}
      </div>
      {/* Show hands with peek logic only during peek phase */}
      <PlayerHandsDisplay players={room.players} currentPlayerId={playerId} bottomRowPeeked={player ? player.hasPeeked : true} gameState={room.gameState} onDonePeek={handlePeekDone} onReplaceCard={handleReplaceCard} drawnPile={drawnPile} adminId={room.adminId} onKickPlayer={onKickPlayer} onMakeAdmin={onMakeAdmin} />
      {/* Draw/replace/discard UI for current player after peek phase */}
      {!peekPhase && isMyTurn && !isGameOver(room.gameState) && (
        <div className="flex flex-col items-center gap-4">
          {!drawnPile && (
            <div className="flex gap-4">
              <Button onClick={handleDrawFromDeck} disabled={room.deck.length === 0}>Draw from Deck</Button>
              <Button onClick={handleDrawFromDiscard} disabled={room.discard.length === 0}>Draw from Discard</Button>
            </div>
          )}
          {/* Show drawn card and allow replace/discard only after drawing */}
          {drawnPile && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="mb-2 font-semibold">You drew:</span>
                <Image src={getCardImageSrc(drawnPile === 'deck' ? room.deck[0] : room.discard[0])} alt={drawnPile === 'deck' ? room.deck[0].rank + " of " + room.deck[0].suit : room.discard[0].rank + " of " + room.discard[0].suit} width={70} height={100} className="rounded shadow-md" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-center">Click on a card in your hand to replace it, or discard the drawn card:</span>
                <Button onClick={handleDiscardCard} variant="outline" disabled={drawnPile === 'discard'}>Discard Drawn Card</Button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Show discard pile card */}
      {!peekPhase && room.discard.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Layers className="mr-2 h-6 w-6 text-primary" />
              Discard Pile
            </CardTitle>
            <CardDescription>Top card available for drawing</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Image 
              src={getCardImageSrc(room.discard[0])} 
              alt={room.discard[0].rank + " of " + room.discard[0].suit} 
              width={70} 
              height={100} 
              className="rounded shadow-md" 
            />
          </CardContent>
        </Card>
      )}
      {/* Waiting message for non-active players after peek phase */}
      {!peekPhase && !isMyTurn && !isGameOver(room.gameState) && (
        <div className="text-center text-lg text-muted-foreground font-semibold mt-8">
          Waiting for your turn...
        </div>
      )}
      {/* STOP button for current player */}
      {isMyTurn && room.gameState === 'playing' && drawnPile === null && (
        <div className="flex justify-center mt-4">
          <Button onClick={onCallStop} variant="destructive">Call STOP</Button>
        </div>
      )}
      {/* Scoreboard and round info */}
      <Scoreboard players={room.players} currentRound={currentRound} stopperId={room.stopperId ? room.stopperId : null} />
      {room.players.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Layers className="mr-2 h-7 w-7 text-primary" />
              Deck & Discard Status
            </CardTitle>
            <CardDescription>Track the cards in play. This information is used by the AI Advisor. Deck count is automatically updated after dealing from a 52-card deck.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="cardsRemainingInDeck" className="font-medium">Cards Remaining in Deck</Label>
              <Input
                id="cardsRemainingInDeck"
                type="number"
                value={room.deck.length} 
                readOnly 
                className="text-base h-12 bg-muted/50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cardsInDiscardPile" className="font-medium">Cards in Discard Pile</Label>
              <Input
                id="cardsInDiscardPile"
                type="number"
                value={room.discard.length}
                readOnly
                className="text-base h-12"
              />
            </div>
          </CardContent>
        </Card>
      )}
      {/* Game over UI */}
      {isGameOver(room.gameState) && (
        <div className="space-y-6">
          <Scoreboard players={room.players} currentRound={currentRound} stopperId={room.stopperId ? room.stopperId : null} />
          <Card className="text-center shadow-xl bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-4xl flex items-center justify-center">
                <PartyPopper className="mr-3 h-10 w-10" /> Game Over!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-semibold">
                {(() => {
                  const winner = room.players.reduce((prev: Player, curr: Player) => (curr.totalScore < prev.totalScore ? curr : prev), room.players[0]);
                  return winner ? `${winner.name} is the winner with ${winner.scoresByRound[winner.scoresByRound.length - 1]} points!` : 'Scores are final!';
                })()}
              </p>
              {isCurrentPlayerAdmin && (
                <Button onClick={onNewGame} size="lg" variant="secondary" className="text-lg">
                  <RotateCcw className="mr-2 h-5 w-5" /> Start New Game
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {isCurrentPlayerAdmin && (
        <Button onClick={onNewGame} variant="outline" className="mt-8">
          <RotateCcw className="mr-2 h-5 w-5" /> Start New Game
        </Button>
      )}
    </div>
  );
}
