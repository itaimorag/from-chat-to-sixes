import redis from "./redis";
import { Room, User } from "./types";

const ROOM_PREFIX = "room:";

export const getRoom = async (id: string): Promise<Room | null> => {
  const data = await redis.get<Room>(ROOM_PREFIX + id);
  return data ?? null;
};

export const createRoom = async (
  id: string,
  maxUsers: number
): Promise<Room> => {
  const room: Room = { id, users: [], maxUsers };
  await redis.set(ROOM_PREFIX + id, room);
  return room;
};

export const addUserToRoom = async (
  id: string,
  user: User
): Promise<Room | null> => {
  const room = await getRoom(id);
  if (!room) return null;
  if (room.users.length >= room.maxUsers) return room;
  room.users.push(user);
  await redis.set(ROOM_PREFIX + id, room);
  return room;
};

export const removeUserFromRoom = async (
  id: string,
  userId: string
): Promise<Room | null> => {
  const room = await getRoom(id);
  if (!room) return null;
  room.users = room.users.filter((u) => u.id !== userId);
  await redis.set(ROOM_PREFIX + id, room);
  return room;
};

export const removeRoom = async (id: string) => {
  await redis.del(ROOM_PREFIX + id);
};

export const isRoomFull = async (id: string): Promise<boolean> => {
  const room = await getRoom(id);
  if (!room) return false;
  return room.users.length >= room.maxUsers;
};
