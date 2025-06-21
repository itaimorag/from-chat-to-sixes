export interface UserData {
  name: string;
  picture: string;
}

export interface User {
  id: string;
  room: string;
  name: string;
  picture: string;
}

export interface Room {
  id: string;
  players: Player[];
  gameState: GameState;
  maxUsers: number;
  deck: Card[];
  discard: Card[];
  currentTurnPlayerId?: string;
  stopperId?: string;
}

export interface TypingInfo {
  senderId: string;
  user: User;
}

export interface MessageData {
  body: string;
  senderId: string;
  user: UserData;
}

export interface Message {
  id: string;
  room: string;
  body: string;
  senderId: string;
  user: UserData;
  sentAt: number;
  ownedByCurrentUser?: boolean;
}

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank =
   "ace"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "jack"
  | "queen"
  | "king";

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  picture: string;
  scoresByRound: number[];
  totalScore: number;
  canReplaceBottom: boolean;
  hasPeeked: boolean;
  hand: { top: Card[]; bottom: Card[] }; // Player's current hand of cards
}

export type GameState =
  | "waiting_for_players"
  | "peeking"
  | "playing"
  | "final_round"
  | "game_over";

// State for the form within the StopAdvisorDialog
export interface StopAdvisorDialogFormState {
  myEstimatedScore?: number; // Optional, can be pre-filled
}

// This type was previously AIAdviceDialogInput and included deck/discard counts.
// Those are now managed in GameBoard and passed as props to StopAdvisorDialog.
// Retaining a similar structure for what the dialog itself manages internally for its form.
export type AIAdviceDialogInput = StopAdvisorDialogFormState;
