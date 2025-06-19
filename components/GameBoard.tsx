
"use client";

import type { Player, GameState as GameStatusType, Card as CardType, Suit, Rank } from '@/lib/types';
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

// Helper functions for card names
const SUITS_MAP: Record<Suit, string> = { 'S': 'Spades', 'H': 'Hearts', 'D': 'Diamonds', 'C': 'Clubs' };
const RANKS_MAP: Record<Rank, string> = { 'A': 'Ace', 'K': 'King', 'Q': 'Queen', 'J': 'Jack', 'T': 'Ten', '9': '9', '8': '8', '7': '7', '6': '6', '5': '5', '4': '4', '3': '3', '2': '2' };

function getRankName(rank: Rank | 'JOKER'): string {
  if (rank === 'JOKER') return 'Joker';
  return RANKS_MAP[rank];
}

function getSuitName(suit: Suit | 'JOKER'): string {
  if (suit === 'JOKER') return ''; // Jokers don't have a suit name in "Ace of Spades" sense
  return SUITS_MAP[suit];
}


interface PlayerHandDisplayProps {
  players: Player[];
  currentPlayerId: string | null;
}

function PlayerHandsDisplay({ players, currentPlayerId }: PlayerHandDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Shuffle className="mr-2 h-7 w-7 text-primary" />
          Player Hands
        </CardTitle>
        <CardDescription>Each player has 6 cards. Your cards are shown face up. Others are face down.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map(player => (
            <div key={player.id} className="p-4 border rounded-lg bg-card/50">
              <h3 className="text-lg font-semibold text-primary mb-2">{player.name}'s Hand {player.id === currentPlayerId ? "(Your Hand)" : ""}</h3>
              <div className="flex flex-wrap gap-2">
                {(player.hand || []).map((card, i) => {
                  const isCurrentPlayerCard = player.id === currentPlayerId;
                  // For current player, use card.imageSrc (placeholder for now). For others, use a generic card back.
                  const cardImageSrc = isCurrentPlayerCard ? card.imageSrc : "https://placehold.co/70x100.png";
                  const cardAltText = isCurrentPlayerCard ? card.name : `${player.name}'s face-down card ${i + 1}`;
                  
                  let dataAiHint = "card back";
                  if (isCurrentPlayerCard) {
                    if (card.rank === 'JOKER') {
                      dataAiHint = "joker card";
                    } else {
                      // Ensure two words max for data-ai-hint
                      const rankHint = getRankName(card.rank).toLowerCase().split(' ')[0];
                      const suitHint = getSuitName(card.suit).toLowerCase().split(' ')[0];
                      dataAiHint = `${rankHint} ${suitHint}`.trim();
                      if (dataAiHint.split(' ').length > 2) { // Fallback if somehow more than 2 words
                        dataAiHint = rankHint;
                      }
                    }
                  }
                  
                  return (
                    <Image 
                      key={card.id} 
                      src={cardImageSrc} 
                      alt={cardAltText}
                      width={70} // Updated card width
                      height={100} // Updated card height
                      className="rounded shadow-md"
                      data-ai-hint={dataAiHint}
                    />
                  );
                })}
                {(!player.hand || player.hand.length === 0) && Array.from({ length: 6 }).map((_, i) => (
                     <Image 
                        key={`empty-${player.id}-${i}`} 
                        src="https://placehold.co/70x100.png" 
                        alt="Face-down card placeholder" 
                        width={70}
                        height={100} 
                        className="rounded shadow-md opacity-50"
                        data-ai-hint="card back"
                    />
                ))}
              </div>
            </div>
          ))}
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
  initialPlayers: Player[];
  onNewGame: () => void;
  currentPlayerId: string | null;
}

const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

// Generates a standard 52-card deck
function createStandard52Deck(): CardType[] {
  const deck: CardType[] = [];
  let cardCount = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cardCount++;
      const cardName = `${getRankName(rank)} of ${getSuitName(suit)}`;
      deck.push({
        // id: `${suit}${rank}-${cardCount}`, // Simpler ID for unique card type
        id: `card-${suit}${rank}-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Unique ID for card instance
        suit,
        rank,
        name: cardName,
        // Replace this placeholder with your actual image URL for each card
        imageSrc: `https://placehold.co/70x100.png`, 
      });
    }
  }
  return deck;
}

