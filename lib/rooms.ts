import redis from "./redis";
import { Room, Player } from "./types";

const ROOM_PREFIX = "room:";

export const getRoom = async (id: string): Promise<Room | null> => {
  const data = await redis.get<Room>(ROOM_PREFIX + id);
  return data ?? null;
};

export const createRoom = async (
  id: string,
  maxUsers: number
): Promise<Room> => {
  const room: Room = { id, gameState: "playing", players: [], maxUsers }; // TODO change to waiting_for_players
  await redis.set(ROOM_PREFIX + id, room);

  return room;
};

export const addPlayerToRoom = async (
  id: string,
  player: Player
): Promise<Room | null> => {
  const room = await getRoom(id);
  if (!room) return null;
  if (room.players.length >= room.maxUsers) return room;
  room.players.push(player);
  await redis.set(ROOM_PREFIX + id, room);
  return room;
};

export const removePlayerFromRoom = async (
  id: string,
  playerId: string
): Promise<Room | null> => {
  const room = await getRoom(id);

  if (!room) return null;

  room.players = room.players.filter((u) => u.id !== playerId);
  await redis.set(ROOM_PREFIX + id, room);

  return room;
};

export const removeRoom = async (id: string) => {
  await redis.del(ROOM_PREFIX + id);
};

export const isRoomFull = async (id: string): Promise<boolean> => {
  const room = await getRoom(id);

  if (!room) return false;

  return room.players.length >= room.maxUsers;
};
