"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.peekDone = exports.newGame = exports.callStop = exports.startGame = exports.discardCard = exports.replaceCard = exports.shuffleDeck = exports.createShuffled104Deck = exports.PLAYER_HAND_SIZE = void 0;
const rooms_1 = require("./rooms");
exports.PLAYER_HAND_SIZE = 3;
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];
// Generates a standard 52-card deck
const createShuffled104Deck = () => {
    let deck = [];
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
    deck = (0, exports.shuffleDeck)(deck);
    return deck;
};
exports.createShuffled104Deck = createShuffled104Deck;
// Helper: Sixes scoring logic
const getCardValue = (rank) => {
    if (rank === 'king')
        return 0;
    if (['jack', 'queen'].includes(rank))
        return 10;
    if (['ace'].includes(rank))
        return 1; // Ace is 1
    return parseInt(rank);
};
const calculateSixesHandScore = (hand) => {
    // Combine all cards
    const all = [...hand.top, ...hand.bottom];
    // Count by rank
    const rankCount = new Map();
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
const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
exports.shuffleDeck = shuffleDeck;
const replaceCard = (playerId, roomId, row, idx, pile) => __awaiter(void 0, void 0, void 0, function* () {
    makeTurn(playerId, roomId, (room, player) => {
        const discardedCard = player.hand[row][idx];
        if (row === 'bottom') {
            if (!player.canReplaceBottom)
                return;
        }
        else {
            player.canReplaceBottom = false;
        }
        if (pile === 'deck') {
            if (room.deck.length === 0)
                return;
            player.hand[row][idx] = room.deck.shift();
            if (room.deck.length === 1) {
                room.deck = (0, exports.shuffleDeck)(room.discard);
                room.discard = [];
            }
        }
        else {
            if (room.discard.length === 0)
                return;
            player.hand[row][idx] = room.discard.shift();
        }
        return discardedCard;
    });
});
exports.replaceCard = replaceCard;
const makeTurn = (playerId, roomId, performAction) => __awaiter(void 0, void 0, void 0, function* () {
    let room = yield (0, rooms_1.getRoom)(roomId);
    if (!room)
        return;
    if ((room.gameState === 'playing' || room.gameState === 'final_round') && room.currentTurnPlayerId === playerId) {
        const player = room.players.find((p) => p.id === playerId);
        if (!player)
            return;
        const discardedCard = performAction(room, player);
        if (discardedCard) {
            room.discard.unshift(discardedCard);
        }
        room.currentTurnPlayerId = room.players[(room.players.indexOf(player) + 1) % room.players.length].id;
        if (room.gameState === 'final_round' && room.currentTurnPlayerId === room.stopperId) {
            room = handleGameOver(room);
        }
        yield (0, rooms_1.updateRoom)(room);
    }
});
const discardCard = (playerId, roomId) => __awaiter(void 0, void 0, void 0, function* () {
    makeTurn(playerId, roomId, (room, player) => {
        if (room.deck.length === 0)
            return;
        if (room.deck.length === 1) {
            room.deck = (0, exports.shuffleDeck)(room.discard);
            room.discard = [];
        }
        return room.deck.shift();
    });
});
exports.discardCard = discardCard;
const startGame = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield (0, rooms_1.getRoom)(roomId);
    if (!room || room.gameState !== 'waiting_for_players')
        return;
    room.gameState = 'peeking';
    room.currentTurnPlayerId = room.players[0].id;
    yield (0, rooms_1.updateRoom)(room);
});
exports.startGame = startGame;
const handleGameOver = (room) => {
    room.gameState = 'game_over';
    room.currentTurnPlayerId = undefined;
    room.stopperId = undefined;
    room.players.forEach((player) => {
        const score = calculateSixesHandScore(player.hand);
        player.scoresByRound.push(score);
        player.totalScore += score;
    });
    return room;
};
const callStop = (playerId, roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield (0, rooms_1.getRoom)(roomId);
    if (!room)
        return;
    if (room.gameState === 'playing' && room.currentTurnPlayerId === playerId) {
        const player = room.players.find((p) => p.id === playerId);
        if (!player)
            return;
        room.stopperId = playerId;
        room.gameState = 'final_round';
        room.currentTurnPlayerId = room.players[(room.players.indexOf(player) + 1) % room.players.length].id;
        yield (0, rooms_1.updateRoom)(room);
    }
});
exports.callStop = callStop;
const newGame = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield (0, rooms_1.getRoom)(roomId);
    if (!room)
        return;
    const deck = (0, exports.createShuffled104Deck)();
    room.deck = deck;
    room.discard = [];
    room.players.forEach((player) => {
        player.hand = { top: deck.splice(0, exports.PLAYER_HAND_SIZE), bottom: deck.splice(0, exports.PLAYER_HAND_SIZE) };
        player.hasPeeked = false;
    });
    room.gameState = 'waiting_for_players';
    room.currentTurnPlayerId = undefined;
    room.stopperId = undefined;
    yield (0, rooms_1.updateRoom)(room);
});
exports.newGame = newGame;
const peekDone = (playerId, roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield (0, rooms_1.getRoom)(roomId);
    if (!room)
        return;
    if (room.gameState === 'peeking') {
        const player = room.players.find((p) => p.id === playerId);
        if (!player)
            return;
        player.hasPeeked = true;
        if (room.players.every((p) => p.hasPeeked)) {
            room.gameState = 'playing';
            room.currentTurnPlayerId = room.players[0].id;
        }
        yield (0, rooms_1.updateRoom)(room);
    }
});
exports.peekDone = peekDone;
