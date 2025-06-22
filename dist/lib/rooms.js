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
exports.setAdmin = exports.isRoomFull = exports.removeRoom = exports.setPlayerActive = exports.removePlayerFromRoom = exports.addPlayerToRoom = exports.createRoom = exports.updateRoom = exports.getRoom = void 0;
const mongodb_1 = require("./mongodb");
const sixes_1 = require("./sixes");
const SUITS = ["hearts", "diamonds", "clubs", "spades"];
const RANKS = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king",
    "ace",
];
const DB_NAME = "chat-db";
const ROOMS_COLLECTION = "rooms";
function getRoomCollection() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield mongodb_1.mongoClientPromise;
        const db = client.db(DB_NAME);
        const rooms = db.collection(ROOMS_COLLECTION);
        return rooms;
    });
}
const getRoom = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield getRoomCollection();
    const data = yield rooms.findOne({ id });
    return data;
});
exports.getRoom = getRoom;
const updateRoom = (room) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield getRoomCollection();
    yield rooms.updateOne({ id: room.id }, { $set: room });
    return room;
});
exports.updateRoom = updateRoom;
const createRoom = (id, maxUsers) => __awaiter(void 0, void 0, void 0, function* () {
    const room = {
        id,
        gameState: "waiting_for_players",
        players: [],
        maxUsers,
        deck: (0, sixes_1.createShuffled104Deck)(),
        discard: [],
        currentTurnPlayerId: undefined,
        stopperId: undefined,
    }; // TODO change to waiting_for_players
    const rooms = yield getRoomCollection();
    yield rooms.insertOne(room);
    return room;
});
exports.createRoom = createRoom;
const addPlayerToRoom = (roomId, playerId, name, picture) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("addPlayerToRoom", roomId, playerId, name, picture);
    const room = yield (0, exports.getRoom)(roomId);
    console.log("addPlayerToRoom room", room);
    if (!room)
        return null;
    if (room.players.length >= room.maxUsers)
        return room;
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
        hand: {
            top: room.deck.splice(0, sixes_1.PLAYER_HAND_SIZE),
            bottom: room.deck.splice(0, sixes_1.PLAYER_HAND_SIZE),
        },
        canReplaceBottom: true,
        hasPeeked: false,
        isActive: true,
    };
    room.players.push(player);
    console.log("suppose to add player", player);
    yield (0, exports.updateRoom)(room);
    return room;
});
exports.addPlayerToRoom = addPlayerToRoom;
const removePlayerFromRoom = (id, playerId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield (0, exports.getRoom)(id);
    if (!room)
        return null;
    const playerIndex = room.players.findIndex((u) => u.id === playerId);
    const player = room.players.splice(playerIndex, 1)[0];
    // Put the cards back in the deck
    room.deck.push(...player.hand.top, ...player.hand.bottom);
    if (room.players.length === 0) {
        console.log(`Room ${id} deleted because it is empty.`);
        yield (0, exports.removeRoom)(id);
        return null;
    }
    else {
        if (room.currentTurnPlayerId === playerId) {
            room.currentTurnPlayerId = room.players[0].id;
        }
        if (room.adminId === playerId) {
            room.adminId = room.players[0].id;
        }
        yield (0, exports.updateRoom)(room);
    }
    return room;
});
exports.removePlayerFromRoom = removePlayerFromRoom;
const setPlayerActive = (id, playerId, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const room = yield (0, exports.getRoom)(id);
    if (!room)
        return null;
    const player = room.players.find((u) => u.id === playerId);
    if (!player)
        return room;
    player.isActive = isActive;
    if (!isActive && room.adminId === playerId) {
        room.adminId = (_a = room.players.find((u) => u.isActive)) === null || _a === void 0 ? void 0 : _a.id;
    }
    if (!room.adminId) {
        console.log(`Room ${id} deleted because it is empty.`);
        yield (0, exports.removeRoom)(id);
        return null;
    }
    else {
        yield (0, exports.updateRoom)(room);
    }
    return room;
});
exports.setPlayerActive = setPlayerActive;
const removeRoom = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield getRoomCollection();
    yield rooms.deleteOne({ id });
});
exports.removeRoom = removeRoom;
const isRoomFull = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield (0, exports.getRoom)(id);
    if (!room)
        return false;
    return room.players.length >= room.maxUsers;
});
exports.isRoomFull = isRoomFull;
const setAdmin = (id, playerId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield (0, exports.getRoom)(id);
    if (!room)
        return null;
    const player = room.players.find((u) => u.id === playerId);
    if (!player || !player.isActive)
        return room;
    room.adminId = playerId;
    yield (0, exports.updateRoom)(room);
    return room;
});
exports.setAdmin = setAdmin;
