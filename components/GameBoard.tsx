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
  peekPhase: boolean;
  onDonePeek: () => void;
}

function PlayerHandsDisplay({ players, currentPlayerId, bottomRowPeeked, peekPhase, onDonePeek }: PlayerHandDisplayProps) {
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
            // Show bottom row face up only for the current player during their peek, and only if they haven't clicked Done
            const showBottomRow = peekPhase && isCurrentPlayer && !bottomRowPeeked;
            // After peek phase, only show the local player's hand face up
            const showHandFaceUp = !peekPhase && isCurrentPlayer;
            return (
              <div key={player.id} className="p-4 border rounded-lg bg-card/50">
                <h3 className="text-lg font-semibold text-primary mb-2">{player.name}'s Hand {isCurrentPlayer ? "(Your Hand)" : ""}</h3>
                <div className="flex flex-col gap-2">
                  {/* Top row */}
                  <div className="flex gap-2 justify-center">
                    {(player.hand.top || []).map((card) => {
                      if (showHandFaceUp) {
                        return (
                          <Image
                            src={getCardImageSrc(card)}
                            alt={card.rank + " of " + card.suit}
                            width={70}
                            height={100}
                            className="rounded shadow-md"
                            data-ai-hint={card.rank + " " + card.suit}
                          />
                        );
                      } else {
                        return (
                          <Image
                            src={"/assets/playing-card-back.png"}
                            alt="Face-down card"
                            width={70}
                            height={100}
                            className="rounded shadow-md"
                            data-ai-hint="card back"
                          />
                        );
                      }
                    })}
                  </div>
                  {/* Bottom row */}
                  <div className="flex gap-2 justify-center">
                    {(player.hand.bottom || []).map((card) => {
                      if (showBottomRow || showHandFaceUp) {
                        return (
                          <Image
                            src={getCardImageSrc(card)}
                            alt={card.rank + " of " + card.suit}
                            width={70}
                            height={100}
                            className="rounded shadow-md"
                            data-ai-hint={card.rank + " " + card.suit}
                          />
                        );
                      } else {
                        return (
                          <Image
                            src={"/assets/playing-card-back.png"}
                            alt="Face-down card"
                            width={70}
                            height={100}
                            className="rounded shadow-md"
                            data-ai-hint="card back"
                          />
                        );
                      }
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
        <Card className="mt-6 bg-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><HelpCircle className="mr-2 h-6 w-6 text-primary" />Next Steps (Multiplayer)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>Card display is set up for individual player views using placeholder images. You'll need to replace the `imageSrc` in `createStandard52Deck` (or a similar function for a 108-card deck) with actual URLs to your card images.</p>
            <p>To continue with multiplayer, you'll need to implement backend WebSocket logic for:</p>
            <ul className="list-disc list-inside pl-4">
              <li>Managing turns.</li>
              <li>Handling card drawing (from deck or discard pile).</li>
              <li>Handling card discarding.</li>
              <li>Synchronizing these actions across all players.</li>
            </ul>
            <p className="mt-2">For now, you can proceed with score entry for rounds.</p>
          </CardContent>
        </Card>
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
}

// Helper to get the correct image path for each card
function getCardImageSrc(card: CardType) {
  return `/assets/${card.rank}_of_${card.suit}.png`;
}

// Type guard for gameStatus
function isGameOver(phase: GameState) {
  return phase === 'game_over';
}

export function GameBoard({ playerId, room, onPeekDone, onReplaceCard, onDiscardCard, onCallStop, onNewGame }: GameBoardProps) {
  const currentRound = Math.max(0, ...room.players.map((p: Player) => p.scoresByRound.length));
  // All state comes from props; no local state needed for multiplayer
  const { toast } = useToast();
  const [bottomRowPeeked, setBottomRowPeeked] = useState<boolean>(false);
  const [drawnPile, setDrawnPile] = useState<'deck' | 'discard' | null>(null);

  // Main gameplay logic
  const player = room.players.find((p: Player) => p.id === playerId);
  const isMyTurn = playerId === room.currentTurnPlayerId;
  const peekPhase = room.gameState === 'peeking';
  const currentPlayer = room.players.find((p: Player) => p.id === room.currentTurnPlayerId);
  const canReplaceBottomRow = player?.canReplaceBottom || false;

  const handlePeekDone = () => {
    setBottomRowPeeked(true);

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
      {/* Show turn indicator */}
      <div className="text-center mb-4">
        {peekPhase ? (
          <span className="text-lg font-semibold text-primary">{currentPlayer?.name}'s turn to peek at their bottom row</span>
        ) : (
          <span className="text-lg font-semibold text-primary">Current turn: {currentPlayer?.name}</span>
        )}
      </div>
      {/* Show hands with peek logic only during peek phase */}
      <PlayerHandsDisplay players={room.players} currentPlayerId={room.currentTurnPlayerId || null} bottomRowPeeked={bottomRowPeeked} peekPhase={peekPhase} onDonePeek={handlePeekDone} />
      {/* Draw/replace/discard UI for current player after peek phase */}
      {!peekPhase && isMyTurn && !isGameOver(room.gameState) && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <Button onClick={handleDrawFromDeck} disabled={room.deck.length === 0}>Draw from Deck</Button>
            <Button onClick={handleDrawFromDiscard} disabled={room.discard.length === 0}>Draw from Discard</Button>
          </div>
        </div>
      )}
      {/* Show drawn card and allow replace/discard */}
      {!peekPhase && isMyTurn && !isGameOver(room.gameState) && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="mb-2 font-semibold">You drew:</span>
            {drawnPile && (
              <Image src={getCardImageSrc(drawnPile === 'deck' ? room.deck[0] : room.discard[0])} alt={drawnPile === 'deck' ? room.deck[0].rank + " of " + room.deck[0].suit : room.discard[0].rank + " of " + room.discard[0].suit} width={70} height={100} className="rounded shadow-md" />
            )}
            {!drawnPile && (
              <span className="text-muted-foreground">No card drawn</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Replace a card:</span>
            <div className="flex gap-2">
              {player?.hand.top.map((card: CardType, idx: number) => (
                <Button key={idx} onClick={() => handleReplaceCard('top', idx, 'deck')}>
                  <Image src={getCardImageSrc(card)} alt={card.rank + " of " + card.suit} width={40} height={60} className="inline-block mr-1 align-middle" />
                  {card.rank + " of " + card.suit}
                </Button>
              ))}
              {/* Bottom row only if canReplaceBottom is true */}
              {canReplaceBottomRow && player?.hand.bottom.map((card: CardType, idx: number) => (
                <Button key={idx} onClick={() => handleReplaceCard('bottom', idx, 'deck')}>
                  <Image src={getCardImageSrc(card)} alt={card.rank + " of " + card.suit} width={40} height={60} className="inline-block mr-1 align-middle" />
                  {card.rank + " of " + card.suit}
                </Button>
              ))}
            </div>
            <Button onClick={handleDiscardCard} variant="outline">Discard</Button>
          </div>
        </div>
      )}
      {/* Waiting message for non-active players after peek phase */}
      {!peekPhase && !isMyTurn && !isGameOver(room.gameState) && (
        <div className="text-center text-lg text-muted-foreground font-semibold mt-8">
          Waiting for your turn...
        </div>
      )}
      {/* STOP button for current player */}
      {!peekPhase && isMyTurn && !isGameOver(room.gameState) && (
        <div className="flex justify-center mt-4">
          <Button onClick={onCallStop} variant="destructive">Call STOP</Button>
        </div>
      )}
      {/* Scoreboard and round info */}
      <Scoreboard players={room.players} currentRound={currentRound} />
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
          <Scoreboard players={room.players} currentRound={currentRound} />
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
                  return winner ? `${winner.name} is the winner with ${winner.totalScore} points!` : 'Scores are final!';
                })()}
              </p>
              <Button onClick={onNewGame} size="lg" variant="secondary" className="text-lg">
                <RotateCcw className="mr-2 h-5 w-5" /> Start New Game
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      <Button onClick={onNewGame} variant="outline" className="mt-8">
        <RotateCcw className="mr-2 h-5 w-5" /> Start New Game
      </Button>
    </div>
  );
}
