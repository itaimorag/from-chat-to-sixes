import { Room, Player, Card, Suit, Rank } from "./types";
import { getRoom, updateRoom } from "./rooms";

export const PLAYER_HAND_SIZE = 3;
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];

// Generates a standard 52-card deck
export const createShuffled104Deck = (): Card[] => {
  let deck: Card[] = [];
  
  for (let i = 0; i < 2; i++) {
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({
                suit,
                rank
            });
        }
    }
  }

  deck = shuffleDeck(deck);

  return deck;
};

// Helper: Sixes scoring logic
const getCardValue = (rank: Rank): number => {
  if (rank === 'king') return 0;
  if (['jack', 'queen'].includes(rank)) return 10;
  if (['ace'].includes(rank)) return 1; // Ace is 1

  return parseInt(rank);
};

const calculateSixesHandScore = (hand: { top: Card[]; bottom: Card[] }): number => {
  // Combine all cards
  const all = [...hand.top, ...hand.bottom];

  // Count by rank
  const rankCount: Map<Rank, number> = new Map();
  all.forEach(card => {
    rankCount.set(card.rank, (rankCount.get(card.rank) || 0) + 1);
  });

  // Cancel pairs/more
  let score = 0;
  for (const [rank, count] of rankCount) {
    if (count == 1) {
      score += getCardValue(rank);
    }
  }

  return score;
};

// Shuffles a deck of cards
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const replaceCard = async (playerId: string, roomId: string, row: 'top' | 'bottom', idx: number, pile: 'deck' | 'discard'): Promise<void> => {
  makeTurn(playerId, roomId, (room: Room, player: Player) => {
    const discardedCard = player.hand[row][idx];

    if (row === 'bottom') {
      if (!player.canReplaceBottom) return;
    } else {
      player.canReplaceBottom = false;
    }

    if (pile === 'deck') {
      if (room.deck.length === 0) return;

      player.hand[row][idx] = room.deck.shift() as Card;

      if (room.deck.length === 1) {
        room.deck = shuffleDeck(room.discard);
        room.discard = [];
      }
    } else {
      if (room.discard.length === 0) return;
      player.hand[row][idx] = room.discard.shift() as Card;
    }

    return discardedCard;
  });
};

const makeTurn = async (playerId: string, roomId: string, performAction: (room: Room, player: Player) => Card | undefined): Promise<void> => {
  let room = await getRoom(roomId);

  if (!room) return;

  if ((room.gameState === 'playing' || room.gameState === 'final_round') && room.currentTurnPlayerId === playerId) {
    const player = room.players.find((p: Player) => p.id === playerId);
    if (!player) return;

    const discardedCard = performAction(room, player);

    if (discardedCard) {
      room.discard.unshift(discardedCard);
    }

    room.currentTurnPlayerId = room.players[(room.players.indexOf(player) + 1) % room.players.length].id;

    if (room.gameState === 'final_round' && room.currentTurnPlayerId === room.stopperId) {
      room = handleGameOver(room);
    }

    await updateRoom(room);
  }
}

export const discardCard = async (playerId: string, roomId: string): Promise<void> => {

    makeTurn(playerId, roomId, (room: Room, player: Player) => {
      if (room.deck.length === 0) return;
  
      if (room.deck.length === 1) {
        room.deck = shuffleDeck(room.discard);
        room.discard = [];
      }

      return room.deck.shift() as Card;
    });
};

const handleGameOver = (room: Room): Room => {
    room.gameState = 'game_over';
    room.currentTurnPlayerId = undefined;
    room.stopperId = undefined;
    room.players.forEach((player: Player) => {
        const score = calculateSixesHandScore(player.hand);
        player.scoresByRound.push(score);
        player.totalScore += score;
    });

    return room;
};

export const callStop = async (playerId: string, roomId: string): Promise<void> => {
    const room = await getRoom(roomId);

    if (!room) return;

    if (room.gameState === 'playing' && room.currentTurnPlayerId === playerId) {
        const player = room.players.find((p: Player) => p.id === playerId);
        if (!player) return;
        room.stopperId = playerId;
        room.gameState = 'final_round';
        room.currentTurnPlayerId = room.players[(room.players.indexOf(player) + 1) % room.players.length].id;

        await updateRoom(room);
    }
};

export const newGame = async (roomId: string): Promise<void> => {
    const room = await getRoom(roomId);

    if (!room) return;

    const deck = createShuffled104Deck();
    room.deck = deck;
    room.discard = [];
    room.players.forEach((player: Player) => {
        player.hand = { top: deck.splice(0, PLAYER_HAND_SIZE), bottom: deck.splice(0, PLAYER_HAND_SIZE) };
        player.hasPeeked = false;
    });
    room.gameState = 'peeking';
    room.currentTurnPlayerId = room.players[0].id;
    room.stopperId = undefined;

    await updateRoom(room);
};

export const peekDone = async (playerId: string, roomId: string): Promise<void> => {
    const room = await getRoom(roomId);

    if (!room) return;

    if (room.gameState === 'peeking') {
        const player = room.players.find((p: Player) => p.id === playerId);
        if (!player) return;
        player.hasPeeked = true;

        if (room.players.every((p: Player) => p.hasPeeked)) {
        room.gameState = 'playing';
        room.currentTurnPlayerId = room.players[0].id;
        }

        await updateRoom(room);
    }
}