/*
// Optional: For a full Sixes game, you'd typically use 108 cards (2 standard decks + 4 Jokers)
// You can adapt this function if you want to use 108 cards.
function createSixesDeck(): CardType[] {
  const deck1 = createStandard52Deck().map(card => ({...card, id: `deck1-${card.id}`})); // Ensure unique IDs
  const deck2 = createStandard52Deck().map(card => ({...card, id: `deck2-${card.id}`})); // Ensure unique IDs
  const jokers: CardType[] = Array.from({ length: 4 }, (_, i) => ({
    id: `JOKER${i + 1}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    suit: 'JOKER',
    rank: 'JOKER',
    name: `Joker ${i + 1}`,
    // Replace this placeholder with your actual image URL for Jokers
    imageSrc: `https://placehold.co/70x100.png`, 
  }));
  return [...deck1, ...deck2, ...jokers]; // 104 + 4 = 108 cards
}
*/


// Shuffles a deck of cards
function shuffleDeck(deck: CardType[]): CardType[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


export function GameBoard({ initialPlayers, onNewGame, currentPlayerId }: GameBoardProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers.map(p => ({...p, hand: p.hand || []})));
  const [currentRound, setCurrentRound] = useState(1);
  const [gameStatus, setGameStatus] = useState<GameStatusType>('playing');
  const [stopperId, setStopperId] = useState<string | null>(null);
  const [mainDeck, setMainDeck] = useState<CardType[]>([]);
  const [cardsRemainingInDeck, setCardsRemainingInDeck] = useState(0); 
  const [cardsInDiscardPile, setCardsInDiscardPile] = useState(0); 
  const [firstRoundScoresSubmitted, setFirstRoundScoresSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize game: deal cards, set up deck
    // Using a 52-card deck as per the image request. 
    // For a full Sixes game, you might use createSixesDeck() (108 cards).
    let deck = shuffleDeck(createStandard52Deck()); 
    
    const updatedPlayers = initialPlayers.map(player => {
      const hand = deck.splice(0, 6); // Deal 6 cards
      return { ...player, hand: hand, scoresByRound: [], totalScore: 0, isStopper: false };
    });

    setPlayers(updatedPlayers);
    setMainDeck(deck);
    setCardsRemainingInDeck(deck.length);
    setCardsInDiscardPile(0); 

    setCurrentRound(1);
    setGameStatus('playing');
    setStopperId(null);
    setFirstRoundScoresSubmitted(false);

  }, [initialPlayers, currentPlayerId]); 


  const handleScoresSubmit = (roundScores: Record<string, number>) => {
    const updatedPlayers = players.map(player => {
      const scoreForRound = roundScores[player.id];
      if (scoreForRound === undefined) return player; 

      const newScoresByRound = [...player.scoresByRound, scoreForRound];
      let updatedTotalScore = 0;
      newScoresByRound.forEach(rs => {
        updatedTotalScore = calculateNewTotalScore(updatedTotalScore, rs);
      });
      
      return {
        ...player,
        scoresByRound: newScoresByRound,
        totalScore: updatedTotalScore,
      };
    });

    if (currentRound === 1 && !firstRoundScoresSubmitted) {
      setFirstRoundScoresSubmitted(true);
    }

    if (gameStatus === 'final_round') {
      const finalPlayersWithBonuses = applyStopBonusesAndPenalties(updatedPlayers, stopperId);
      setPlayers(finalPlayersWithBonuses);
      setGameStatus('game_over');
      const winner = finalPlayersWithBonuses.reduce((prev, curr) => (curr.totalScore < prev.totalScore ? curr : prev));
      toast({
        title: "Game Over!",
        description: `${winner.name} wins with a score of ${winner.totalScore}!`,
        duration: 5000,
      });
    } else {
      setPlayers(updatedPlayers);
      setCurrentRound(prev => prev + 1);
      toast({
        title: `Round ${currentRound} Complete!`,
        description: `Scores updated. Moving to Round ${currentRound + 1}.`,
      });
    }
  };

  const handleCallStop = (playerId: string) => {
    if (gameStatus === 'playing') {
      setPlayers(prevPlayers => prevPlayers.map(p => p.id === playerId ? {...p, isStopper: true} : p));
      setStopperId(playerId);
      setGameStatus('final_round');
      const player = players.find(p => p.id === playerId);
      toast({
        title: `${player?.name} called STOP!`,
        description: "The next round will be the final round.",
        variant: 'default',
        className: 'bg-accent text-accent-foreground',
      });
    }
  };
  
  const getOtherPlayers = (targetPlayerId: string) => {
    return players.filter(p => p.id !== targetPlayerId);
  };

  if (gameStatus === 'game_over') {
    const winner = players.reduce((prev, curr) => (curr.totalScore < prev.totalScore ? curr : prev), players[0]);
    return (
      <div className="space-y-6">
        <Scoreboard players={players} currentRound={currentRound -1} />
        <Card className="text-center shadow-xl bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-4xl flex items-center justify-center">
              <PartyPopper className="mr-3 h-10 w-10" /> Game Over!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">
              {winner ? `${winner.name} is the winner with ${winner.totalScore} points!` : 'Scores are final!'}
            </p>
            <Button onClick={onNewGame} size="lg" variant="secondary" className="text-lg">
              <RotateCcw className="mr-2 h-5 w-5" /> Start New Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(gameStatus === 'playing' && (!firstRoundScoresSubmitted || currentRound ===1)) && (
         <PlayerHandsDisplay players={players} currentPlayerId={currentPlayerId} />
      )}

      {(firstRoundScoresSubmitted && gameStatus !== 'game_over') && (
        <Scoreboard players={players} currentRound={currentRound - 1} />
      )}

      {players.length > 0 && (
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
                  value={cardsRemainingInDeck} 
                  readOnly 
                  className="text-base h-12 bg-muted/50"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cardsInDiscardPile" className="font-medium">Cards in Discard Pile</Label>
                <Input
                  id="cardsInDiscardPile"
                  type="number"
                  value={cardsInDiscardPile}
                  onChange={(e) => setCardsInDiscardPile(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="text-base h-12"
                />
              </div>
            </CardContent>
          </Card>
      )}


      {gameStatus !== 'game_over' && (
        <RoundScoreForm
          players={players}
          currentRound={currentRound}
          onSubmitScores={handleScoresSubmit}
          isFinalRound={gameStatus === 'final_round'}
        />
      )}
      
      {gameStatus === 'playing' && currentPlayerId && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><CheckSquare className="mr-2 h-7 w-7 text-primary" />Player Actions</CardTitle>
            <CardDescription>Each player can choose to call STOP or get AI advice. These actions are local for now.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => (
              <Card key={player.id} className="p-4 space-y-3 bg-background">
                <h3 className="text-lg font-semibold font-headline text-primary">{player.name}</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => handleCallStop(player.id)} 
                  variant="destructive" 
                  className="flex-grow"
                  disabled={gameStatus !== 'playing' || player.id !== currentPlayerId} 
                  title={player.id !== currentPlayerId ? "You can only call STOP for yourself" : "Call STOP"}
                >
                  <Hand className="mr-2 h-4 w-4" /> Call STOP
                </Button>
                <StopAdvisorDialog 
                  currentPlayer={player} 
                  otherPlayers={getOtherPlayers(player.id)}
                  cardsRemainingInDeck={cardsRemainingInDeck}
                  cardsInDiscardPile={cardsInDiscardPile}
                  triggerButton={
                     <Button variant="outline" className="flex-grow" disabled={player.id !== currentPlayerId}>
                        <Brain className="mr-2 h-4 w-4" /> AI Advice
                     </Button>
                  }
                />
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
       <Button onClick={onNewGame} variant="outline" className="mt-8">
          <RotateCcw className="mr-2 h-5 w-5" /> Start New Game
        </Button>
    </div>
  );
}
