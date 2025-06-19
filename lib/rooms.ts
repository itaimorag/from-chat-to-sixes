import { Room, User } from "./types";

class RoomStore {
  private static instance: RoomStore;
  private rooms: Map<string, Room>;

  private constructor() {
    this.rooms = new Map();
  }

  public static getInstance(): RoomStore {
    if (!RoomStore.instance) {
      RoomStore.instance = new RoomStore();
    }
    return RoomStore.instance;
  }

  public getRoom(id: string) {
    console.log("rooms", this.rooms);
    return this.rooms.get(id);
  }

  public createRoom(id: string, maxUsers: number) {
    const room = { id, users: [], maxUsers };
    this.rooms.set(id, room);
    return room;
  }

  public removeRoom(id: string) {
    this.rooms.delete(id);
  }

  public addUserToRoom(id: string, user: User) {
    const room = this.getRoom(id);
    if (!room) return;
    if (room.users.length >= room.maxUsers) return;
    room.users.push(user);
    return room;
  }

  public removeUserFromRoom(id: string, userId: string) {
    const room = this.getRoom(id);
    if (!room) return;
    room.users = room.users.filter((user) => user.id !== userId);
    return room;
  }

  public isRoomFull(id: string) {
    const room = this.getRoom(id);
    if (!room) return false;
    return room.users.length >= room.maxUsers;
  }

  public getAllRooms() {
    return Array.from(this.rooms.values());
  }
}

const roomStore = RoomStore.getInstance();

export const getRoom = (id: string) => roomStore.getRoom(id);
export const createRoom = (id: string, maxUsers: number) =>
  roomStore.createRoom(id, maxUsers);
export const removeRoom = (id: string) => roomStore.removeRoom(id);
export const addUserToRoom = (id: string, user: User) =>
  roomStore.addUserToRoom(id, user);
export const removeUserFromRoom = (id: string, userId: string) =>
  roomStore.removeUserFromRoom(id, userId);
export const isRoomFull = (id: string) => roomStore.isRoomFull(id);
export const getAllRooms = () => roomStore.getAllRooms();
