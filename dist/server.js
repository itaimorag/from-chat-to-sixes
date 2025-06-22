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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: ".env.local" });
const http_1 = __importDefault(require("http"));
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const mongodb_1 = require("./lib/mongodb");
const initChangeStream_1 = require("./lib/initChangeStream");
const rooms_1 = require("./lib/rooms");
const sixes_1 = require("./lib/sixes");
const eventconst_1 = require("./lib/eventconst");
const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
const httpServer = http_1.default.createServer((req, res) => handle(req, res));
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_CLIENT_URL,
        methods: ["GET", "POST"],
    },
});
// ✅ Authorization middleware
// io.use((socket, next) => { TODO: add token
//   try {
//     const token = socket.handshake.auth.token;
//     if (!token) throw new Error("Missing token");
//     const user = verifyToken(token);
//     socket.data.user = user; // attach user to socket
//     next();
//   } catch (err) {
//     next(new Error("Unauthorized"));
//   }
// });
// ✅ Socket logic after authentication
io.on("connection", (socket) => {
    const { roomId, name, picture } = socket.handshake.query; // TODO Receive in the actual join_room event
    let playerId = socket.handshake.query.playerId;
    if (!playerId) {
        playerId = crypto.randomUUID();
    }
    console.log(`${name} connected`);
    // Here you can check if the user has access to the room
    socket.join(roomId);
    (() => __awaiter(void 0, void 0, void 0, function* () {
        let room = yield (0, rooms_1.getRoom)(roomId);
        if (!room) {
            room = yield (0, rooms_1.createRoom)(roomId, 4); // TODO change maxUsers
        }
        const player = room.players.find((p) => p.id === playerId);
        if (player) {
            yield (0, rooms_1.setPlayerActive)(roomId, playerId, true);
        }
        else {
            playerId = crypto.randomUUID();
            yield (0, rooms_1.addPlayerToRoom)(roomId, playerId, name, picture);
            socket.emit(eventconst_1.PLAYER_ID_EVENT, playerId);
        }
    }))();
    socket.on(eventconst_1.REPLACE_CARD_EVENT, (row, idx, pile) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, sixes_1.replaceCard)(playerId, roomId, row, idx, pile);
    }));
    socket.on(eventconst_1.DISCARD_CARD_EVENT, () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, sixes_1.discardCard)(playerId, roomId);
    }));
    socket.on(eventconst_1.CALL_STOP_EVENT, () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, sixes_1.callStop)(playerId, roomId);
    }));
    socket.on(eventconst_1.NEW_GAME_EVENT, () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, sixes_1.newGame)(roomId);
    }));
    socket.on(eventconst_1.PEEK_DONE_EVENT, () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, sixes_1.peekDone)(playerId, roomId);
    }));
    socket.on(eventconst_1.KICK_PLAYER_EVENT, (playerId) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, rooms_1.removePlayerFromRoom)(roomId, playerId);
    }));
    socket.on(eventconst_1.START_GAME_EVENT, () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, sixes_1.startGame)(roomId);
    }));
    socket.on(eventconst_1.MAKE_ADMIN_EVENT, (playerId) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, rooms_1.setAdmin)(roomId, playerId);
    }));
    socket.on("disconnect", (reason) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`${name} disconnected: ${reason}`);
        try {
            yield (0, rooms_1.setPlayerActive)(roomId, playerId, false);
            socket.leave(roomId);
        }
        catch (err) {
            console.error("Error during disconnect cleanup:", err);
        }
    }));
});
app
    .prepare()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield mongodb_1.mongoClientPromise;
    const db = client.db("chat-db");
    // Optional: watch MongoDB changes (if you're using it)
    (0, initChangeStream_1.initChangeStream)(io, db);
    httpServer.listen(PORT, () => {
        console.log(`✅ Server running at port ${PORT}`);
    });
}))
    .catch((err) => {
    console.error("❌ Error during app.prepare():", err);
});
