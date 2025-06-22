import { Room, Player, Card, Suit, Rank } from "./types";
import { mongoClientPromise } from "./mongodb";
import { createShuffled104Deck, PLAYER_HAND_SIZE, shuffleDeck } from "./sixes";

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];

const DB_NAME = "chat-db";
const ROOMS_COLLECTION = "rooms";

async function getRoomCollection() {
  const client = await mongoClientPromise;
  const db = client.db(DB_NAME);
  const rooms = db.collection(ROOMS_COLLECTION);

  return rooms;
}

export const getRoom = async (id: string): Promise<Room | null> => {
  const rooms = await getRoomCollection();
  const data = await rooms.findOne({ id });

  return data as Room | null;
};

export const updateRoom = async (room: Room): Promise<Room | null> => {
  const rooms = await getRoomCollection();
  await rooms.updateOne({ id: room.id }, { $set: room });

  return room;
};

export const createRoom = async (
  id: string,
  maxUsers: number
): Promise<Room> => {
  const room: Room = { 
    id, 
    gameState: "waiting_for_players", 
    players: [], 
    maxUsers, 
    deck: createShuffled104Deck(), 
    discard: [], 
    currentTurnPlayerId: undefined, 
    stopperId: undefined,
  }; // TODO change to waiting_for_players

  const rooms = await getRoomCollection();
  await rooms.insertOne(room);

  return room;
};

export const addPlayerToRoom = async (
  roomId: string,
  playerId: string,
  name: string,
  picture: string
): Promise<Room | null> => {
  const room = await getRoom(roomId);
  if (!room) return null;
  if (room.players.length >= room.maxUsers) return room;
  if (room.players.length === 0) {
    room.currentTurnPlayerId = playerId;
    room.adminId = playerId;
  }

  const player = {
    id: playerId,
    room: roomId,
    name,
    picture,
    scoresByRound: [],
    totalScore: 0,
    isStopper: false,
    hand: { top: room.deck.splice(0, PLAYER_HAND_SIZE), bottom: room.deck.splice(0, PLAYER_HAND_SIZE) },
    canReplaceBottom: true,
    hasPeeked: false,
    isActive: true,
  };

  room.players.push(player);

  await updateRoom(room);
  
  return room;
};

export const removePlayerFromRoom = async (
  id: string,
  playerId: string
): Promise<Room | null> => {
  const room = await getRoom(id);

  if (!room) return null;

  const playerIndex = room.players.findIndex((u) => u.id === playerId);
  const player = room.players.splice(playerIndex, 1)[0];

  // Put the cards back in the deck
  room.deck.push(...player.hand.top, ...player.hand.bottom);

  if (room.players.length === 0) {
    console.log(`Room ${id} deleted because it is empty.`);
    await removeRoom(id);
    
    return null;
  } else {
    if (room.currentTurnPlayerId === playerId) {
      room.currentTurnPlayerId = room.players[0].id;
    }
  
    if (room.adminId === playerId) {
      room.adminId = room.players[0].id;
    }

    await updateRoom(room);
  }

  return room;
};

export const setPlayerActive = async (id: string, playerId: string, isActive: boolean): Promise<Room | null> => {
  const room = await getRoom(id);

  if (!room) return null;

  const player = room.players.find((u) => u.id === playerId);
  if (!player) return room;
  player.isActive = isActive;

  if (!isActive && room.adminId === playerId) {
    room.adminId = room.players.find((u) => u.isActive)?.id;
  }

  if (!room.adminId) {
    console.log(`Room ${id} deleted because it is empty.`);
    await removeRoom(id);

    return null;
  } else {
    await updateRoom(room);
  }

  return room;
};

export const removeRoom = async (id: string) => {
  const rooms = await getRoomCollection();
  await rooms.deleteOne({ id });
};

export const isRoomFull = async (id: string): Promise<boolean> => {
  const room = await getRoom(id);

  if (!room) return false;

  return room.players.length >= room.maxUsers;
};

export const setAdmin = async (id: string, playerId: string): Promise<Room | null> => {
  const room = await getRoom(id);

  if (!room) return null;

  const player = room.players.find((u) => u.id === playerId);
  if (!player || !player.isActive) return room;

  room.adminId = playerId;

  await updateRoom(room);

  return room;
};